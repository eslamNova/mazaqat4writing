/*
  # Fix delete functionality with proper password configuration

  1. Changes
    - Add required_delete_password setting
    - Update delete policies to use proper password comparison
    - Add function to verify delete password
    - Add function to set required delete password on startup

  2. Security
    - Maintains RLS enabled on all tables
    - Ensures password verification happens at database level
    - Prevents unauthorized deletions
*/

-- Function to set the required delete password
CREATE OR REPLACE FUNCTION set_required_delete_password()
RETURNS void AS $$
BEGIN
  -- This will be called on connection to set the required password
  PERFORM set_config('app.required_delete_password', current_setting('app.required_delete_password', true), true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify delete password
CREATE OR REPLACE FUNCTION verify_delete_password(password text)
RETURNS boolean AS $$
BEGIN
  RETURN password = current_setting('app.required_delete_password', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set delete password in current session
CREATE OR REPLACE FUNCTION set_delete_password(password text)
RETURNS void AS $$
BEGIN
  -- Set the password in the current session
  PERFORM set_config('app.delete_password', password, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing delete policies
DROP POLICY IF EXISTS "Allow delete with password" ON posts;
DROP POLICY IF EXISTS "Allow delete with password" ON comments;

-- Create updated delete policy for posts
CREATE POLICY "Allow delete with password" ON posts
  FOR DELETE
  TO authenticated
  USING (
    verify_delete_password(current_setting('app.delete_password', true))
  );

-- Create updated delete policy for comments
CREATE POLICY "Allow delete with password" ON comments
  FOR DELETE
  TO authenticated
  USING (
    verify_delete_password(current_setting('app.delete_password', true))
  );