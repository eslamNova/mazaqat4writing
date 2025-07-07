/*
  # Add delete policies for posts and comments

  1. Changes
    - Add delete policies for posts table
    - Add delete policies for comments table
    - Both policies require a specific password for deletion

  2. Security
    - Maintains existing RLS policies
    - Adds secure deletion policies
    - Requires password verification for deletion
*/

-- Drop any existing delete policies
DROP POLICY IF EXISTS "Allow delete with password" ON posts;
DROP POLICY IF EXISTS "Allow delete with password" ON comments;

-- Create delete policy for posts
CREATE POLICY "Allow delete with password" ON posts
  FOR DELETE
  TO authenticated
  USING (
    current_setting('app.delete_password', true) = current_setting('app.required_delete_password', true)
  );

-- Create delete policy for comments
CREATE POLICY "Allow delete with password" ON comments
  FOR DELETE
  TO authenticated
  USING (
    current_setting('app.delete_password', true) = current_setting('app.required_delete_password', true)
  );

-- Function to set delete password
CREATE OR REPLACE FUNCTION set_delete_password(password text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.delete_password', password, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;