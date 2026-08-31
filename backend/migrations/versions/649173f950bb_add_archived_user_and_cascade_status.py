"""add archived user and cascade status

Revision ID: 649173f950bb
Revises: 4243a106a954
Create Date: 2026-05-18 10:59:02.899844

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '649173f950bb'
down_revision: Union[str, Sequence[str], None] = '4243a106a954'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("""
        ALTER TYPE taskliststatus
        ADD VALUE IF NOT EXISTS 'ARCHIVED_BY_USER_AND_CASCADE'
    """)


def downgrade() -> None: # Для PostgreSQL удалить enum value через downgrade нормально нельзя, поэтому:
    """Downgrade schema."""
    pass
