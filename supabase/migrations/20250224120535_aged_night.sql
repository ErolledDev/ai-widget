/*
  # Create widget settings table

  1. New Tables
    - `widget_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique, references auth.users)
      - `settings` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `widget_settings` table
    - Add policy for authenticated users to manage their own settings
    - Add trigger for updating `updated_at` timestamp

  3. Constraints
    - Primary key on `id`
    - Unique constraint on `user_id`
    - Foreign key from `user_id` to `auth.users`
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS widget_settings;

-- Create the widget_settings table
CREATE TABLE widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT widget_settings_user_id_key UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own settings
CREATE POLICY "Users can manage their own settings"
  ON widget_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatically updating updated_at
CREATE TRIGGER update_widget_settings_updated_at
  BEFORE UPDATE
  ON widget_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();