import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Organization {
  id: string
  nome: string
  tipo: 'maricogecap' | 'direzione_marittima' | 'capitaneria' | 'ufficio_circondariale'
  codice: string
  parent_id?: string
  indirizzo?: string
  telefono?: string
  email?: string
  pec?: string
  coordinate?: { x: number; y: number }
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  nome: string
  cognome: string
  ruolo: 'maricogecap' | 'direzione_marittima' | 'capitaneria' | 'ufficio_circondariale'
  organization_id: string
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
  organization?: Organization
}

export interface Trasgressore {
  id: string
  cognome: string
  nome: string
  luogo_nascita?: string
  data_nascita?: string
  residenza_comune?: string
  residenza_indirizzo?: string
  documento_tipo?: string
  documento_numero?: string
  documento_rilasciato?: string
  documento_data?: string
  codice_fiscale?: string
  telefono?: string
  email?: string
  created_at: string
  updated_at: string
}

export interface Infrazione {
  id: string
  titolo?: string
  descrizione: string
  norma_violata?: string
  norma_sanzionatoria?: string
  minimo_massimo_edittale?: string
  pagamento_misura_ridotta?: number
  tipo: 'nazionale' | 'locale'
  sequestro_obbligatorio: boolean
  norma_sequestro?: string
  created_at: string
}

export interface AutoritaPagamento {
  id: string
  nome: string
  indirizzo?: string
  pec?: string
  codice_ufficio?: string
  codice_territoriale?: string
  causale?: string
  codice_tributo?: string
  iban?: string
  created_at: string
}

export interface Verbale {
  id: string
  numero_verbale: string
  anno: number
  organization_id: string
  created_by: string
  trasgressore_id?: string
  obbligato_coincide: boolean
  obbligato_id?: string
  contestazione_tipo: string
  contestazione_motivo?: string
  pec_esito: string
  pec_indirizzo?: string
  verbalizzanti: string
  data_fatto: string
  ora_fatto: string
  luogo_fatto: string
  narrazione_fatto: string
  dichiarazione_trasgressore?: string
  autorita_pagamento_id?: string
  codice_navigazione: boolean
  spese_notifica_presenti: boolean
  spese_notifica_importo?: number
  riduzione_30: boolean
  sequestro_presente: boolean
  sequestro_numero?: string
  sequestro_data?: string
  sequestro_ora?: string
  sequestro_luogo?: string
  sequestro_norma?: string
  sequestro_descrizione?: string
  sequestro_sigilli: number
  status: 'bozza' | 'inviato' | 'confermato' | 'archiviato'
  file_html?: string
  file_docx?: string
  created_at: string
  updated_at: string
  organization?: Organization
  trasgressore?: Trasgressore
  obbligato?: Trasgressore
  autorita_pagamento?: AutoritaPagamento
  infrazioni?: Infrazione[]
}

export interface VerbaleInfrazione {
  id: string
  verbale_id: string
  infrazione_id: string
  created_at: string
}

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values?: any
  new_values?: any
  user_id?: string
  created_at: string
}
