"""add reminders and user email_notifications

Revision ID: e8f70567fb6e
Revises: be5931881483
Create Date: 2026-03-31 11:46:55.436756

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'e8f70567fb6e'
down_revision: Union[str, Sequence[str], None] = 'be5931881483'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminderstatus') THEN 
                CREATE TYPE reminderstatus AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'CANCELED'); 
            END IF; 
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminderchannel') THEN 
                CREATE TYPE reminderchannel AS ENUM ('EMAIL', 'WEBPUSH', 'BOTH'); 
            END IF; 
        END $$;
    """)

    reminder_status = postgresql.ENUM('PENDING', 'PROCESSING', 'SENT', 'CANCELED',
                                      name='reminderstatus', create_type=False)
    reminder_channel = postgresql.ENUM('EMAIL', 'WEBPUSH', 'BOTH',
                                       name='reminderchannel', create_type=False)

    op.create_table('reminders',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('status', reminder_status, nullable=False),
                    sa.Column('reminder_at', sa.DateTime(timezone=True), nullable=False),
                    sa.Column('reminder_channel', reminder_channel, nullable=False),
                    sa.Column('task_id', sa.Integer(), nullable=False),
                    sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ),
                    sa.PrimaryKeyConstraint('id')
                    )

    op.create_index('ix_reminder_status_time', 'reminders', ['status', 'reminder_at'], unique=False)

    op.add_column('user',
                  sa.Column('email_notifications', sa.Boolean(), nullable=False, server_default=sa.text('true')))


def downgrade() -> None:
    op.drop_column('user', 'email_notifications')
    op.drop_index('ix_reminder_status_time', table_name='reminders')
    op.drop_table('reminders')

    op.execute("DROP TYPE IF EXISTS reminderstatus")
    op.execute("DROP TYPE IF EXISTS reminderchannel")
