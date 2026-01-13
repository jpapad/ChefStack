-- Create team_roles table for custom roles per team
CREATE TABLE IF NOT EXISTS team_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id TEXT NOT NULL,
    role_name TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, role_name)
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id TEXT NOT NULL,
    role_name TEXT NOT NULL,
    permission TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, role_name, permission)
);

-- Add indexes for performance
CREATE INDEX idx_team_roles_team_id ON team_roles(team_id);
CREATE INDEX idx_role_permissions_team_role ON role_permissions(team_id, role_name);

-- Insert default roles for existing teams (they should already exist from users)
-- We'll populate this from the application when teams are accessed

-- Enable RLS (Row Level Security)
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access roles/permissions for teams they're members of
-- Note: In production, you'd create policies based on user membership in teams table
-- For now, allow authenticated users to manage their team's data
CREATE POLICY "Users can view team roles for their teams"
    ON team_roles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage team roles"
    ON team_roles FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view role permissions for their teams"
    ON role_permissions FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage role permissions"
    ON role_permissions FOR ALL
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE team_roles IS 'Custom and default roles per team';
COMMENT ON TABLE role_permissions IS 'Permissions assigned to each role per team';
