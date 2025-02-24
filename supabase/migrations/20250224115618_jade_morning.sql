/*
  # Add unique constraint to widget_settings

  1. Changes
    - Add unique constraint on user_id column to enable upsert operations
    
  2. Security
    - No changes to existing RLS policies
*/

-- Add unique constraint to user_id
ALTER TABLE widget_settings 
ADD CONSTRAINT widget_settings_user_id_key UNIQUE (user_id);