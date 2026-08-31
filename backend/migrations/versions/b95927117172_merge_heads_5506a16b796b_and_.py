"""merge heads 5506a16b796b and e5b4f67e681d

Revision ID: b95927117172
Revises: e5b4f67e681d, 5506a16b796b
Create Date: 2026-06-15 23:39:58.297290

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b95927117172'
down_revision: Union[str, Sequence[str], None] = ('e5b4f67e681d', '5506a16b796b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
