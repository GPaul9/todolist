"""fix project updated_at

Revision ID: 76e5c26f98b7
Revises: 60ad6a45eb9c
Create Date: 2026-05-08 09:52:32.333081

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '76e5c26f98b7'
down_revision: Union[str, Sequence[str], None] = '60ad6a45eb9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute("""
        ALTER TABLE projects
        ALTER COLUMN updated_at SET DEFAULT NOW()
    """)

def downgrade():
    op.execute("""
        ALTER TABLE projects
        ALTER COLUMN updated_at DROP DEFAULT
    """)
