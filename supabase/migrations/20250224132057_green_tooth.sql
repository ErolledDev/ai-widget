/*
  # Chat Analytics Schema

  1. New Tables
    - `chat_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `visitor_id` (text, tracks unique visitors)
      - `ip_address` (text)
      - `session_start` (timestamptz)
      - `session_end` (timestamptz)
      - `messages_count` (int)
      - `first_message` (text)
      - `last_message` (text)
      - `visitor_name` (text, nullable)
      - `visitor_email` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on chat_analytics table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS chat_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  visitor_id text NOT NULL,
  ip_address text,
  session_start timestamptz NOT NULL DEFAULT now(),
  session_end timestamptz,
  messages_count int DEFAULT 1,
  first_message text,
  last_message text,
  visitor_name text,
  visitor_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics"
  ON chat_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Widget can insert analytics"
  ON chat_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Widget can update analytics"
  ON chat_analytics
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update trigger for updated_at
CREATE TRIGGER update_chat_analytics_updated_at
  BEFORE UPDATE
  ON chat_analytics
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX chat_analytics_user_id_idx ON chat_analytics(user_id);
CREATE INDEX chat_analytics_visitor_id_idx ON chat_analytics(visitor_id);
CREATE INDEX chat_analytics_session_start_idx ON chat_analytics(session_start);