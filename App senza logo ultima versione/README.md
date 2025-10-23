# 🚀 HUB Nazionale Capitanerie di Porto

## 🎯 Panoramica

Il **HUB Nazionale Capitanerie di Porto** è un sistema avanzato di gestione verbali e analytics progettato per rivoluzionare la gestione dei processi verbali delle Capitanerie di Porto italiane. Basato sul software originale di generazione verbali, questo HUB aggiunge funzionalità di database centralizzato, analytics avanzate e gestione gerarchica.

## ✨ Caratteristiche Principali

### 🏗️ Architettura Gerarchica
- **MARICOGECAP**: Controllo completo del sistema nazionale
- **Direzioni Marittime**: Gestione regionale (15 sedi)
- **Capitanerie di Porto**: Gestione locale (~50 sedi)
- **Uffici Circondariali**: Operazioni sul territorio (~200 sedi)

### 📊 Dashboard e Analytics
- **Dashboard Nazionale**: Overview completo delle attività
- **Statistiche in Tempo Reale**: Monitoraggio continuo delle performance
- **Grafici Interattivi**: Visualizzazioni avanzate con Chart.js e D3.js
- **Mappe Geografiche**: Localizzazione delle infrazioni con Leaflet

### 🔐 Sistema di Autenticazione
- **Autenticazione Sicura**: Integrazione Supabase Auth
- **Ruoli Gerarchici**: Permessi basati sulla struttura organizzativa
- **Sessione Persistente**: Login automatico e gestione sessioni
- **Sicurezza Avanzata**: Row Level Security (RLS) per protezione dati

### 📋 Gestione Verbali
- **Database Centralizzato**: Tutti i verbali salvati nel cloud
- **Ricerca Avanzata**: Filtri multipli e ricerca full-text
- **Stati di Lavoro**: Bozza, Inviato, Confermato, Archiviato
- **Integrazione Software Originale**: Il generatore esistente integrato

### 👥 Anagrafica Trasgressori
- **Database Unificato**: Anagrafica nazionale completa
- **Ricerca Recidività**: Identificazione trasgressori recidivi
- **Storico Completo**: Tutti i verbali per trasgressore
- **Validazione Dati**: Controlli automatici su CF, email, IBAN

## 🛠️ Stack Tecnologico

### Frontend
- **React 18** + **TypeScript** - Framework moderno e type-safe
- **Tailwind CSS** - Styling utility-first responsive
- **Framer Motion** - Animazioni fluide e moderne
- **React Query** - Gestione stato server e cache
- **React Router** - Navigazione SPA

### Backend & Database
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Database relazionale robusto
- **Row Level Security** - Sicurezza a livello di riga
- **Real-time** - Aggiornamenti istantanei
- **Storage** - Gestione file e documenti

### Librerie Specializzate
- **Chart.js** + **React-ChartJS-2** - Grafici interattivi
- **Recharts** - Visualizzazioni avanzate
- **Leaflet** + **React-Leaflet** - Mappe geografiche
- **XLSX** - Gestione file Excel
- **html-docx-js** - Generazione documenti Word
- **FileSaver.js** - Download file client-side

### Deployment
- **Netlify** - Hosting e CI/CD automatico
- **Vite** - Build tool veloce e moderno
- **PWA Ready** - Progressive Web App capabilities

## 🚀 Installazione e Setup

### Prerequisiti
- Node.js 18+ 
- npm o yarn
- Account Supabase
- Account Netlify

### 1. Clona il Repository
```bash
git clone https://github.com/your-username/hub-capitanerie-porto.git
cd hub-capitanerie-porto
```

### 2. Installa Dipendenze
```bash
npm install
```

### 3. Configura Supabase
1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Esegui lo script SQL in `supabase-schema.sql`
3. Esegui i dati di esempio in `sample-data.sql`
4. Configura le variabili d'ambiente:

```bash
cp env.example .env.local
```

Modifica `.env.local` con le tue credenziali Supabase:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Avvia in Sviluppo
```bash
npm run dev
```

L'app sarà disponibile su `http://localhost:3000`

### 5. Build per Produzione
```bash
npm run build
```

### 6. Deploy su Netlify
1. Connetti il repository a Netlify
2. Configura le variabili d'ambiente in Netlify
3. Il deploy sarà automatico ad ogni push

## 📊 Database Schema

### Tabelle Principali

#### `organizations` - Struttura Gerarchica
```sql
- id (UUID, PK)
- nome (VARCHAR)
- tipo (ENUM: maricogecap, direzione_marittima, capitaneria, ufficio_circondariale)
- codice (VARCHAR, UNIQUE)
- parent_id (UUID, FK)
- indirizzo, telefono, email, pec
- coordinate (POINT)
```

