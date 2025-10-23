# Istruzioni per il Logo Effigie dello Stato nei Documenti Word

## 📋 Come Funziona

Il software ora incorpora **DIRETTAMENTE** il logo dell'effigie dello stato nei documenti Word (.docx) scaricati, senza bisogno di file ZIP o dipendenze esterne.

## ✅ Requisiti per il Funzionamento

### Opzione 1: Web Server (CONSIGLIATO)
Per vedere il logo nei documenti Word, l'applicazione **DEVE** essere aperta da un web server, non direttamente come file HTML locale.

**Web server supportati:**
- **Netlify** (già configurato per PWA) ✅
- **Live Server** (estensione VS Code)
- **Python HTTP Server**: `python -m http.server 8000`
- Qualsiasi altro web server (Apache, Nginx, etc.)

### Opzione 2: File Locale (LIMITATO)
Se apri l'app direttamente con `file://` (doppio click su index.html), il logo:
- ✅ **Apparirà** nei report HTML
- ❌ **NON apparirà** nei documenti Word (a causa di restrizioni di sicurezza del browser)

## 🔧 Come Testare

### Test Locale con Live Server (VS Code)
1. Apri la cartella del progetto in VS Code
2. Installa l'estensione "Live Server"
3. Click destro su `index.html` → "Open with Live Server"
4. L'app si aprirà su `http://127.0.0.1:5500`
5. Genera un documento Word → il logo dovrebbe apparire ✅

### Test su Netlify (Produzione)
1. Carica i file su Netlify (come già fatto per la PWA)
2. Apri l'app dal link Netlify
3. Genera un documento Word → il logo dovrebbe apparire ✅

## 🐛 Diagnostica

Apri la Console del browser (F12) e cerca questi messaggi:

### Se il logo viene caricato correttamente:
```
✓ Effigie caricata via fetch, dimensione: XXXX bytes
✓ Base64 length: XXXXXX
✓ Immagine effigie dello stato caricata per i documenti Word
```

### Se il logo NON viene caricato:
```
⚠ ATTENZIONE: Logo effigie NON caricato. Nei documenti Word non apparirà il logo.
⚠ Per vedere il logo nei Word, apri l'app da un web server (es: Netlify, Live Server)
```

## 📝 Note Tecniche

- Il logo viene caricato automaticamente all'avvio dell'app e convertito in base64
- Il base64 viene incorporato direttamente nell'HTML passato a `html-docx.js`
- I report HTML mostreranno sempre il logo (anche da file locale)
- I documenti Word mostreranno il logo solo se l'app è servita da un web server

## 🚀 Soluzione Definitiva

**Per uso in produzione, usa sempre Netlify o un web server.**
L'app è già configurata come PWA e funzionerà perfettamente con tutti i loghi incorporati.

