"""add bkpt invoice period fields

Revision ID: b2d69ef4a114
Revises: 9b4d8ac6f201
Create Date: 2026-06-01 20:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b2d69ef4a114"
down_revision: Union[str, Sequence[str], None] = "9b4d8ac6f201"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "bkpt_receivables",
        sa.Column("invoice_year", sa.Integer(), nullable=True),
    )
    op.add_column(
        "bkpt_receivables",
        sa.Column("invoice_month", sa.Integer(), nullable=True),
    )
    op.create_index(
        op.f("ix_bkpt_receivables_invoice_year"),
        "bkpt_receivables",
        ["invoice_year"],
        unique=False,
    )
    op.create_index(
        op.f("ix_bkpt_receivables_invoice_month"),
        "bkpt_receivables",
        ["invoice_month"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_bkpt_receivables_invoice_month"),
        table_name="bkpt_receivables",
    )
    op.drop_index(
        op.f("ix_bkpt_receivables_invoice_year"),
        table_name="bkpt_receivables",
    )
    op.drop_column("bkpt_receivables", "invoice_month")
    op.drop_column("bkpt_receivables", "invoice_year")
