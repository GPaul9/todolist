"""fix list updated_at

Revision ID: 4243a106a954
Revises: 76e5c26f98b7
Create Date: 2026-05-08 10:00:16.520661

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4243a106a954'
down_revision: Union[str, Sequence[str], None] = '76e5c26f98b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("""
        ALTER TABLE task_lists
        ALTER COLUMN updated_at SET DEFAULT NOW()
    """)

def downgrade():
    op.execute("""
        ALTER TABLE task_lists
        ALTER COLUMN updated_at DROP DEFAULT
    """)
