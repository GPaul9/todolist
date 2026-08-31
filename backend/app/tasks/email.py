from email.message import EmailMessage
import smtplib
from app.core.config import settings
from celery import shared_task
from jinja2 import Environment, FileSystemLoader  # ← Замените starlette.templating

# Создайте глобальный Jinja2 окружение (для эффективности)
jinja_env = Environment(loader=FileSystemLoader(str(settings.TEMPLATES_DIR)))


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_email_task(self, to_email: str, first_name: str, token: str):
    verification_url = f"{settings.FRONTEND_URL}/auth/confirm/verify?token={token}"
    
    # 1. Load template через jinja2
    template = jinja_env.get_template(name="confirmEmail.html")
    html_content = template.render(
        verification_url=verification_url,
        first_name=first_name
    )
    
    # 2. Create email message
    msg = EmailMessage()
    msg.add_alternative(html_content, subtype="html")
    msg['Subject'] = 'Подтверждение email регистрации'
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = to_email
    
    # 3. Send email
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as exc:
        print(f"Email sending failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_verification_new_email_task(self, to_email: str, first_name: str, token: str):
    confirm_email_change_url = f"{settings.FRONTEND_URL}/auth/confirm/verify-email-change?token={token}"
    
    template = jinja_env.get_template(name="confirmChangeEmail.html")
    html_content = template.render(
        confirm_email_change_url=confirm_email_change_url
    )
    
    msg = EmailMessage()
    msg.add_alternative(html_content, subtype="html")
    msg['Subject'] = 'Подтверждение смены email'
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = to_email
    
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as exc:
        print(f"Email sending failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_reset_email_task(self, to_email: str, token: str):
    reset_url = f"{settings.FRONTEND_URL}/auth/reset/verify?token={token}"
    
    template = jinja_env.get_template(name="resetPassword.html")
    html_content = template.render(reset_url=reset_url)
    
    msg = EmailMessage()
    msg.add_alternative(html_content, subtype="html")
    msg['Subject'] = 'Уведомление о сбросе пароля'
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = to_email
    
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as exc:
        print(f"Email sending failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_email_change_request_task(self, to_email: str, token: str):
    """Уведомление о подозрительном запросе смены почты"""
    logout_all_sessions_url = f"{settings.FRONTEND_URL}/account/security?token={token}"
    
    template = jinja_env.get_template(name="noticeRequestChangeEmail.html")  # ← Исправите ""
    html_content = template.render(logout_all_sessions_url=logout_all_sessions_url)
    
    msg = EmailMessage()
    msg.add_alternative(html_content, subtype="html")
    msg['Subject'] = 'Уведомление о смене почты аккаунта'
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = to_email
    
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as exc:
        print(f"Email notification for email change request failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_new_device_login_task(self, to_email: str, location_info: str, login_time: str, device_info: str, token: str):
    """Уведомление о входе с нового IP и устройства"""
    security_url = f"{settings.FRONTEND_URL}/account/security?token={token}"
    
    template = jinja_env.get_template(name="noticeNewUser.html")
    html_content = template.render(
        security_url=security_url,
        location_info=location_info,
        login_time=login_time,
        device_info=device_info
    )
    
    msg = EmailMessage()
    msg.add_alternative(html_content, subtype="html")
    msg['Subject'] = 'Вход с нового IP, устройства, локации'
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = to_email
    
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as exc:
        print(f"Email notification for new device login failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def notify_password_change_task(self, to_email: str):
    """Уведомление о смене пароля"""
    
    template = jinja_env.get_template(name="noticeChangePassword.html")
    html_content = template.render()
    
    msg = EmailMessage()
    msg.add_alternative(html_content, subtype="html")
    msg['Subject'] = 'Уведомление о смене пароля аккаунта'
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = to_email
    
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as exc:
        print(f"Email notification for password change failed: {exc}")
        raise self.retry(exc=exc)