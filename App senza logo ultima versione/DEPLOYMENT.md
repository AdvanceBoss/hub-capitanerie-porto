# 🚀 Istruzioni per il Deployment del HUB Nazionale Capitanerie di Porto

## 📋 Checklist Pre-Deployment

### ✅ 1. Configurazione Supabase

1. **Crea nuovo progetto Supabase**
   - Vai su [supabase.com](https://supabase.com)
   - Crea nuovo progetto
   - Scegli regione Europa (Frankfurt o London)

2. **Configura Database**
   ```bash
   # Esegui questi script SQL nell'ordine:
   # 1. supabase-schema.sql (schema completo)
   # 2. sample-data.sql (dati di esempio)
   ```

3. **Configura Autenticazione**
   - Vai su Authentication > Settings
   - Abilita "Enable email confirmations" se necessario
   - Configura URL di redirect: `https://your-app.netlify.app`

4. **Configura RLS (Row Level Security)**
   ```sql
   -- Esegui dopo aver creato gli utenti di esempio
   -- Le politiche RLS sono già incluse nello schema
   ```

### ✅ 2. Configurazione Netlify

1. **Connetti Repository**
   - Vai su [netlify.com](https://netlify.com)
   - Connetti il repository GitHub
   - Configura build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

2. **Configura Variabili d'Ambiente**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_APP_NAME=HUB Nazionale Capitanerie di Porto
   VITE_APP_VERSION=1.0.0
   VITE_APP_ENVIRONMENT=production
   ```

3. **Configura Dominio Personalizzato** (Opzionale)
   - Vai su Domain settings
   - Aggiungi dominio personalizzato
   - Configura SSL automatico

### ✅ 3. Test Pre-Produzione

1. **Test Locale**
   ```bash
   npm run build
   npm run preview
   # Testa su http://localhost:4173
   ```

2. **Test Account Demo**
   - MARICOGECAP: `admin@maricogecap.it` / `admin123`
   - Direzione Palermo: `direttore@dm.palermo.it` / `direttore123`
   - Capitaneria Porto Empedocle: `comandante@cp.portoempedocle.it` / `comandante123`
   - UCM Licata: `responsabile@ucm.licata.it` / `responsabile123`

3. **Test Funzionalità**
   - [ ] Login con tutti i ruoli
   - [ ] Dashboard carica correttamente
   - [ ] Navigazione tra sezioni
   - [ ] Responsive design su mobile
   - [ ] Dark/Light mode toggle

## 🔧 Configurazione Avanzata

### Database Performance

1. **Indici Ottimizzati**
   ```sql
   -- Gli indici sono già inclusi nello schema
   -- Monitora performance con Supabase Dashboard
   ```

2. **Backup Automatico**
   - Supabase fa backup automatici
   - Configura backup manuali se necessario

### Sicurezza

1. **HTTPS Forzato**
   - Netlify forza HTTPS automaticamente
   - Verifica certificato SSL

2. **CORS Configuration**
   ```sql
   -- Configura CORS in Supabase se necessario
   -- Per default è configurato per Netlify
   ```

### Monitoring

1. **Supabase Monitoring**
   - Monitora performance database
   - Configura alert per errori

2. **Netlify Analytics**
   - Abilita Netlify Analytics
   - Monitora performance app

## 🚀 Deployment Steps

### Step 1: Push Codice
```bash
git add .
git commit -m "feat: initial HUB deployment"
git push origin main
```

### Step 2: Verifica Build
- Netlify farà build automatico
- Controlla build logs per errori
- Verifica deploy preview

### Step 3: Test Produzione
- Testa tutte le funzionalità
- Verifica performance
- Testa su dispositivi diversi

### Step 4: Go Live
- Promuovi deploy preview a produzione
- Configura dominio personalizzato
- Annuncia il lancio

## 📊 Post-Deployment

### Monitoraggio

1. **Performance**
   - Monitora Core Web Vitals
   - Verifica tempi di caricamento
   - Controlla errori JavaScript

2. **Database**
   - Monitora query performance
   - Verifica utilizzo storage
   - Controlla connessioni attive

3. **Utenti**
   - Monitora registrazioni
   - Traccia utilizzo features
   - Analizza feedback

### Manutenzione

1. **Aggiornamenti**
   - Aggiorna dipendenze regolarmente
   - Monitora security advisories
   - Testa aggiornamenti in staging

2. **Backup**
   - Backup database settimanali
   - Backup configurazioni
   - Documenta modifiche

## 🆘 Troubleshooting

### Problemi Comuni

1. **Build Fallisce**
   ```bash
   # Controlla errori in build logs
   # Verifica variabili d'ambiente
   # Testa build locale
   ```

2. **Database Connection Error**
   ```bash
   # Verifica URL Supabase
   # Controlla API key
   # Verifica RLS policies
   ```

3. **Login Non Funziona**
   ```bash
   # Verifica configurazione auth
   # Controlla redirect URLs
   # Verifica dati utenti
   ```

### Supporto

- **Documentazione**: README.md
- **Issues**: GitHub Issues
- **Email**: supporto@hub-capitanerie.it

## 🎉 Lancio

### Comunicazione

1. **Email agli Utenti**
   - Annuncia nuovo sistema
   - Fornisce credenziali demo
   - Include istruzioni d'uso

2. **Training**
   - Sessioni di formazione online
   - Documentazione utente
   - Video tutorial

3. **Supporto**
   - Hotline per primi giorni
   - Chat support
   - FAQ aggiornate

---

**🚀 Il HUB Nazionale Capitanerie di Porto è pronto per rivoluzionare la gestione dei verbali in Italia!**
