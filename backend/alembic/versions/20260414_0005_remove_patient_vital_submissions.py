"""remove patient vital submissions table

Revision ID: 20260414_0005
Revises: 20260414_0004
Create Date: 2026-04-14 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260414_0005"
down_revision: Union[str, Sequence[str], None] = "20260414_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("patient_vital_submissions"):
        op.drop_table("patient_vital_submissions")


def downgrade() -> None:
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
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=True,
            ),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["patient_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_patient_vital_submissions_id", "patient_vital_submissions", ["id"], unique=False)
        op.create_index(
            "ix_patient_vital_submissions_patient_id",
            "patient_vital_submissions",
            ["patient_id"],
            unique=False,
        )
        op.create_index("ix_patient_vital_submissions_status", "patient_vital_submissions", ["status"], unique=False)
