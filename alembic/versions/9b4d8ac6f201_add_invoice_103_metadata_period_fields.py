"""add invoice 103 metadata period fields

Revision ID: 9b4d8ac6f201
Revises: 7f0e6df65d1a
Create Date: 2026-06-01 19:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9b4d8ac6f201"
down_revision: Union[str, Sequence[str], None] = "7f0e6df65d1a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _drop_legacy_no_invoice_uniqueness() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    for constraint in inspector.get_unique_constraints("invoice_103_metadata"):
        columns = constraint.get("column_names") or []
        if columns == ["no_invoice"]:
            op.drop_constraint(
                constraint["name"],
                "invoice_103_metadata",
                type_="unique",
            )

    for index in inspector.get_indexes("invoice_103_metadata"):
        columns = index.get("column_names") or []
        if columns == ["no_invoice"] and index.get("unique"):
            op.drop_index(index["name"], table_name="invoice_103_metadata")


def upgrade() -> None:
    op.add_column(
        "invoice_103_metadata",
        sa.Column("invoice_year", sa.Integer(), nullable=True),
    )
    op.add_column(
        "invoice_103_metadata",
        sa.Column("invoice_month", sa.Integer(), nullable=True),
    )
    op.create_index(
        op.f("ix_invoice_103_metadata_invoice_year"),
        "invoice_103_metadata",
        ["invoice_year"],
        unique=False,
    )
    op.create_index(
        op.f("ix_invoice_103_metadata_invoice_month"),
        "invoice_103_metadata",
        ["invoice_month"],
        unique=False,
    )
    _drop_legacy_no_invoice_uniqueness()
    op.create_unique_constraint(
        "uq_invoice_103_metadata_invoice_period",
        "invoice_103_metadata",
        ["no_invoice", "invoice_year", "invoice_month"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_invoice_103_metadata_invoice_period",
        "invoice_103_metadata",
        type_="unique",
    )
    op.drop_index(
        op.f("ix_invoice_103_metadata_invoice_month"),
        table_name="invoice_103_metadata",
    )
    op.drop_index(
        op.f("ix_invoice_103_metadata_invoice_year"),
        table_name="invoice_103_metadata",
    )
    op.drop_column("invoice_103_metadata", "invoice_month")
    op.drop_column("invoice_103_metadata", "invoice_year")
    op.create_unique_constraint(
        "uq_invoice_103_metadata_no_invoice",
        "invoice_103_metadata",
        ["no_invoice"],
    )
