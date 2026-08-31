"""init citext

Revision ID: 260174ddb60a
Revises: 
Create Date: 2026-03-25 23:38:35.069177

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '260174ddb60a'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""CREATE EXTENSION IF NOT EXISTS citext;""")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""DROP EXTENSION IF EXISTS citext;""")
