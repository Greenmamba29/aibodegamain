# Migration Tracker

This document tracks migration issues, solutions, and the current status of each migration.

## Known Issues and Solutions

### 1. Notifications Table Creation

**Issue**: Multiple migrations trying to create the same notifications table and policies.

**Files Affected**:
- `20250628004131_bright_cell.sql`
- `20250628134207_sunny_hall.sql`
- `20250628134629_tender_reef.sql`
- `20250628151806_hidden_star.sql`

**Solution**: 
- Use `CREATE TABLE IF NOT EXISTS` for table creation
- Use DO blocks with existence checks for constraints and policies:

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Policy name'
  ) THEN
    CREATE POLICY "Policy name"...
  END IF;
END $$;
```

**Status**: Fixed in `20250628232500_fix_app_functionality.sql`

### 2. README.md in Migrations Directory

**Issue**: README.md was placed in the migrations directory, causing Supabase to try to run it as SQL.

**Solution**: Moved README.md to the supabase root directory.

**Status**: Fixed

### 3. Constraint Syntax Error

**Issue**: `IF NOT EXISTS` syntax error in constraint creation.

**Files Affected**:
- `20250628004131_bright_cell.sql`

**Solution**: Use DO block for conditional constraint creation:

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
    CHECK (...);
  END IF;
END $$;
```

**Status**: Fixed in `20250628232500_fix_app_functionality.sql`

## App Functionality Issues Fixed

### 1. User Settings

- Added `app_updates` to notification preferences
- Added `show_github` to privacy settings
- Fixed profile picture update functionality with proper trigger

### 2. App Likes

- Ensured app_likes table exists with proper constraints
- Added necessary indexes and RLS policies

### 3. Avatar Updates

- Created function to handle avatar updates
- Added trigger for avatar timestamp updates

## Migration Status

| Migration File | Status | Notes |
|----------------|--------|-------|
| 20250627204648_emerald_band.sql | ✅ Applied | Initial schema |
| 20250627204752_plain_thunder.sql | ✅ Applied | Seed data |
| 20250627211307_divine_field.sql | ✅ Applied | User following system |
| 20250627212058_emerald_feather.sql | ✅ Applied | Fix user creation |
| 20250627214813_curly_rice.sql | ✅ Applied | Storage buckets |
| 20250628002124_weathered_term.sql | ✅ Applied | Notifications system |
| 20250628004131_bright_cell.sql | ❌ Failed | Syntax error in constraint |
| 20250628004610_nameless_shadow.sql | ✅ Applied | Fixed notifications |
| 20250628010935_proud_jungle.sql | ✅ Applied | Stripe integration |
| 20250628015328_white_brook.sql | ✅ Applied | Fix notifications |
| 20250628020106_divine_spark.sql | ✅ Applied | Sample data |
| 20250628030527_white_wind.sql | ✅ Applied | App drafts |
| 20250628134207_sunny_hall.sql | ❌ Failed | Policy already exists |
| 20250628134629_tender_reef.sql | ❌ Failed | Policy already exists |
| 20250628145438_twilight_mud.sql | ✅ Applied | App purchases |
| 20250628151423_icy_dust.sql | ✅ Applied | Sample data |
| 20250628151806_hidden_star.sql | ❌ Failed | Policy already exists |
| 20250628180004_round_coast.sql | ✅ Applied | App likes |
| 20250628232500_fix_app_functionality.sql | ✅ Applied | Fix app functionality |