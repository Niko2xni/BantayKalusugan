"""add admin settings and reporting indexes

Revision ID: 20260406_0001
Revises:
Create Date: 2026-04-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260406_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _index_exists(inspector, table_name: str, index_name: str) -> bool:
    return any(index.get("name") == index_name for index in inspector.get_indexes(table_name))


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not inspector.has_table("admin_settings"):
        op.create_table(
            "admin_settings",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("key", sa.String(), nullable=False),
            sa.Column("value", sa.Text(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("key", name="uq_admin_settings_key"),
        )
        op.create_index("ix_admin_settings_id", "admin_settings", ["id"], unique=False)
        op.create_index("ix_admin_settings_key", "admin_settings", ["key"], unique=True)

    inspector = sa.inspect(bind)

    if inspector.has_table("users") and not _index_exists(inspector, "users", "ix_users_role"):
        op.create_index("ix_users_role", "users", ["role"], unique=False)

    if inspector.has_table("vital_signs") and not _index_exists(inspector, "vital_signs", "ix_vital_signs_date"):
        op.create_index("ix_vital_signs_date", "vital_signs", ["date"], unique=False)

    if inspector.has_table("audit_logs"):
        if not _index_exists(inspector, "audit_logs", "ix_audit_logs_timestamp"):
            op.create_index("ix_audit_logs_timestamp", "audit_logs", ["timestamp"], unique=False)
        if not _index_exists(inspector, "audit_logs", "ix_audit_logs_action"):
            op.create_index("ix_audit_logs_action", "audit_logs", ["action"], unique=False)
        if not _index_exists(inspector, "audit_logs", "ix_audit_logs_target_type"):
            op.create_index("ix_audit_logs_target_type", "audit_logs", ["target_type"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if inspector.has_table("audit_logs"):
        if _index_exists(inspector, "audit_logs", "ix_audit_logs_target_type"):
            op.drop_index("ix_audit_logs_target_type", table_name="audit_logs")
        if _index_exists(inspector, "audit_logs", "ix_audit_logs_action"):
            op.drop_index("ix_audit_logs_action", table_name="audit_logs")
        if _index_exists(inspector, "audit_logs", "ix_audit_logs_timestamp"):
            op.drop_index("ix_audit_logs_timestamp", table_name="audit_logs")

    inspector = sa.inspect(bind)
    if inspector.has_table("vital_signs") and _index_exists(inspector, "vital_signs", "ix_vital_signs_date"):
        op.drop_index("ix_vital_signs_date", table_name="vital_signs")

    inspector = sa.inspect(bind)
    if inspector.has_table("users") and _index_exists(inspector, "users", "ix_users_role"):
        op.drop_index("ix_users_role", table_name="users")

    inspector = sa.inspect(bind)
    if inspector.has_table("admin_settings"):
        if _index_exists(inspector, "admin_settings", "ix_admin_settings_key"):
            op.drop_index("ix_admin_settings_key", table_name="admin_settings")
        if _index_exists(inspector, "admin_settings", "ix_admin_settings_id"):
            op.drop_index("ix_admin_settings_id", table_name="admin_settings")
        op.drop_table("admin_settings")
