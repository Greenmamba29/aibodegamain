# Supabase Migrations Guide

This guide provides best practices for creating and managing migrations in this project.

## Migration Best Practices

1. **Always use conditional creation**:
   - Use `IF NOT EXISTS` for tables, indexes, etc.
   - Use DO blocks with existence checks for constraints and policies

2. **Avoid duplicate migrations**:
   - Check `MIGRATION_TRACKER.md` before creating new migrations
   - Ensure your migration doesn't conflict with existing ones

3. **Naming convention**:
   - Use descriptive names for migration files
   - Prefix with timestamp: `YYYYMMDDHHMMSS_descriptive_name.sql`

4. **Migration structure**:
   - Start with a comment block describing the migration
   - Group related operations together
   - Add proper error handling for critical operations

## Common Patterns

### Safe Table Creation
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- other columns
  created_at timestamptz DEFAULT now()
);
```

### Safe Constraint Addition
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'constraint_name' 
    AND conrelid = 'table_name'::regclass
  ) THEN
    ALTER TABLE table_name 
    ADD CONSTRAINT constraint_name 
    CHECK (column IN ('value1', 'value2'));
  END IF;
END $$;
```

### Safe Policy Creation
```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'table_name' 
    AND policyname = 'Policy name'
  ) THEN
    CREATE POLICY "Policy name"
      ON table_name
      FOR SELECT
      TO authenticated
      USING (condition);
  END IF;
END $$;
```

### Safe Function Creation
```sql
CREATE OR REPLACE FUNCTION function_name()
RETURNS return_type AS $$
BEGIN
  -- function body
END;
$$ LANGUAGE plpgsql;
```

## Troubleshooting

If you encounter migration errors:

1. Check the error message carefully
2. Look for similar migrations in `MIGRATION_TRACKER.md`
3. Use the patterns above to create safe migrations
4. Update `MIGRATION_TRACKER.md` with any new issues and solutions