"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), nullable=False, unique=True, index=True),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # Create projects table
    op.create_table(
        'projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('doc_type', sa.Enum('DOCX', 'PPTX', name='documenttype'), nullable=False),
        sa.Column('topic', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # Create sections table
    op.create_table(
        'sections',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('type', sa.Enum('SECTION', 'SLIDE', name='sectiontype'), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('llm_raw', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # Create revisions table
    op.create_table(
        'revisions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('section_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sections.id'), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('prompt', sa.Text(), nullable=False),
        sa.Column('old_content', sa.Text(), nullable=True),
        sa.Column('new_content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # Create feedbacks table
    op.create_table(
        'feedbacks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('section_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sections.id'), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('liked', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # Create comments table
    op.create_table(
        'comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('section_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sections.id'), nullable=False),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('projects.id'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('comment_text', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('comments')
    op.drop_table('feedbacks')
    op.drop_table('revisions')
    op.drop_table('sections')
    op.drop_table('projects')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS sectiontype')
    op.execute('DROP TYPE IF EXISTS documenttype')
