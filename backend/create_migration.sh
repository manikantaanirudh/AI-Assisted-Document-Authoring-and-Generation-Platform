#!/bin/bash
# Helper script to create a new Alembic migration

if [ -z "$1" ]; then
    echo "Usage: ./create_migration.sh <migration_message>"
    echo "Example: ./create_migration.sh 'add_user_preferences'"
    exit 1
fi

alembic revision --autogenerate -m "$1"
echo "Migration created! Review the file in alembic/versions/ and run 'alembic upgrade head' to apply."

