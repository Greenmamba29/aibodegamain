# Migration Tracker

This file tracks migration issues and their solutions to prevent repeated errors.

## Known Migration Issues

### 1. Notifications Table Creation

**Problem**: Multiple migrations attempting to create the same notifications table and policies.

**Affected Files**:
- `20250628004131_bright_cell.sql` - Failed due to syntax error with `IF NOT EXISTS`
- `20250628133113_noisy_field.sql` - Duplicate notifications table creation
- `20250628134207_nameless_shadow.sql` - Another attempt at notifications table
- `20250628134629_tender_reef.sql` - Yet another attempt
- `20250628151423_icy_dust.sql` - Sample data insertion
- `20250628231751_jade_block.sql` - Failed due to policy already existing

**Solution**: 
- Created `20250628231818_dry_dune.sql` with proper conditional checks for all objects
- This migration safely creates the notifications table, indexes, constraint, and policies only if they don't already exist

### 2. Proper Migration Pattern

When creating new migrations, always use this pattern for safety:

```sql
-- For tables
CREATE TABLE IF NOT EXISTS table_name (...);

-- For constraints (use DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'constraint_name' 
    AND conrelid = 'table_name'::regclass
  ) THEN
    ALTER TABLE table_name 
    ADD CONSTRAINT constraint_name 
    CHECK (...);
  END IF;
END $$;

-- For policies (use DO block)
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
      USING (...);
  END IF;
END $$;
```

## Migration Status

| Migration File | Status | Notes |
|----------------|--------|-------|
| 20250627204648_emerald_band.sql | ✅ Applied | Initial schema |
| 20250627204752_plain_thunder.sql | ✅ Applied | Seed data |
| 20250627211307_divine_field.sql | ✅ Applied | User following system |
| 20250627212058_emerald_feather.sql | ✅ Applied | Fix user creation |
| 20250627214813_curly_rice.sql | ✅ Applied | Storage buckets |
| 20250628002124_weathered_term.sql | ✅ Applied | Notifications system |
| 20250628231818_dry_dune.sql | ✅ Applied | Fixed notifications table |
| 20250628145438_twilight_mud.sql | ✅ Applied | App purchases table |
| 20250628151806_hidden_star.sql | ✅ Applied | Stripe integration |
| 20250628180004_round_coast.sql | ✅ Applied | App likes table |