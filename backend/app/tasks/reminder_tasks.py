import asyncio
import json
import smtplib
from email.mime.text import MIMEText

import pywebpush

from app.core.config import settings
from app.core.database import create_session_factory
from app.core.templates import render_template
from app.models.enums import ReminderChannel, ReminderStatus, TaskStatus
from app.models.webpush import WebPushSubscription
from app.repositories.reminder_repo import ReminderRepository
from app.repositories.webpush_repo import WebPushRepository
from celery_config import celery_app
import logging

logger = logging.getLogger(__name__)


@celery_app.task
def check_reminders():
    asyncio.run(_check_reminders())


async def _check_reminders():
    SessionLocal = create_session_factory()
    async with SessionLocal() as session:
        repo = ReminderRepository(session)

        reminders = await repo.get_pending_to_send()

        for reminder in reminders:
            send_reminder.delay(reminder.id)  # type: ignore


@celery_app.task(bind=True, max_retries=3)
def send_reminder(self, reminder_id: int):
    try:
        asyncio.run(_send_reminder(reminder_id))
    except Exception as exc:
        print(f"Email sending failed: {exc}")
        raise self.retry(exc=exc, countdown=60)


async def _send_reminder(reminder_id: int):
    SessionLocal = create_session_factory()
    async with SessionLocal() as session:
        reminder_repo = ReminderRepository(session)

        reminder = await reminder_repo.get_by_id_for_worker(reminder_id)
        if not reminder:
            return

        # Check status is pending
        if reminder.status != ReminderStatus.PENDING:
            return

        # Defense for duble
        success = await reminder_repo.set_processing_if_pending(reminder.id)  # type: ignore
        if not success:
            return

        task = reminder.task
        # task = await task_repo.get_by_id_for_worker(reminder.task_id)
        if not task:
            return

        if task.status == TaskStatus.DONE:
            reminder.status = ReminderStatus.CANCELED
            await reminder_repo.update(reminder)
            return

        user = reminder.task.task_list.project.owner  # type: ignore
        webpush_repo = WebPushRepository(session)
        subscriptions = await webpush_repo.get_by_user_id(user.id)

        if not user.email_notifications and not user.webpush_notifications:
            reminder.status = ReminderStatus.CANCELED
            await reminder_repo.update(reminder)
            return

        email_sent = False
        push_sent = False
        invalid_subscription_ids = []

        if user.email_notifications:
            try:
                reminder_data = {
                    'reminder_id': reminder.id,
                    'task_id': task.id,
                    'task_title': task.title,
                    'reminder_at': reminder.reminder_at,
                    'to_email': user.email,
                }
                await asyncio.to_thread(
                    send_reminder_via_email,
                    reminder_data
                )
                email_sent = True
            except Exception as exc:
                print(f"Email sending failed: {exc}")

        if user.webpush_notifications and subscriptions:
            for sub in subscriptions:
                try:
                    await asyncio.to_thread(
                        send_web_push_notification,
                        sub,
                        title="Напоминание о задаче",
                        body=f"Не забудьте: {task.title}"
                    )
                    logger.info(f"Push sent successfully "
                                f"to subscription {sub.id}"
                                )
                    push_sent = True
                except pywebpush.WebPushException as exc:
                    status_code = (
                        exc.response.status_code 
                    
                    )
                    logger.warning(f"Push failed for "
                                   f"subscription {sub.id}, "
                                    f"status={status_code}"
                                    )
                    if status_code in [400, 401, 403, 404, 410]:
                        invalid_subscription_ids.append(sub.id)
                except Exception:
                    logger.exception(f"Unexpected error while "
                                     f"sending to subscription {sub.id}"
                    )

            if invalid_subscription_ids:
                await webpush_repo.delete_by_ids(
                    invalid_subscription_ids
                )

        if email_sent or push_sent:
            reminder.status = ReminderStatus.SENT
        else:
            reminder.status = ReminderStatus.CANCELED

        await reminder_repo.update(reminder)


def send_reminder_via_email(reminder_data: dict):
    context = {
        "task_title": reminder_data.get('task_title')
    }
    subject = f'Напоминание о задаче - {reminder_data.get('task_title')}'
    html_body = render_template('reminderTask.html', context)

    msg = MIMEText(html_body, 'html')
    msg['Subject'] = subject
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = reminder_data.get("to_email")  # type: ignore

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception:
        logger.error("Email sending failed", exc_info=True)


def send_web_push_notification(
        subscription: WebPushSubscription,
        title: str,
        body: str
):
    payload = {
        "title": title,
        "body": body,
    }
    logger.info(payload)

    pywebpush.webpush(
        subscription_info={
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh,
                "auth": subscription.auth
            }
        },
        data=json.dumps({
        "title": title,
        "body": body
        }),
        vapid_private_key=settings.VAPID_PRIVATE_KEY,
        vapid_claims={
            "sub": settings.VAPID_SUBJECT
        }
    )
