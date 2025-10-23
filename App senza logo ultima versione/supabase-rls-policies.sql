-- Row Level Security Policies for HUB Nazionale Capitanerie di Porto
-- Execute these after creating the main schema and sample data

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verbali ENABLE ROW LEVEL SECURITY;
ALTER TABLE trasgressori ENABLE ROW LEVEL SECURITY;
ALTER TABLE verbali_infrazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE autorita_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Organizations are viewable by everyone" ON organizations
    FOR SELECT USING (true);

CREATE POLICY "Organizations can be updated by MARICOGECAP" ON organizations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.ruolo = 'maricogecap'
        )
    );

-- Users policies
CREATE POLICY "Users can view their own organization and sub-organizations" ON users
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM organizations o1, organizations o2
            WHERE o1.id = users.organization_id
            AND o2.id = (SELECT organization_id FROM users WHERE id = auth.uid())
            AND (o1.parent_id = o2.id OR o1.id = o2.id OR o2.parent_id = o1.id)
        ) OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.ruolo = 'maricogecap'
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "MARICOGECAP can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.ruolo = 'maricogecap'
        )
    );

-- Verbali policies
CREATE POLICY "Users can view verbali from their organization and sub-organizations" ON verbali
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM organizations o1, organizations o2
            WHERE o1.id = verbali.organization_id
            AND o2.id = (SELECT organization_id FROM users WHERE id = auth.uid())
            AND (o1.parent_id = o2.id OR o1.id = o2.id OR o2.parent_id = o1.id)
        ) OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.ruolo = 'maricogecap'
        )
    );

CREATE POLICY "Users can create verbali in their organization" ON verbali
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update verbali they created" ON verbali
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.ruolo IN ('maricogecap', 'direzione_marittima')
        )
    );

CREATE POLICY "Users can delete verbali they created (if draft)" ON verbali
    FOR DELETE USING (
        created_by = auth.uid() AND status = 'bozza'
    );

-- Trasgressori policies
CREATE POLICY "Trasgressori are viewable by all authenticated users" ON trasgressori
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create trasgressori" ON trasgressori
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update trasgressori" ON trasgressori
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Verbali-Infrazioni policies
CREATE POLICY "Verbali-Infrazioni follow verbali permissions" ON verbali_infrazioni
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM verbali v
            WHERE v.id = verbali_infrazioni.verbale_id
            AND (
                v.organization_id = (
                    SELECT organization_id FROM users WHERE id = auth.uid()
                ) OR
                EXISTS (
                    SELECT 1 FROM organizations o1, organizations o2
                    WHERE o1.id = v.organization_id
                    AND o2.id = (SELECT organization_id FROM users WHERE id = auth.uid())
                    AND (o1.parent_id = o2.id OR o1.id = o2.id OR o2.parent_id = o1.id)
                ) OR
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid()
                    AND u.ruolo = 'maricogecap'
                )
            )
        )
    );

CREATE POLICY "Users can create verbali-infrazioni for their verbali" ON verbali_infrazioni
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM verbali v
            WHERE v.id = verbali_infrazioni.verbale_id
            AND v.created_by = auth.uid()
        )
    );

-- Infrazioni policies
CREATE POLICY "Infrazioni are viewable by all authenticated users" ON infrazioni
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "MARICOGECAP can manage infrazioni" ON infrazioni
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.ruolo = 'maricogecap'
        )
    );

-- Autorita Pagamento policies
CREATE POLICY "Autorita Pagamento are viewable by all authenticated users" ON autorita_pagamento
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "MARICOGECAP can manage autorita pagamento" ON autorita_pagamento
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.ruolo = 'maricogecap'
        )
    );

-- Audit Log policies
CREATE POLICY "Audit Log is viewable by MARICOGECAP and Direzioni" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.ruolo IN ('maricogecap', 'direzione_marittima')
        )
    );

-- Create function to get user's organization hierarchy
CREATE OR REPLACE FUNCTION get_user_organization_hierarchy(user_id UUID)
RETURNS TABLE(organization_id UUID) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE org_hierarchy AS (
        -- Base case: user's direct organization
        SELECT u.organization_id
        FROM users u
        WHERE u.id = user_id
        
        UNION ALL
        
        -- Recursive case: parent organizations
        SELECT o.parent_id
        FROM organizations o
        INNER JOIN org_hierarchy oh ON o.id = oh.organization_id
        WHERE o.parent_id IS NOT NULL
        
        UNION ALL
        
        -- Recursive case: child organizations
        SELECT o.id
        FROM organizations o
        INNER JOIN org_hierarchy oh ON o.parent_id = oh.organization_id
    )
    SELECT DISTINCT organization_id FROM org_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can access organization
CREATE OR REPLACE FUNCTION can_access_organization(user_id UUID, target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM get_user_organization_hierarchy(user_id)
        WHERE organization_id = target_org_id
    ) OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = user_id
        AND u.ruolo = 'maricogecap'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_user_organization_hierarchy(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_organization(UUID, UUID) TO authenticated;

-- Create indexes for better performance with RLS
CREATE INDEX idx_verbali_org_created ON verbali(organization_id, created_by);
CREATE INDEX idx_organizations_hierarchy ON organizations(parent_id, id);
CREATE INDEX idx_users_id ON users(id);

-- Create view for user permissions
CREATE VIEW user_permissions AS
SELECT 
    u.id as user_id,
    u.ruolo,
    u.organization_id,
    o.nome as organization_name,
    o.tipo as organization_type,
    CASE 
        WHEN u.ruolo = 'maricogecap' THEN 'all'
        WHEN u.ruolo = 'direzione_marittima' THEN 'region'
        WHEN u.ruolo = 'capitaneria' THEN 'local'
        WHEN u.ruolo = 'ufficio_circondariale' THEN 'office'
        ELSE 'none'
    END as access_level
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.is_active = true;

-- Grant access to the view
GRANT SELECT ON user_permissions TO authenticated;
