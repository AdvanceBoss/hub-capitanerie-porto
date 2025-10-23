import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock Supabase responses
export const handlers = [
  // Mock auth endpoints
  http.post('https://your-project.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      },
    })
  }),

  // Mock database endpoints
  http.get('https://your-project.supabase.co/rest/v1/users', () => {
    return HttpResponse.json([
      {
        id: 'mock-user-id',
        email: 'test@example.com',
        nome: 'Test',
        cognome: 'User',
        ruolo: 'capitaneria',
        organization_id: 'mock-org-id',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),

  http.get('https://your-project.supabase.co/rest/v1/verbali', () => {
    return HttpResponse.json([
      {
        id: 'mock-verbale-id',
        numero_verbale: '001/2024',
        anno: 2024,
        organization_id: 'mock-org-id',
        created_by: 'mock-user-id',
        status: 'confermato',
        data_fatto: '2024-01-15',
        ora_fatto: '14:30:00',
        luogo_fatto: 'Porto di Licata',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),

  http.get('https://your-project.supabase.co/rest/v1/trasgressori', () => {
    return HttpResponse.json([
      {
        id: 'mock-trasgressore-id',
        cognome: 'Rossi',
        nome: 'Mario',
        codice_fiscale: 'RSSMRA85C15H501Z',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),

  http.get('https://your-project.supabase.co/rest/v1/organizations', () => {
    return HttpResponse.json([
      {
        id: 'mock-org-id',
        nome: 'Capitaneria di Porto di Licata',
        tipo: 'capitaneria',
        codice: 'CP_LICATA',
        parent_id: 'mock-parent-id',
        indirizzo: 'Via del Porto, 1 - 92027 Licata (AG)',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
  }),
]

export const server = setupServer(...handlers)
