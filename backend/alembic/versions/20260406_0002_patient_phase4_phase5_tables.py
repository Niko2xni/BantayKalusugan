"""add patient appointments notifications and chat tables

Revision ID: 20260406_0002
Revises: 20260406_0001
Create Date: 2026-04-06 22:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260406_0002"
down_revision: Union[str, Sequence[str], None] = "20260406_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _index_exists(inspector, table_name: str, index_name: str) -> bool:
    return any(index.get("name") == index_name for index in inspector.get_indexes(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("appointments"):
        op.create_table(
            "appointments",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("patient_id", sa.Integer(), nullable=False),
            sa.Column("appointment_type", sa.String(), nullable=False),
            sa.Column("health_area", sa.String(), nullable=False),
            sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("status", sa.String(), nullable=False, server_default="Pending"),
            sa.Column("location", sa.String(), nullable=True),
            sa.Column("assigned_staff", sa.String(), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("requested_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["patient_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_appointments_id", "appointments", ["id"], unique=False)
        op.create_index("ix_appointments_patient_id", "appointments", ["patient_id"], unique=False)

    inspector = sa.inspect(bind)
    if not inspector.has_table("notifications"):
        op.create_table(
            "notifications",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column("kind", sa.String(), nullable=False, server_default="general"),
            sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
            sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_notifications_id", "notifications", ["id"], unique=False)
        op.create_index("ix_notifications_user_id", "notifications", ["user_id"], unique=False)

    inspector = sa.inspect(bind)
    if not inspector.has_table("chat_messages"):
        op.create_table(
            "chat_messages",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("sender_type", sa.String(), nullable=False),
            sa.Column("message", sa.Text(), nullable=False),
            sa.Column("channel", sa.String(), nullable=False, server_default="support"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_chat_messages_id", "chat_messages", ["id"], unique=False)
        op.create_index("ix_chat_messages_user_id", "chat_messages", ["user_id"], unique=False)

    inspector = sa.inspect(bind)
    if inspector.has_table("appointments") and not _index_exists(inspector, "appointments", "ix_appointments_scheduled_at"):
        op.create_index("ix_appointments_scheduled_at", "appointments", ["scheduled_at"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("appointments"):
        if _index_exists(inspector, "appointments", "ix_appointments_scheduled_at"):
            op.drop_index("ix_appointments_scheduled_at", table_name="appointments")

    inspector = sa.inspect(bind)
    if inspector.has_table("chat_messages"):
        if _index_exists(inspector, "chat_messages", "ix_chat_messages_user_id"):
            op.drop_index("ix_chat_messages_user_id", table_name="chat_messages")
        if _index_exists(inspector, "chat_messages", "ix_chat_messages_id"):
            op.drop_index("ix_chat_messages_id", table_name="chat_messages")
        op.drop_table("chat_messages")

    inspector = sa.inspect(bind)
    if inspector.has_table("notifications"):
        if _index_exists(inspector, "notifications", "ix_notifications_user_id"):
            op.drop_index("ix_notifications_user_id", table_name="notifications")
        if _index_exists(inspector, "notifications", "ix_notifications_id"):
            op.drop_index("ix_notifications_id", table_name="notifications")
        op.drop_table("notifications")

    inspector = sa.inspect(bind)
    if inspector.has_table("appointments"):
        if _index_exists(inspector, "appointments", "ix_appointments_patient_id"):
            op.drop_index("ix_appointments_patient_id", table_name="appointments")
        if _index_exists(inspector, "appointments", "ix_appointments_id"):
            op.drop_index("ix_appointments_id", table_name="appointments")
        op.drop_table("appointments")
