"""add source_document_url columns to vital signs and audit logs

Revision ID: 20260413_0003
Revises: 20260406_0002
Create Date: 2026-04-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260413_0003"
down_revision: Union[str, Sequence[str], None] = "20260406_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(inspector, table_name: str, column_name: str) -> bool:
    return any(column.get("name") == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("vital_signs") and not _column_exists(inspector, "vital_signs", "source_document_url"):
        op.add_column("vital_signs", sa.Column("source_document_url", sa.String(), nullable=True))

    inspector = sa.inspect(bind)
    if inspector.has_table("audit_logs") and not _column_exists(inspector, "audit_logs", "source_document_url"):
        op.add_column("audit_logs", sa.Column("source_document_url", sa.String(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("audit_logs") and _column_exists(inspector, "audit_logs", "source_document_url"):
        op.drop_column("audit_logs", "source_document_url")

    inspector = sa.inspect(bind)
    if inspector.has_table("vital_signs") and _column_exists(inspector, "vital_signs", "source_document_url"):
        op.drop_column("vital_signs", "source_document_url")