#### `users` - Utenti del Sistema
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- nome, cognome (VARCHAR)
- ruolo (ENUM)
- organization_id (UUID, FK)
- is_active (BOOLEAN)
```

#### `verbali` - Processi Verbali
```sql
- id (UUID, PK)
- numero_verbale, anno (VARCHAR, INTEGER)
- organization_id, created_by (UUID, FK)
- trasgressore_id, obbligato_id (UUID, FK)
- contestazione_tipo, pec_esito (VARCHAR)
- verbalizzanti (TEXT)
- data_fatto, ora_fatto, luogo_fatto (DATE, TIME, TEXT)
- narrazione_fatto, dichiarazione_trasgressore (TEXT)
- autorita_pagamento_id (UUID, FK)
- sequestro_* (campi per sequestro)
- status (ENUM: bozza, inviato, confermato, archiviato)
```

#### `trasgressori` - Anagrafica
```sql
- id (UUID, PK)
- cognome, nome (VARCHAR)
- luogo_nascita, data_nascita (VARCHAR, DATE)
- residenza_comune, residenza_indirizzo (VARCHAR, TEXT)
- documento_* (campi documento)
- codice_fiscale (VARCHAR, UNIQUE)
- telefono, email (VARCHAR)
```

## 🔐 Sicurezza

### Row Level Security (RLS)
Tutte le tabelle principali hanno RLS abilitato con politiche che garantiscono:
- Gli utenti vedono solo i dati della loro organizzazione e sottorganizzazioni
- MARICOGECAP ha accesso completo
- Le Direzioni Marittime vedono le loro Capitanerie
- Le Capitanerie vedono i loro Uffici Circondariali

### Autenticazione
- **Supabase Auth** per gestione sessioni sicure
- **JWT Tokens** per autenticazione stateless
- **Refresh automatico** dei token
- **Logout sicuro** con invalidazione token

### Validazione Dati
- **Validazione client-side** con React Hook Form
- **Validazione server-side** con constraints PostgreSQL
- **Sanitizzazione** input per prevenire XSS
- **Escape HTML** per sicurezza output

## 📱 Progressive Web App

### Caratteristiche PWA
- **Installabile** su dispositivi mobili e desktop
- **Offline-first** con service worker
- **Push notifications** per alert importanti
- **Responsive design** per tutti i dispositivi

### Service Worker
- **Cache strategy** intelligente
- **Background sync** per operazioni offline
- **Update management** automatico

## 🎨 Design System

### Tema Capitanerie di Porto
- **Colori**: Navy blue (#003366) e Ocean blue (#0066cc)
- **Typography**: Inter font per leggibilità moderna
- **Icons**: Lucide React per consistenza
- **Animations**: Framer Motion per fluidità

### Componenti UI
- **Design System** consistente
- **Dark/Light mode** supportato
- **Accessibility** WCAG 2.1 compliant
- **Mobile-first** responsive design

## 📈 Analytics e Reporting

### Dashboard Analytics
- **Verbali per periodo** con trend analysis
- **Tipi di infrazione** con distribuzione
- **Performance organizzazioni** con confronti
- **Mappe geografiche** con heatmap infrazioni

### Report Automatici
- **Report mensili** per ogni organizzazione
- **Alert recidività** per trasgressori
- **Statistiche comparative** tra organizzazioni
- **Export dati** in Excel/CSV

## 🔄 Integrazione Software Originale

### Generatore Verbali
Il software originale è stato integrato come componente React:
- **Funzionalità complete** mantenute
- **Database Excel** caricabile
- **Generazione HTML/Word** preservata
- **Salvataggio automatico** nel database nazionale

### Migrazione Dati
- **Import Excel** per dati esistenti
- **Validazione automatica** durante import
- **Mapping campi** intelligente
- **Backup automatico** prima import

## 🚀 Roadmap Futura

### Fase 2 - Analytics Avanzate
- [ ] Machine Learning per predizione recidività
- [ ] AI per categorizzazione automatica infrazioni
- [ ] Dashboard predittive con forecasting
- [ ] Alert intelligenti basati su pattern

### Fase 3 - Mobile App
- [ ] App nativa iOS/Android
- [ ] Geolocalizzazione automatica
- [ ] Foto e documenti integrati
- [ ] Sincronizzazione offline avanzata

### Fase 4 - Integrazioni
- [ ] API pubbliche per sistemi esterni
- [ ] Integrazione con sistemi giudiziari
- [ ] Connettori per software contabilità
- [ ] Webhook per notifiche automatiche

## 🤝 Contributi

### Come Contribuire
1. Fork del repository
2. Crea feature branch (`git checkout -b feature/amazing-feature`)
3. Commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri Pull Request

### Standard di Codice
- **TypeScript** strict mode
- **ESLint** + **Prettier** per formattazione
- **Conventional Commits** per messaggi
- **Test coverage** minimo 80%

## 📄 Licenza

Questo progetto è sviluppato per le Capitanerie di Porto italiane e non è open source. Tutti i diritti riservati.

## 👥 Team di Sviluppo

- **Sviluppatore Principale**: Andrea Cicala (T.V. CP)
- **Architettura**: Sistema gerarchico nazionale
- **Design**: Interfaccia moderna e intuitiva
- **Database**: Schema ottimizzato per performance

## 📞 Supporto

Per supporto tecnico o domande:
- **Email**: supporto@hub-capitanerie.it
- **Documentazione**: [Wiki del progetto]
- **Issues**: [GitHub Issues]

---

**© 2024 HUB Nazionale Capitanerie di Porto - Tutti i diritti riservati**

*Sistema sviluppato per rivoluzionare la gestione dei processi verbali delle Capitanerie di Porto italiane*
