"""add patient vital submissions workflow table

Revision ID: 20260414_0004
Revises: 20260413_0003
Create Date: 2026-04-14 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260414_0004"
down_revision: Union[str, Sequence[str], None] = "20260413_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _index_exists(inspector, table_name: str, index_name: str) -> bool:
    return any(index.get("name") == index_name for index in inspector.get_indexes(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("patient_vital_submissions"):
        op.create_table(
            "patient_vital_submissions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("patient_id", sa.Integer(), nullable=False),
            sa.Column("date", sa.String(), nullable=False),
            sa.Column("time", sa.String(), nullable=False),
            sa.Column("systolic", sa.Integer(), nullable=False),
            sa.Column("diastolic", sa.Integer(), nullable=False),
            sa.Column("heart_rate", sa.Integer(), nullable=False),
            sa.Column("temperature", sa.Float(), nullable=False),
            sa.Column("spo2", sa.Integer(), nullable=True, server_default=sa.text("0")),
            sa.Column("respiratory_rate", sa.Integer(), nullable=True, server_default=sa.text("0")),
            sa.Column("weight", sa.Float(), nullable=True, server_default=sa.text("0")),
            sa.Column("height", sa.Float(), nullable=True, server_default=sa.text("0")),
            sa.Column("source_document_url", sa.String(), nullable=True),
            sa.Column("status", sa.String(), nullable=False, server_default=sa.text("'pending'")),
            sa.Column("admin_notes", sa.Text(), nullable=True),
            sa.Column("reviewed_by", sa.Integer(), nullable=True),
            sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["patient_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_patient_vital_submissions_id", "patient_vital_submissions", ["id"], unique=False)
        op.create_index("ix_patient_vital_submissions_patient_id", "patient_vital_submissions", ["patient_id"], unique=False)
        op.create_index("ix_patient_vital_submissions_status", "patient_vital_submissions", ["status"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("patient_vital_submissions"):
        if _index_exists(inspector, "patient_vital_submissions", "ix_patient_vital_submissions_status"):
            op.drop_index("ix_patient_vital_submissions_status", table_name="patient_vital_submissions")
        if _index_exists(inspector, "patient_vital_submissions", "ix_patient_vital_submissions_patient_id"):
            op.drop_index("ix_patient_vital_submissions_patient_id", table_name="patient_vital_submissions")
        if _index_exists(inspector, "patient_vital_submissions", "ix_patient_vital_submissions_id"):
            op.drop_index("ix_patient_vital_submissions_id", table_name="patient_vital_submissions")
        op.drop_table("patient_vital_submissions")
