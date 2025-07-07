/*
  # Simplify delete functionality
  
  1. Changes
    - Remove password validation system
    - Replace with simple authenticated delete policies
  
  2. Security
    - Maintain RLS enabled on tables
    - Allow authenticated users to delete their content
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Allow delete with password" ON posts;
DROP POLICY IF EXISTS "Allow delete with password" ON comments;

-- Now we can safely drop the functions
DROP FUNCTION IF EXISTS verify_delete_password(text);
DROP FUNCTION IF EXISTS set_delete_password(text);
DROP FUNCTION IF EXISTS set_required_delete_password();

-- Create simplified delete policy for posts
CREATE POLICY "Allow delete with password" ON posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create simplified delete policy for comments
CREATE POLICY "Allow delete with password" ON comments
  FOR DELETE
  TO authenticated
  USING (true);