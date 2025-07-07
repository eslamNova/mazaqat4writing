/*
  # Fix RLS policy for posts table

  1. Changes
    - Drop existing INSERT policy that's too restrictive
    - Create new INSERT policy with proper security rules
    - Ensure authenticated users can insert posts with proper validation

  2. Security
    - Maintains RLS enabled on posts table
    - Allows authenticated users to insert posts
    - Preserves existing SELECT policy
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;

-- Create new INSERT policy with proper security rules
CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Basic validation rules
    length(title) > 0 AND
    length(content) > 0 AND
    (
      -- Either anonymous post (is_anonymous = true) or has author name
      (is_anonymous = true) OR
      (is_anonymous = false AND author_name IS NOT NULL)
    )
  );