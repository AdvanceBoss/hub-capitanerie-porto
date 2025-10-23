-- HUB Nazionale Capitanerie di Porto - Database Schema
-- Supabase PostgreSQL Database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
CREATE TYPE user_role AS ENUM ('maricogecap', 'direzione_marittima', 'capitaneria', 'ufficio_circondariale');
CREATE TYPE verbale_status AS ENUM ('bozza', 'inviato', 'confermato', 'archiviato');
CREATE TYPE infrazione_tipo AS ENUM ('nazionale', 'locale');

-- Organizations hierarchy table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    tipo user_role NOT NULL,
    codice VARCHAR(50) UNIQUE NOT NULL,
    parent_id UUID REFERENCES organizations(id),
    indirizzo TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    pec VARCHAR(255),
    coordinate POINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with hierarchical permissions
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    ruolo user_role NOT NULL,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transgressors (Anagrafica) table
CREATE TABLE trasgressori (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognome VARCHAR(100) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    luogo_nascita VARCHAR(100),
    data_nascita DATE,
    residenza_comune VARCHAR(100),
    residenza_indirizzo TEXT,
    documento_tipo VARCHAR(50),
    documento_numero VARCHAR(50),
    documento_rilasciato VARCHAR(100),
    documento_data DATE,
    codice_fiscale VARCHAR(16) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Infractions database (from Excel)
CREATE TABLE infrazioni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titolo VARCHAR(500),
    descrizione TEXT NOT NULL,
    norma_violata TEXT,
    norma_sanzionatoria TEXT,
    minimo_massimo_edittale TEXT,
    pagamento_misura_ridotta DECIMAL(10,2),
    tipo infrazione_tipo NOT NULL,
    sequestro_obbligatorio BOOLEAN DEFAULT false,
    norma_sequestro TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment authorities
CREATE TABLE autorita_pagamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    indirizzo TEXT,
    pec VARCHAR(255),
    codice_ufficio VARCHAR(50),
    codice_territoriale VARCHAR(50),
    causale VARCHAR(100),
    codice_tributo VARCHAR(50),
    iban VARCHAR(34),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main verbali table
CREATE TABLE verbali (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_verbale VARCHAR(50) NOT NULL,
    anno INTEGER NOT NULL,
    organization_id UUID REFERENCES organizations(id) NOT NULL,
    created_by UUID REFERENCES users(id) NOT NULL,
    
    -- Trasgressore data
    trasgressore_id UUID REFERENCES trasgressori(id),
    
    -- Obbligato in solido
    obbligato_coincide BOOLEAN DEFAULT false,
    obbligato_id UUID REFERENCES trasgressori(id),
    
    -- Contestazione
    contestazione_tipo VARCHAR(20) DEFAULT 'immediata',
    contestazione_motivo TEXT,
    pec_esito VARCHAR(20) DEFAULT 'non_rilevata',
    pec_indirizzo VARCHAR(255),
    
    -- Verbalizzanti
    verbalizzanti TEXT NOT NULL,
    
    -- Fatto data località
    data_fatto DATE NOT NULL,
    ora_fatto TIME NOT NULL,
    luogo_fatto TEXT NOT NULL,
    narrazione_fatto TEXT NOT NULL,
    dichiarazione_trasgressore TEXT,
    
    -- Pagamento
    autorita_pagamento_id UUID REFERENCES autorita_pagamento(id),
    codice_navigazione BOOLEAN DEFAULT false,
    spese_notifica_presenti BOOLEAN DEFAULT false,
    spese_notifica_importo DECIMAL(10,2),
    riduzione_30 BOOLEAN DEFAULT false,
    
    -- Sequestro
    sequestro_presente BOOLEAN DEFAULT false,
    sequestro_numero VARCHAR(50),
    sequestro_data DATE,
    sequestro_ora TIME,
    sequestro_luogo TEXT,
    sequestro_norma TEXT,
    sequestro_descrizione TEXT,
    sequestro_sigilli INTEGER DEFAULT 0,
    
    -- Status and metadata
    status verbale_status DEFAULT 'bozza',
    file_html TEXT,
    file_docx BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verbali-Infrazioni junction table
CREATE TABLE verbali_infrazioni (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verbale_id UUID REFERENCES verbali(id) ON DELETE CASCADE,
    infrazione_id UUID REFERENCES infrazioni(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for tracking changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_organizations_parent ON organizations(parent_id);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_trasgressori_cf ON trasgressori(codice_fiscale);
CREATE INDEX idx_trasgressori_nome_cognome ON trasgressori(cognome, nome);
CREATE INDEX idx_verbali_organization ON verbali(organization_id);
CREATE INDEX idx_verbali_created_by ON verbali(created_by);
CREATE INDEX idx_verbali_data ON verbali(data_fatto);
CREATE INDEX idx_verbali_status ON verbali(status);
CREATE INDEX idx_verbali_infrazioni_verbale ON verbali_infrazioni(verbale_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trasgressori_updated_at BEFORE UPDATE ON trasgressori FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_verbali_updated_at BEFORE UPDATE ON verbali FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verbali ENABLE ROW LEVEL SECURITY;
ALTER TABLE trasgressori ENABLE ROW LEVEL SECURITY;
ALTER TABLE verbali_infrazioni ENABLE ROW LEVEL SECURITY;

-- RLS Policies will be created after auth setup
