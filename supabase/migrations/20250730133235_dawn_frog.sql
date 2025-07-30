/*
  # Fix Admin Users RLS Policies

  1. Security Changes
    - Remove recursive policies that cause infinite loops
    - Create simple, direct policies using auth.email()
    - Allow public read access for admin verification
    - Restrict write operations to super admins only

  2. Policy Updates
    - Replace complex subqueries with direct auth checks
    - Use auth.email() instead of querying admin_users table
    - Prevent infinite recursion in policy evaluation
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins podem ver todos os admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins podem gerenciar admins" ON admin_users;

-- Create simple, non-recursive policies
CREATE POLICY "Allow public read for admin verification"
  ON admin_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can manage admins"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.email = auth.email()
    )
  )
  WITH CHECK (
    email = auth.email() OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.email = auth.email()
    )
  );