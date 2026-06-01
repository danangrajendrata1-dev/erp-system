"""add bkorder partial input quantities

Revision ID: 7f0e6df65d1a
Revises: cc03c2264cd3
Create Date: 2026-06-01 17:28:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "7f0e6df65d1a"
down_revision: Union[str, Sequence[str], None] = "cc03c2264cd3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "production_orders",
        sa.Column(
            "partial_billing_input_quantities",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("production_orders", "partial_billing_input_quantities")
