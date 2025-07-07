/*
  # Add criticism level to posts table

  1. Changes
    - Add criticism_level column to posts table
    - Add check constraint to ensure valid values
    - Update insert policy to include criticism_level validation

  2. Security
    - Maintains existing RLS policies
    - Adds validation for criticism_level values
*/

-- Add criticism_level column with check constraint
ALTER TABLE posts 
ADD COLUMN criticism_level text NOT NULL DEFAULT 'moderate'
CHECK (criticism_level IN ('light', 'moderate', 'harsh'));

-- Drop existing insert policy
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON posts;

-- Create new insert policy with updated validation
CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Basic validation rules
    length(title) > 0 AND
    length(content) > 0 AND
    (
      -- Either anonymous post or has author name
      (is_anonymous = true) OR
      (is_anonymous = false AND author_name IS NOT NULL)
    ) AND
    -- Ensure valid criticism level
    criticism_level IN ('light', 'moderate', 'harsh')
  );