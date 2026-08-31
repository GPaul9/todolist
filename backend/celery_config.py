# celery_config.py
from datetime import timedelta

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        'app.tasks.email',
        'app.tasks.reminder_tasks',
        'app.tasks.cleanup_tasks',
        'app.tasks.cleanup_archived_projects',
    ]
)

celery_app.conf.beat_schedule = {
    'check-reminders-every-30_seconds': {
        'task': 'app.tasks.reminder_tasks.check_reminders',
        'schedule': timedelta(seconds=settings.CELERY_CHECK_TIMER),
    },
    'cleanup-orphaned-attachments': {
        'task': 'app.tasks.cleanup_tasks.cleanup_orphaned_attachments',

        'schedule': timedelta(seconds=settings.CELERY_CHECK_MINIO_TIMER),
        # 'schedule': 3600.0,  # каждый час
    },
    'cleanup-archived-projects-daily': {
        'task': 'app.tasks.cleanup_archived_projects.cleanup_archived_projects_task',
        'schedule': crontab(hour=3, minute=0),  # Каждый день в 03:00 UTC
        'kwargs': {'dry_run': False, 'batch_size': 100},
        'options': {'expires': 7200},
    },
}

celery_app.conf.update(
    broker_connection_retry_on_startup=True,
)

celery_app.conf.timezone = "UTC" # type: ignore
