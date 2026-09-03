"""enable_rls_sara_food_items

Revision ID: e26b0e2112fe
Revises: f31e03eca0df
Create Date: 2026-07-06 21:05:45.712398

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e26b0e2112fe'
down_revision: Union[str, Sequence[str], None] = 'f31e03eca0df'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable RLS on the table
    op.execute("ALTER TABLE sara_food_items ENABLE ROW LEVEL SECURITY;")
    
    # Create the read-only policy for authenticated users
    op.execute("""
        CREATE POLICY "Permitir lectura global a usuarios autenticados" 
        ON sara_food_items 
        FOR SELECT 
        USING (auth.role() = 'authenticated');
    """)


def downgrade() -> None:
    # Drop the policy and disable RLS
    op.execute("""
        DROP POLICY IF EXISTS "Permitir lectura global a usuarios autenticados" ON sara_food_items;
    """)
    op.execute("ALTER TABLE sara_food_items DISABLE ROW LEVEL SECURITY;")
