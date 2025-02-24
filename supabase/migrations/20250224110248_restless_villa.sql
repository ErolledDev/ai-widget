/*
  # Create widget settings table

  1. New Tables
    - `widget_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `widget_settings` table
    - Add policies for authenticated users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON widget_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create an update trigger to handle updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_widget_settings_updated_at
  BEFORE UPDATE
  ON widget_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();