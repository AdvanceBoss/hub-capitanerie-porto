// =============================================
//               script.js
// =============================================

// ----- Dichiarazioni Variabili Globali -----
let excelData = [], columnMapping = {}, searchColumnIndex = -1, selectedInfractionIndices = [];
let excelDataLocale = [], columnMappingLocale = {};
let structuredData = { 
    nazionale: { titles: [], infractionsByTitle: {}, allInfractions: [] },
    locale: { titles: [], infractionsByTitle: {}, allInfractions: [] }
};
let paymentAuthorityData = new Map(), authorityNamesList = [];
let db;
let effigieBase64 = null;

// ----- Variabili per Elementi DOM -----
let fileInput, loadDataBtn, clearDataBtn, offlineStatus, offlineDate, searchSection, searchInput, searchBtn, toggleTitlesBtn, titleListContainer, titleList, resultsListContainer, resultsList, resultsHeader, verbaleTemplateContainer, generateReportBtn, generateDocBtn, loadingMessage, loadSuccessMessage, loadErrorMessage, noResultsMessage, generateMessage, fileNameDisplay, obbligatoFieldsDiv, coincideRadioButtons, contestazioneRadioButtons, contestazioneMotivoTextarea, pecRadioButtons, pecIndirizzoInput, input_43, toggleAuthoritiesBtn, authorityListContainer, authorityList, input_39, input_40, input_42, input_44, input_45, input_g, inputIbanDisplay, speseNotificaImportoContainer, inputSpeseNotificaImporto, input_36, inputComandoProcedenteNome, riduzione30RadioButtons, resetBtn;
let sequestroRadioButtons, sequestroFieldsContainer, generateSequestroDocBtn, sequestroTemplateContainer, tipoCustodiaRadioButtons, custodeFieldsContainer, normativaRadioButtons;
let sequestroTrasgressoreRadioButtons, sequestroTrasgressoreFields, sequestroAltroFields, custodeTrasgressoreRadioButtons, custodeTrasgressoreFields, custodeAltroFields;
let inputSeq09Norma, checkSequestroBtn;
let modalOverlay, modalIcon, modalTitle, modalMessage, modalCloseBtn;

// ----- Costanti per IndexedDB -----
const DB_NAME = 'VerbaliDB';
const STORE_NAME = 'BancaDatiStore';

// ----- Funzioni di Supporto (Helpers) -----
const escapeHtml = (unsafe) => (typeof unsafe !== 'string') ? '' : unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const showLoadMessage = (type) => { [loadingMessage, loadSuccessMessage, loadErrorMessage].forEach(el => el.classList.add('hidden')); if (type === 'loading') loadingMessage.classList.remove('hidden'); if (type === 'success') loadSuccessMessage.classList.remove('hidden'); if (type === 'error') loadErrorMessage.classList.remove('hidden'); };
const extractNumberInParentheses = (text) => { const match = typeof text === 'string' ? text.match(/\((\d+)\)/) : null; return match ? match[1] : null; };
const parseHeader = (headerRow) => { const mapping = {}; headerRow.forEach((cell, index) => { const num = extractNumberInParentheses(cell); if (num) mapping[num] = index; }); searchColumnIndex = mapping['24'] ?? -1; return mapping; };
const parseHeaderWithSequestro = (headerRow) => {
    const mapping = {};
    headerRow.forEach((cell, index) => {
        const num = extractNumberInParentheses(cell);
        if (num) mapping[num] = index;
    });
    // Rileva la colonna "sequestro" per nome, senza vincolo alla lettera H
    const sequestroIndex = headerRow.findIndex(cell => String(cell).toLowerCase().includes('sequestro'));
    if (sequestroIndex !== -1) {
        mapping['sequestro'] = sequestroIndex;
    }
    searchColumnIndex = mapping['24'] ?? -1;
    return mapping;
};
const isRowCompleteInfraction = (row, mapping) => ['24', '25', '26', '28'].every(key => key in mapping && row && row.length > mapping[key] && String(row[mapping[key]]).trim() !== '');
const isPotentialTitleRow = (row, mapping) => ('24' in mapping && row && row.length > mapping['24'] && String(row[mapping['24']]).trim() !== '' && !isRowCompleteInfraction(row, mapping));
const highlightTerm = (text, term) => { if (!term || !text) return escapeHtml(text || ''); const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); return escapeHtml(text).replace(new RegExp(`(${escapedTerm})`, 'gi'), '<span class="highlight">$1</span>'); };
const getCurrentNormativaType = () => document.querySelector('input[name="normativa_tipo"]:checked')?.value || 'nazionale';

// ----- Caricamento Immagine Effigie in Base64 -----
async function loadEffigieAsBase64() {
    try {
        console.log('Caricamento effigie-stato.png come base64...');
        
        // Metodo 1: Prova con fetch (funziona se servito da web server)
        try {
            const response = await fetch('effigie-stato.png');
            if (response.ok) {
                const blob = await response.blob();
                const base64 = await blobToBase64(blob);
                console.log('✓ Effigie caricata via fetch, dimensione:', blob.size, 'bytes');
                console.log('✓ Base64 length:', base64.length);
                return base64;
            }
        } catch (fetchError) {
            console.warn('Fetch non disponibile (file:// protocol), provo metodo alternativo');
        }
        
        // Metodo 2: Usa FileReader con input file nascosto (solo se fetch fallisce)
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // Prova a convertire in base64
                    try {
                        const dataURL = canvas.toDataURL('image/png');
                        console.log('✓ Effigie caricata via canvas, dimensioni:', img.width, 'x', img.height);
                        resolve(dataURL);
                    } catch (canvasError) {
                        console.error('❌ Canvas toDataURL bloccato (CORS/Tainted):', canvasError.message);
                        console.warn('⚠ Logo non sarà visibile nei Word. Serve web server (non file://)');
                        resolve(null);
                    }
                } catch (error) {
                    console.error('❌ Errore conversione canvas:', error);
                    resolve(null);
                }
            };
            img.onerror = function() {
                console.error('❌ Errore caricamento effigie-stato.png');
                resolve(null);
            };
            img.src = 'effigie-stato.png';
        });
        
    } catch (error) {
        console.error('❌ Errore generale caricamento effigie:', error);
        return null;
    }
}

// Helper per convertire Blob in base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// ----- Gestione IndexedDB (Dati Offline) -----
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = (event) => reject("Errore nell'apertura di IndexedDB.");
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            let db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}
async function saveDataToDB(data) {
    if (!db) await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data);
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject('Errore nel salvataggio dei dati: ' + event.target.error);
    });
}
async function loadDataFromDB() {
    if (!db) await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('mainData');
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('Errore nel caricamento dei dati: ' + event.target.error);
    });
}
async function clearDataFromDB() {
    if (!db) await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject('Errore nella cancellazione dei dati: ' + event.target.error);
    });
}

// ----- Funzioni Principali dell'Applicazione -----
const processAndActivateData = async (dataFromExcel, source) => {
    try {
        // Inizializza la struttura dati per entrambi i tipi di normativa
        structuredData = { 
            nazionale: { titles: [], infractionsByTitle: {}, allInfractions: [] },
            locale: { titles: [], infractionsByTitle: {}, allInfractions: [] }
        };

        // Processa il foglio Normativa Nazionale (primo foglio)
        const normativaNazionaleSheet = dataFromExcel.Sheets[dataFromExcel.SheetNames[0]];
        const normativaNazionaleData = XLSX.utils.sheet_to_json(normativaNazionaleSheet, { header: 1, defval: '' });
        if (normativaNazionaleData.length < 2) throw new Error("Foglio Normativa Nazionale vuoto o solo intestazione.");
        
        columnMapping = parseHeaderWithSequestro(normativaNazionaleData[0]);
        if (['24', '25', '26', '28'].some(c => columnMapping[c] === undefined)) throw new Error("Mancano colonne Infrazioni essenziali nel Foglio Normativa Nazionale.");

        // Processa infrazioni nazionali
        let currentTitle = "Nessun Titolo Specificato";
        const uniqueTitlesNazionale = new Set();
        for (let i = 1; i < normativaNazionaleData.length; i++) {
            const row = normativaNazionaleData[i];
            if (!row?.length) continue;
            const infractionText = String(row[searchColumnIndex] || '').trim();
            if (isPotentialTitleRow(row, columnMapping)) {
                currentTitle = infractionText;
                if (!structuredData.nazionale.infractionsByTitle[currentTitle]) {
                    structuredData.nazionale.infractionsByTitle[currentTitle] = [];
                    uniqueTitlesNazionale.add(currentTitle);
                }
            } else if (isRowCompleteInfraction(row, columnMapping)) {
                // Estrai informazioni di sequestro dalla colonna H
                const sequestroInfo = columnMapping['sequestro'] !== undefined && row.length > columnMapping['sequestro'] 
                    ? String(row[columnMapping['sequestro']] || '').trim() 
                    : '';
                
                const infractionObj = { 
                    originalIndex: i, 
                    text: infractionText, 
                    normativaType: 'nazionale',
                    sequestroInfo: sequestroInfo,
                    hasSequestroObbligatorio: sequestroInfo !== ''
                };
                structuredData.nazionale.allInfractions.push(infractionObj);
                if (!structuredData.nazionale.infractionsByTitle[currentTitle]) {
                    structuredData.nazionale.infractionsByTitle[currentTitle] = [];
                    if (!uniqueTitlesNazionale.has(currentTitle)) uniqueTitlesNazionale.add(currentTitle);
                }
                structuredData.nazionale.infractionsByTitle[currentTitle].push(infractionObj);
            }
        }
        structuredData.nazionale.titles = Array.from(uniqueTitlesNazionale).sort();

        // Processa il foglio Normativa Locale (secondo foglio)
        if (dataFromExcel.SheetNames.length > 1) {
            const normativaLocaleSheet = dataFromExcel.Sheets[dataFromExcel.SheetNames[1]];
            const normativaLocaleData = XLSX.utils.sheet_to_json(normativaLocaleSheet, { header: 1, defval: '' });
            if (normativaLocaleData.length >= 2) {
                const localeColumnMapping = parseHeaderWithSequestro(normativaLocaleData[0]);
                if (['24', '25', '26', '28'].every(c => localeColumnMapping[c] !== undefined)) {
                    // Memorizza i dati locali globalmente
                    excelDataLocale = normativaLocaleData;
                    columnMappingLocale = localeColumnMapping;
                    
                    currentTitle = "Nessun Titolo Specificato";
                    const uniqueTitlesLocale = new Set();
                    for (let i = 1; i < normativaLocaleData.length; i++) {
                        const row = normativaLocaleData[i];
                        if (!row?.length) continue;
                        const infractionText = String(row[localeColumnMapping['24']] || '').trim();
                        if (isPotentialTitleRow(row, localeColumnMapping)) {
                            currentTitle = infractionText;
                            if (!structuredData.locale.infractionsByTitle[currentTitle]) {
                                structuredData.locale.infractionsByTitle[currentTitle] = [];
                                uniqueTitlesLocale.add(currentTitle);
                            }
                        } else if (isRowCompleteInfraction(row, localeColumnMapping)) {
                            // Estrai informazioni di sequestro dalla colonna H
                            const sequestroInfo = localeColumnMapping['sequestro'] !== undefined && row.length > localeColumnMapping['sequestro'] 
                                ? String(row[localeColumnMapping['sequestro']] || '').trim() 
                                : '';
                            
                            const infractionObj = { 
                                originalIndex: i, 
                                text: infractionText, 
                                normativaType: 'locale',
                                sequestroInfo: sequestroInfo,
                                hasSequestroObbligatorio: sequestroInfo !== ''
                            };
                            structuredData.locale.allInfractions.push(infractionObj);
                            if (!structuredData.locale.infractionsByTitle[currentTitle]) {
                                structuredData.locale.infractionsByTitle[currentTitle] = [];
                                if (!uniqueTitlesLocale.has(currentTitle)) uniqueTitlesLocale.add(currentTitle);
                            }
                            structuredData.locale.infractionsByTitle[currentTitle].push(infractionObj);
                        }
                    }
                    structuredData.locale.titles = Array.from(uniqueTitlesLocale).sort();
                }
            }
        }

        // Mantieni excelData per compatibilità (usa i dati nazionali come default)
        excelData = normativaNazionaleData;

        paymentAuthorityData.clear();
        authorityNamesList = [];
        // I dati di pagamento sono ora nel terzo foglio (indice 2)
        if (dataFromExcel.SheetNames.length > 2) {
            const paymentSheet = dataFromExcel.Sheets[dataFromExcel.SheetNames[2]];
            const paymentDataRaw = XLSX.utils.sheet_to_json(paymentSheet, { header: 1, defval: '' });
            const startRowSheet = (paymentDataRaw.length > 0 && paymentDataRaw[0]?.some(cell => String(cell).trim() !== '')) ? 1 : 0;
            for (let i = startRowSheet; i < paymentDataRaw.length; i++) {
                const row = paymentDataRaw[i];
                if (row && row.length > 8 && String(row[0]).trim()) {
                    const rawName = String(row[0]).trim();
                    paymentAuthorityData.set(rawName.toLowerCase(), { rawName, address: String(row[1]||'').trim(), pec: String(row[2]||'').trim(), officeCode: String(row[3]||'').trim(), territoryCode: String(row[4]||'').trim(), reasonCode: String(row[5]||'').trim(), taxCode: String(row[6]||'').trim(), iban: String(row[8]||'').trim() });
                }
            }
            authorityNamesList = Array.from(paymentAuthorityData.values()).map(d => d.rawName).sort();
        }

        if(source === 'file') {
            const dataToSave = {
                id: 'mainData',
                excelData: excelData,
                excelDataLocale: excelDataLocale,
                columnMapping: columnMapping,
                columnMappingLocale: columnMappingLocale,
                structuredData: structuredData,
                paymentAuthorityData: Array.from(paymentAuthorityData.entries()),
                savedDate: new Date().toISOString()
            };
            await saveDataToDB(dataToSave);
            updateOfflineStatus(true, dataToSave.savedDate);
            showLoadMessage('success');
        } else {
             updateOfflineStatus(true, (await loadDataFromDB()).savedDate);
        }

        searchSection.classList.remove('hidden');
        [searchInput, searchBtn, toggleTitlesBtn, input_43, toggleAuthoritiesBtn, checkSequestroBtn].forEach(el => el.disabled = false);
        displayTitles(); 
        displayAuthorities();

    } catch (error) {
        console.error("ERRORE elaborazione dati:", error);
        loadErrorMessage.textContent = `Errore: ${error.message}`;
        showLoadMessage('error');
        updateOfflineStatus(false);
    }
};

const handleFile = (file) => {
    showLoadMessage('loading');
    resetSearchAndGenerate();
    const reader = new FileReader();
    reader.onload = (e) => {
        const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        processAndActivateData(workbook, 'file');
    };
    reader.onerror = () => { loadErrorMessage.textContent = "Errore lettura file."; showLoadMessage('error'); };
    reader.readAsArrayBuffer(file);
};

// ----- Funzioni di Gestione UI (Interfaccia Utente) -----
const updateOfflineStatus = (isDataPresent, date) => {
    if (isDataPresent) {
        offlineStatus.textContent = "Presenti in memoria";
        offlineStatus.className = "font-bold text-green-700";
        offlineDate.textContent = `Ultimo salvataggio: ${new Date(date).toLocaleString('it-IT')}`;
        offlineDate.classList.remove('hidden');
        clearDataBtn.classList.remove('hidden');
    } else {
        offlineStatus.textContent = "Non presenti";
        offlineStatus.className = "font-bold text-red-700";
        offlineDate.classList.add('hidden');
        searchSection.classList.add('hidden');
        clearDataBtn.classList.add('hidden');
    }
};
const toggleObbligatoFields = (disable) => { obbligatoFieldsDiv.querySelectorAll('input, textarea').forEach(input => { input.disabled = disable; if (disable) input.value = ''; }); };
const handleContestazioneChange = () => { contestazioneMotivoTextarea.classList.toggle('hidden', document.querySelector('input[name="contestazione_tipo"]:checked')?.value !== 'differita'); };
const handlePecChange = () => { const show = document.querySelector('input[name="pec_esito"]:checked')?.value === 'rilevata'; pecIndirizzoInput.classList.toggle('hidden', !show); if (!show) pecIndirizzoInput.value = ''; };
const handleSpeseNotificaChange = () => { const show = document.querySelector('input[name="spese_notifica_presenti"]:checked')?.value === 'si'; speseNotificaImportoContainer.classList.toggle('hidden', !show); if (!show) inputSpeseNotificaImporto.value = ''; };
const handleSequestroChange = () => {
    const isSequestro = document.querySelector('input[name="sequestro_presente"]:checked')?.value === 'si';
    sequestroFieldsContainer.classList.toggle('hidden', !isSequestro);
    generateSequestroDocBtn.classList.toggle('hidden', !isSequestro);
};
const handleCustodiaChange = () => {
    const isCustodeEsterno = document.querySelector('input[name="tipo_custodia"]:checked')?.value === 'esterno';
    custodeFieldsContainer.classList.toggle('hidden', !isCustodeEsterno);
};

const handleSequestroTrasgressoreChange = () => {
    const selectedValue = document.querySelector('input[name="sequestro_trasgressore"]:checked')?.value;
    const isTrasgressore = selectedValue === 'si';
    const isAltro = selectedValue === 'no';
    
    sequestroTrasgressoreFields.classList.toggle('hidden', !isTrasgressore);
    sequestroAltroFields.classList.toggle('hidden', !isAltro);
    
    if (isTrasgressore) {
        copyTrasgressoreDataToSequestro();
    } else if (isAltro) {
        clearSequestroAltroFields();
    }
};

const handleCustodeTrasgressoreChange = () => {
    const selectedValue = document.querySelector('input[name="custode_trasgressore"]:checked')?.value;
    const isCustodeTrasgressore = selectedValue === 'si';
    const isAltro = selectedValue === 'no';
    
    custodeTrasgressoreFields.classList.toggle('hidden', !isCustodeTrasgressore);
    custodeAltroFields.classList.toggle('hidden', !isAltro);
    
    if (isCustodeTrasgressore) {
        copyTrasgressoreDataToCustode();
    } else if (isAltro) {
        clearCustodeAltroFields();
    }
};

const copyTrasgressoreDataToSequestro = () => {
    const trasgressoreData = {
        cognome: document.getElementById('input_1').value,
        nome: document.getElementById('input_2').value,
        luogo_nascita: document.getElementById('input_3').value,
        data_nascita: document.getElementById('input_4').value,
        residenza: document.getElementById('input_5').value,
        indirizzo: document.getElementById('input_6').value,
        documento_tipo: document.getElementById('input_7').value,
        documento_numero: document.getElementById('input_8').value,
        documento_rilasciato: document.getElementById('input_9').value,
        documento_data: document.getElementById('input_10').value,
        cf: document.getElementById('input_11').value
    };
    
    document.getElementById('input_seq_cognome').value = trasgressoreData.cognome;
    document.getElementById('input_seq_nome').value = trasgressoreData.nome;
    document.getElementById('input_seq_luogo_nascita').value = trasgressoreData.luogo_nascita;
    document.getElementById('input_seq_data_nascita').value = trasgressoreData.data_nascita;
    document.getElementById('input_seq_residenza').value = trasgressoreData.residenza;
    document.getElementById('input_seq_indirizzo').value = trasgressoreData.indirizzo;
    document.getElementById('input_seq_documento_tipo').value = trasgressoreData.documento_tipo;
    document.getElementById('input_seq_documento_numero').value = trasgressoreData.documento_numero;
    document.getElementById('input_seq_documento_rilasciato').value = trasgressoreData.documento_rilasciato;
    document.getElementById('input_seq_documento_data').value = trasgressoreData.documento_data;
    document.getElementById('input_seq_cf').value = trasgressoreData.cf;
};

const copyTrasgressoreDataToCustode = () => {
    const trasgressoreData = {
        cognome: document.getElementById('input_1').value,
        nome: document.getElementById('input_2').value,
        luogo_nascita: document.getElementById('input_3').value,
        data_nascita: document.getElementById('input_4').value,
        residenza: document.getElementById('input_5').value,
        indirizzo: document.getElementById('input_6').value,
        documento_tipo: document.getElementById('input_7').value,
        documento_rilasciato: document.getElementById('input_9').value,
        documento_data: document.getElementById('input_10').value,
        qualita: document.getElementById('input_37').value
    };
    
    document.getElementById('input_seq_12').value = `${trasgressoreData.cognome} ${trasgressoreData.nome}`;
    document.getElementById('input_seq_13').value = trasgressoreData.luogo_nascita;
    document.getElementById('input_seq_14').value = trasgressoreData.data_nascita;
    document.getElementById('input_seq_15').value = trasgressoreData.residenza;
    document.getElementById('input_seq_16').value = trasgressoreData.indirizzo;
    document.getElementById('input_seq_17').value = trasgressoreData.documento_tipo;
    document.getElementById('input_seq_18').value = trasgressoreData.documento_rilasciato;
    document.getElementById('input_seq_19').value = trasgressoreData.documento_data;
    document.getElementById('input_seq_20').value = trasgressoreData.qualita;
};

const clearSequestroAltroFields = () => {
    const fields = ['input_seq_altro_cognome', 'input_seq_altro_nome', 'input_seq_altro_luogo_nascita', 'input_seq_altro_data_nascita', 'input_seq_altro_residenza', 'input_seq_altro_indirizzo', 'input_seq_altro_documento_tipo', 'input_seq_altro_documento_numero', 'input_seq_altro_documento_rilasciato', 'input_seq_altro_documento_data', 'input_seq_altro_cf'];
    fields.forEach(id => document.getElementById(id).value = '');
};

const clearCustodeAltroFields = () => {
    const fields = ['input_seq_altro_12', 'input_seq_altro_13', 'input_seq_altro_14', 'input_seq_altro_15', 'input_seq_altro_16', 'input_seq_altro_17', 'input_seq_altro_18', 'input_seq_altro_19', 'input_seq_altro_20'];
    fields.forEach(id => document.getElementById(id).value = '');
};
const displayInfractionsForTitle = (title) => {
    resultsList.innerHTML = '';
    const normativaType = getCurrentNormativaType();
    const currentData = structuredData[normativaType];
    resultsHeader.textContent = `Infrazioni per titolo: "${escapeHtml(title)}" (Seleziona per popolare):`;
    currentData.infractionsByTitle[title]?.forEach(infraction => {
        const listItem = document.createElement('li');
        const checkboxId = `infraction_${infraction.originalIndex}_${infraction.normativaType}`;
        const infractionId = `${infraction.originalIndex}_${infraction.normativaType}`;
        listItem.innerHTML = `<input type="checkbox" id="${checkboxId}" value="${infractionId}"><label for="${checkboxId}" class="flex-grow cursor-pointer pl-3">${escapeHtml(infraction.text)}</label>`;
        
        const checkbox = listItem.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            updateGenerateButtonsState();
        });
        
        if (selectedInfractionIndices.includes(infractionId)) checkbox.checked = true;
        resultsList.appendChild(listItem);
    });
    resultsListContainer.style.display = 'block';
};
const performSearch = () => {
    const searchTerm = searchInput.value.trim();
    resultsList.innerHTML = ''; noResultsMessage.classList.add('hidden');
    if (!searchTerm) { resultsListContainer.style.display = 'none'; return; }
    const normativaType = getCurrentNormativaType();
    const currentData = structuredData[normativaType];
    const filtered = currentData.allInfractions.filter(inf => inf.text.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filtered.length) {
        resultsHeader.textContent = `Risultati ricerca per "${escapeHtml(searchTerm)}":`;
        filtered.forEach(inf => {
            const listItem = document.createElement('li');
            const checkboxId = `infraction_${inf.originalIndex}_${inf.normativaType}`;
            const infractionId = `${inf.originalIndex}_${inf.normativaType}`;
            listItem.innerHTML = `<input type="checkbox" id="${checkboxId}" value="${infractionId}"><label for="${checkboxId}" class="flex-grow cursor-pointer pl-3">${highlightTerm(inf.text, searchTerm)}</label>`;
            
            const checkbox = listItem.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                updateGenerateButtonsState();
            });
            
            if (selectedInfractionIndices.includes(infractionId)) checkbox.checked = true;
            resultsList.appendChild(listItem);
        });
        resultsListContainer.style.display = 'block';
    } else {
        noResultsMessage.textContent = `Nessun risultato trovato.`; noResultsMessage.classList.remove('hidden'); resultsListContainer.style.display = 'none';
    }
};
const resetSearchAndGenerate = () => {
    resultsList.innerHTML = ''; resultsListContainer.style.display = 'none';
    noResultsMessage.classList.add('hidden');
    generateReportBtn.classList.add('hidden'); generateDocBtn.classList.add('hidden');
    generateReportBtn.disabled = true; generateDocBtn.disabled = true;
    generateMessage.classList.add('hidden');
    selectedInfractionIndices = []; searchInput.value = '';
};
const displayTitles = () => { 
    const normativaType = getCurrentNormativaType();
    const currentData = structuredData[normativaType];
    titleList.innerHTML = currentData.titles.length ? currentData.titles.map(t => `<li class="title-item" data-title="${escapeHtml(t)}">${escapeHtml(t)}</li>`).join('') : '<li class="p-3 text-sm text-gray-500 italic">Nessun titolo trovato.</li>'; 
};
const displayAuthorities = () => { authorityList.innerHTML = authorityNamesList.map(name => `<li class="authority-item" data-authority-name="${escapeHtml(name)}">${escapeHtml(name)}</li>`).join(''); };
const updatePaymentFieldsUI = (selectedName = null) => {
    const authorityKey = (selectedName || input_43.value.trim()).toLowerCase();
    const details = paymentAuthorityData.get(authorityKey);
    if(selectedName) input_43.value = selectedName;
    if (details) {
        input_44.value = details.address; input_45.value = details.pec; input_39.value = details.officeCode;
        input_40.value = details.territoryCode; input_42.value = details.reasonCode; input_g.value = details.taxCode;
        inputIbanDisplay.value = details.iban;
    } else if (!selectedName) {
        [input_44, input_45, input_39, input_40, input_42, input_g, inputIbanDisplay].forEach(el => el.value = '');
    }
};
const updateGenerateButtonsState = () => {
    selectedInfractionIndices = Array.from(document.querySelectorAll('#resultsList input:checked')).map(cb => cb.value);
    const enabled = selectedInfractionIndices.length > 0;
    [generateReportBtn, generateDocBtn].forEach(btn => {
        btn.disabled = !enabled;
        btn.classList.toggle('hidden', !enabled);
    });
};

// ---- Modal helpers ----
const openModal = (type, title, message) => {
    if (!modalOverlay) return alert(message);
    modalTitle.textContent = title || '';
    modalMessage.textContent = message || '';
    // icon and color
    if (type === 'warning') {
        modalIcon.innerHTML = '<i class="fas fa-exclamation-triangle text-orange-500"></i>';
    } else if (type === 'success') {
        modalIcon.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
    } else {
        modalIcon.innerHTML = '<i class="fas fa-info-circle text-blue-500"></i>';
    }
    modalOverlay.classList.remove('hidden');
};
const closeModal = () => modalOverlay?.classList.add('hidden');

const checkSequestroObbligatorio = () => {
    let targetInfraction = null;
    let normativaType = getCurrentNormativaType();

    if (selectedInfractionIndices.length > 0) {
        // Usa la prima selezione tramite checkbox
        const firstInfractionId = selectedInfractionIndices[0];
        const [rowIndex, type] = firstInfractionId.split('_');
        normativaType = type || normativaType;
        const currentData = structuredData[normativaType];
        targetInfraction = currentData.allInfractions.find(inf => inf.originalIndex == rowIndex);
    } else {
        // Nessuna checkbox selezionata: prova a usare il testo digitato nel campo di ricerca come selezione esatta
        const term = (searchInput?.value || '').trim();
        if (!term) return openModal('info', 'Seleziona una sanzione', "Spunta la casella dell'infrazione oppure digita parte del testo e riprova.");
        const currentData = structuredData[normativaType];
        const lower = term.toLowerCase();
        // Prima prova match esatto, poi match parziale; se più risultati parziali, chiedi di selezionare via checkbox
        targetInfraction = currentData.allInfractions.find(inf => (inf.text || '').toLowerCase() === lower) || null;
        if (!targetInfraction) {
            const partials = currentData.allInfractions.filter(inf => (inf.text || '').toLowerCase().includes(lower));
            if (partials.length === 1) {
                targetInfraction = partials[0];
            } else if (partials.length > 1) {
                return openModal('info', 'Più risultati trovati', "Seleziona tramite la casella l'infrazione desiderata e riprova.");
            }
        }
        if (!targetInfraction) return openModal('info', 'Nessun risultato', "Impossibile individuare l'infrazione. Seleziona la casella o digita un testo più preciso e riprova.");
    }
    
    if (!targetInfraction) return openModal('info', 'Errore', "Errore nel trovare l'infrazione selezionata.");
    
    if (targetInfraction.hasSequestroObbligatorio && targetInfraction.sequestroInfo) {
        // Sequestro obbligatorio
        openModal('warning', 'Sequestro obbligatorio', `La sanzione selezionata è collegata ad un sequestro obbligatorio.\n\nNorma: ${targetInfraction.sequestroInfo}\n\nLa norma è stata auto-compilata nella sezione sequestro.`);
        
        // Auto-compila il campo "Norma in base alla quale si sequestra"
        if (inputSeq09Norma) {
            inputSeq09Norma.value = targetInfraction.sequestroInfo;
        }
    } else {
        // Nessun sequestro obbligatorio
        openModal('info', 'Nessun sequestro obbligatorio', "Non si è in presenza di sanzione cui segue sequestro obbligatorio.");
    }
};

// ----- Funzione per Resettare il Form -----
const resetForm = () => {
    if (confirm("Sei sicuro di voler cancellare tutti i dati inseriti nei campi? L'operazione è irreversibile.")) {
        location.reload();
    }
};

// ----- Funzioni di Generazione Verbale -----
const getManualFormData = () => { const formData = {}; const fields = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,29,30,31,32,33,34,35,36,37,38,43,'comando_procedente_nome']; fields.forEach(id => { formData[String(id)] = document.getElementById(`input_${id}`)?.value || ''; }); ['contestazione_tipo', 'pec_esito', 'codice_navigazione', 'spese_notifica_presenti', 'coincide_obbligato', 'riduzione_30'].forEach(name => { formData[name] = document.querySelector(`input[name="${name}"]:checked`)?.value; }); formData['contestazione_motivo'] = contestazioneMotivoTextarea.value; formData['pec_indirizzo'] = pecIndirizzoInput.value; formData['spese_notifica_importo'] = inputSpeseNotificaImporto.value; return formData; };
const prepareVerbaleHtml = () => { 
    if (!selectedInfractionIndices.length) {
        alert("Seleziona almeno un'infrazione.");
        return null;
    } 
    if (!input_43.value.trim()) {
        alert("Inserisci l'Autorità Competente.");
        input_43.focus();
        return null;
    } 
    if (!inputComandoProcedenteNome.value.trim()) {
        alert("Inserisci il nome del Comando Procedente.");
        inputComandoProcedenteNome.focus();
        return null;
    } 
    const manualData = getManualFormData(); 
    if (manualData.spese_notifica_presenti === 'si' && (manualData.spese_notifica_importo === '' || isNaN(parseFloat(manualData.spese_notifica_importo)))) {
        alert("Importo spese di notifica non valido.");
        inputSpeseNotificaImporto.focus();
        return null;
    } 
    
    let templateHtml = verbaleTemplateContainer.innerHTML; 
    const authorityDetails = paymentAuthorityData.get(manualData['43'].toLowerCase()); 
    const allData = { ...manualData }; 
    
    if (authorityDetails?.iban?.trim()) { 
        templateHtml = templateHtml.replace('id="payment_f23_details" style="display: block;"', 'id="payment_f23_details" style="display: none;"'); 
        templateHtml = templateHtml.replace('id="payment_iban_details" style="display: none;"', 'id="payment_iban_details" style="display: block;"'); 
    } 
    
    allData.pec_testo_finale = allData.pec_esito === 'non_rilevata' ? 'A seguito di consultazione del portale delle identità digitali non è stata rilevata alcuna casella PEC intestata al trasgressore/obbligato in solido.' : `A seguito di consultazione del Portale identità digitali è stata rilevata la seguente pec: <strong>${escapeHtml(allData.pec_indirizzo || 'non specificata')}</strong>`; 
    
    if (authorityDetails) { 
        allData['39'] = authorityDetails.officeCode; 
        allData['40'] = authorityDetails.territoryCode; 
        allData['42'] = authorityDetails.reasonCode; 
        allData['g'] = authorityDetails.taxCode; 
        allData['44'] = authorityDetails.address; 
        allData['45'] = authorityDetails.pec; 
        allData['i'] = authorityDetails.iban; 
    } 
    
    allData.h = manualData.spese_notifica_presenti === 'si' ? parseFloat(manualData.spese_notifica_importo).toFixed(2) : ''; 
    
    if (manualData.spese_notifica_presenti === 'si' && allData.h) { 
        templateHtml = templateHtml.replace('id="testo_con_spese" style="display:none;"', 'id="testo_con_spese" style="display:inline;"'); 
        templateHtml = templateHtml.replace('id="spese_notifica_f23" style="display:none;"', 'id="spese_notifica_f23" style="display:block;"'); 
        templateHtml = templateHtml.replace('id="iban_spese_text" style="display: none;"', 'id="iban_spese_text" style="display: inline;"'); 
    } 
    
    if (allData.codice_navigazione === 'si') { 
        allData['tributo_codnav_code1'] = '741T'; 
        allData['tributo_codnav_code2'] = 'GRMT'; 
    } 
    
    let firstPMR = ''; 
    const tableRowsHtml = selectedInfractionIndices.map((infractionId, i) => { 
        const [rowIndex, normativaType] = infractionId.split('_');
        const currentData = structuredData[normativaType];
        let rowData, currentColumnMapping;
        
        if (normativaType === 'nazionale') {
            rowData = excelData[rowIndex];
            currentColumnMapping = columnMapping;
        } else {
            rowData = excelDataLocale[rowIndex];
            currentColumnMapping = columnMappingLocale;
        }
        
        if (!rowData || !isRowCompleteInfraction(rowData, currentColumnMapping)) {
            return ''; 
        }
        
        if (i === 0) firstPMR = String(rowData[currentColumnMapping['28']] || ''); 
        let rowHtml = '<tr>'; 
        for (let col = 24; col <= 28; col++) { 
            const value = String(rowData[currentColumnMapping[String(col)]] || ''); 
            const align = (col === 28) ? 'text-align: center;' : ''; 
            rowHtml += `<td style="border: 1px solid black; padding: 0.5rem; vertical-align: top; ${align}">${escapeHtml(value)}</td>`; 
        } 
        return rowHtml + '</tr>'; 
    }).join(''); 
    
    templateHtml = templateHtml.replace(/<tbody id="infractionTableBody">[\s\S]*?<\/tbody>/, `<tbody id="infractionTableBody">${tableRowsHtml}</tbody>`); 
    allData.obbligato_header_text = allData.coincide_obbligato === 'si' ? 'OBBLIGATO IN SOLIDO (Coincide con il trasgressore)' : 'OBBLIGATO IN SOLIDO'; 
    allData.contestazione_testo_finale = allData.contestazione_tipo === 'immediata' ? '- Contestazione immediata.' : `- Non si è potuto procedere a contestazione immediata in quanto: <strong>${escapeHtml(allData.contestazione_motivo || 'motivo non specificato')}</strong>.`; 
    
    const pmrValue = parseFloat(firstPMR.replace(',', '.')); 
    allData.testo_riduzione_30 = (allData.riduzione_30 === 'si' && !isNaN(pmrValue) && pmrValue > 0) ? `, ovvero della somma di Euro <strong>${(pmrValue * 0.7).toFixed(2)}</strong> se il pagamento avviene entro 5 giorni` : ''; 
    
    templateHtml = templateHtml.replace(/<span class="placeholder-marker" data-placeholder="28" data-instance="second">.*?<\/span>/, `<span class="placeholder-marker" data-placeholder="28" data-instance="second"> <strong>${escapeHtml(firstPMR)}</strong></span>`); 
    
    for (const key in allData) { 
        let value = allData[key] ?? ''; 
        if (allData.coincide_obbligato === 'si' && ((key >= 12 && key <= 22) || key == 38)) value = '//'; 
        const finalValue = (typeof value === 'string' && (value.startsWith('- ') || value.startsWith('OBBLIGATO') || value.startsWith(',') || value.startsWith('A seguito'))) ? value : (value ? `<strong>${escapeHtml(value)}</strong>` : ''); 
        templateHtml = templateHtml.replace(new RegExp(`<span class="placeholder-marker" data-placeholder="${key}"(?!\\s*data-instance)[^>]*>.*?<\\/span>`, 'g'), `<span class="placeholder-marker" data-placeholder="${key}">${finalValue ? ' ' + finalValue : ''}</span>`); 
    } 
    
    const verbaleNum = escapeHtml(allData['36'] || '___'); 
    const isCodNav = allData.codice_navigazione === 'si'; 
    templateHtml = templateHtml.replace(/<div id="tributo_normale".*?>/, `<div id="tributo_normale" style="display: ${isCodNav ? 'none':'block'};">`); 
    templateHtml = templateHtml.replace(/<div id="tributo_codnav".*?>/, `<div id="tributo_codnav" style="display: ${isCodNav ? 'block':'none'};">`); 
    templateHtml = templateHtml.replace(/<span class="placeholder-marker" data-placeholder="tributo_normale_desc">.*?<\/span>/, `<span class="placeholder-marker" data-placeholder="tributo_normale_desc">(sanzione N. ${verbaleNum})</span>`); 
    templateHtml = templateHtml.replace(/<span class="placeholder-marker" data-placeholder="tributo_codnav_desc1">.*?<\/span>/, `<span class="placeholder-marker" data-placeholder="tributo_codnav_desc1">(50% sanzione N. ${verbaleNum})</span>`); 
    templateHtml = templateHtml.replace(/<span class="placeholder-marker" data-placeholder="tributo_codnav_desc2">.*?<\/span>/, `<span class="placeholder-marker" data-placeholder="tributo_codnav_desc2">(Quota INPS 50% sanzione N. ${verbaleNum})</span>`); 
    
    return templateHtml; 
};

const getSequestroFormData = () => {
    const formData = {};
    const fields = ['01', '07', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21'];
    fields.forEach(id => {
        formData[id] = document.getElementById(`input_seq_${id}`)?.value || '';
    });
    
    // Aggiungi campi data e ora del sequestro
    formData['anno'] = document.getElementById('input_seq_anno')?.value || '';
    formData['giorno'] = document.getElementById('input_seq_giorno')?.value || '';
    formData['mese'] = document.getElementById('input_seq_mese')?.value || '';
    formData['orario'] = document.getElementById('input_seq_orario')?.value || '';
    
    // Aggiungi opzioni
    formData['tipo_custodia'] = document.querySelector('input[name="tipo_custodia"]:checked')?.value;
    formData['sequestro_trasgressore'] = document.querySelector('input[name="sequestro_trasgressore"]:checked')?.value;
    formData['custode_trasgressore'] = document.querySelector('input[name="custode_trasgressore"]:checked')?.value;
    
    // Gestisci dati del soggetto del sequestro
    if (formData['sequestro_trasgressore'] === 'si') {
        // Usa i dati del trasgressore
        formData['cognome'] = document.getElementById('input_seq_cognome')?.value || '';
        formData['nome'] = document.getElementById('input_seq_nome')?.value || '';
        formData['luogo_nascita'] = document.getElementById('input_seq_luogo_nascita')?.value || '';
        formData['data_nascita'] = document.getElementById('input_seq_data_nascita')?.value || '';
        formData['residenza'] = document.getElementById('input_seq_residenza')?.value || '';
        formData['indirizzo'] = document.getElementById('input_seq_indirizzo')?.value || '';
        formData['documento_tipo'] = document.getElementById('input_seq_documento_tipo')?.value || '';
        formData['documento_numero'] = document.getElementById('input_seq_documento_numero')?.value || '';
        formData['documento_rilasciato'] = document.getElementById('input_seq_documento_rilasciato')?.value || '';
        formData['documento_data'] = document.getElementById('input_seq_documento_data')?.value || '';
        formData['cf'] = document.getElementById('input_seq_cf')?.value || '';
    } else if (formData['sequestro_trasgressore'] === 'no') {
        // Usa i dati dell'altro soggetto
        formData['cognome'] = document.getElementById('input_seq_altro_cognome')?.value || '';
        formData['nome'] = document.getElementById('input_seq_altro_nome')?.value || '';
        formData['luogo_nascita'] = document.getElementById('input_seq_altro_luogo_nascita')?.value || '';
        formData['data_nascita'] = document.getElementById('input_seq_altro_data_nascita')?.value || '';
        formData['residenza'] = document.getElementById('input_seq_altro_residenza')?.value || '';
        formData['indirizzo'] = document.getElementById('input_seq_altro_indirizzo')?.value || '';
        formData['documento_tipo'] = document.getElementById('input_seq_altro_documento_tipo')?.value || '';
        formData['documento_numero'] = document.getElementById('input_seq_altro_documento_numero')?.value || '';
        formData['documento_rilasciato'] = document.getElementById('input_seq_altro_documento_rilasciato')?.value || '';
        formData['documento_data'] = document.getElementById('input_seq_altro_documento_data')?.value || '';
        formData['cf'] = document.getElementById('input_seq_altro_cf')?.value || '';
    } else {
        // Nessuna opzione selezionata - usa campi vuoti
        formData['cognome'] = '';
        formData['nome'] = '';
        formData['luogo_nascita'] = '';
        formData['data_nascita'] = '';
        formData['residenza'] = '';
        formData['indirizzo'] = '';
        formData['documento_tipo'] = '';
        formData['documento_numero'] = '';
        formData['documento_rilasciato'] = '';
        formData['documento_data'] = '';
        formData['cf'] = '';
    }
    
    // Gestisci dati del custode
    if (formData['tipo_custodia'] === 'esterno') {
        if (formData['custode_trasgressore'] === 'si') {
            // Se il custode è il trasgressore, usa i dati del trasgressore dal verbale principale
            const trasgressoreData = {
                cognome: document.getElementById('input_1').value,
                nome: document.getElementById('input_2').value,
                luogo_nascita: document.getElementById('input_3').value,
                data_nascita: document.getElementById('input_4').value,
                residenza: document.getElementById('input_5').value,
                indirizzo: document.getElementById('input_6').value,
                documento_tipo: document.getElementById('input_7').value,
                documento_rilasciato: document.getElementById('input_9').value,
                documento_data: document.getElementById('input_10').value,
                qualita: document.getElementById('input_37').value
            };
            
            formData['12'] = `${trasgressoreData.cognome} ${trasgressoreData.nome}`;
            formData['13'] = trasgressoreData.luogo_nascita;
            formData['14'] = trasgressoreData.data_nascita;
            formData['15'] = trasgressoreData.residenza;
            formData['16'] = trasgressoreData.indirizzo;
            formData['17'] = trasgressoreData.documento_tipo;
            formData['18'] = trasgressoreData.documento_rilasciato;
            formData['19'] = trasgressoreData.documento_data;
            formData['20'] = trasgressoreData.qualita;
        } else if (formData['custode_trasgressore'] === 'no') {
            // Usa i dati dell'altro custode
            formData['12'] = document.getElementById('input_seq_altro_12')?.value || '';
            formData['13'] = document.getElementById('input_seq_altro_13')?.value || '';
            formData['14'] = document.getElementById('input_seq_altro_14')?.value || '';
            formData['15'] = document.getElementById('input_seq_altro_15')?.value || '';
            formData['16'] = document.getElementById('input_seq_altro_16')?.value || '';
            formData['17'] = document.getElementById('input_seq_altro_17')?.value || '';
            formData['18'] = document.getElementById('input_seq_altro_18')?.value || '';
            formData['19'] = document.getElementById('input_seq_altro_19')?.value || '';
            formData['20'] = document.getElementById('input_seq_altro_20')?.value || '';
        } else {
            // Nessuna opzione selezionata - usa campi vuoti
            formData['12'] = '';
            formData['13'] = '';
            formData['14'] = '';
            formData['15'] = '';
            formData['16'] = '';
            formData['17'] = '';
            formData['18'] = '';
            formData['19'] = '';
            formData['20'] = '';
        }
    }
    
    return formData;
};

const prepareSequestroHtml = () => {
    const mainData = getManualFormData();
    const sequestroData = getSequestroFormData();
    let templateHtml = sequestroTemplateContainer.innerHTML;

    const allData = { ...mainData, ...sequestroData };
    
    // Usa i dati del sequestro per data e ora se disponibili, altrimenti usa quelli del verbale principale
    const anno = sequestroData.anno || mainData['29'];
    const giorno = sequestroData.giorno || mainData['30'];
    const mese = sequestroData.mese || mainData['31'];
    const orario = sequestroData.orario || mainData['32'];
    
    const placeholders = {
        'comando_procedente_nome': allData.comando_procedente_nome, 
        'seq_01': allData['01'], 
        '36': allData['36'], 
        '29': anno, 
        '30': giorno, 
        '31': mese, 
        '32': orario, 
        '33': allData['33'], 
        'seq_07': allData['07'], 
        '23': allData['23'], 
        'seq_09': allData['09'], 
        'seq_10': allData['10'], 
        'seq_11': allData['11'], 
        'seq_12': allData['12'], 
        'seq_13': allData['13'], 
        'seq_14': allData['14'], 
        'seq_15': allData['15'], 
        'seq_16': allData['16'], 
        'seq_17': allData['17'], 
        'seq_18': allData['18'], 
        'seq_19': allData['19'], 
        'seq_20': allData['20'], 
        'seq_21': allData['21']
    };

    // Genera la frase "nei confronti di" con i dati del soggetto del sequestro
    let sequestroSoggettoText = '';
    if (sequestroData.sequestro_trasgressore === 'si') {
        // Usa i dati del trasgressore dal verbale principale
        const trasgressoreData = {
            cognome: mainData['1'] || '',
            nome: mainData['2'] || '',
            luogo_nascita: mainData['3'] || '',
            data_nascita: mainData['4'] || '',
            residenza: mainData['5'] || '',
            indirizzo: mainData['6'] || '',
            documento_tipo: mainData['7'] || '',
            documento_numero: mainData['8'] || '',
            documento_rilasciato: mainData['9'] || '',
            documento_data: mainData['10'] || '',
            cf: mainData['11'] || ''
        };
        
        sequestroSoggettoText = `nei confronti di <strong>${escapeHtml(trasgressoreData.cognome)} ${escapeHtml(trasgressoreData.nome)}</strong>, nato/a a <strong>${escapeHtml(trasgressoreData.luogo_nascita)}</strong> il <strong>${escapeHtml(trasgressoreData.data_nascita)}</strong>, residente a <strong>${escapeHtml(trasgressoreData.residenza)}</strong> in <strong>${escapeHtml(trasgressoreData.indirizzo)}</strong>, identificato/a mediante <strong>${escapeHtml(trasgressoreData.documento_tipo)}</strong> n° <strong>${escapeHtml(trasgressoreData.documento_numero)}</strong> rilasciata da <strong>${escapeHtml(trasgressoreData.documento_rilasciato)}</strong> il <strong>${escapeHtml(trasgressoreData.documento_data)}</strong>, C.F. <strong>${escapeHtml(trasgressoreData.cf)}</strong>, `;
    } else if (sequestroData.sequestro_trasgressore === 'no') {
        // Usa i dati compilati manualmente per l'altro soggetto
        const altroData = {
            cognome: sequestroData.cognome || '',
            nome: sequestroData.nome || '',
            luogo_nascita: sequestroData.luogo_nascita || '',
            data_nascita: sequestroData.data_nascita || '',
            residenza: sequestroData.residenza || '',
            indirizzo: sequestroData.indirizzo || '',
            documento_tipo: sequestroData.documento_tipo || '',
            documento_numero: sequestroData.documento_numero || '',
            documento_rilasciato: sequestroData.documento_rilasciato || '',
            documento_data: sequestroData.documento_data || '',
            cf: sequestroData.cf || ''
        };
        
        sequestroSoggettoText = `nei confronti di <strong>${escapeHtml(altroData.cognome)} ${escapeHtml(altroData.nome)}</strong>, nato/a a <strong>${escapeHtml(altroData.luogo_nascita)}</strong> il <strong>${escapeHtml(altroData.data_nascita)}</strong>, residente a <strong>${escapeHtml(altroData.residenza)}</strong> in <strong>${escapeHtml(altroData.indirizzo)}</strong>, identificato/a mediante <strong>${escapeHtml(altroData.documento_tipo)}</strong> n° <strong>${escapeHtml(altroData.documento_numero)}</strong> rilasciata da <strong>${escapeHtml(altroData.documento_rilasciato)}</strong> il <strong>${escapeHtml(altroData.documento_data)}</strong>, C.F. <strong>${escapeHtml(altroData.cf)}</strong>, `;
    } else {
        // Nessuna opzione selezionata - usa placeholder
        sequestroSoggettoText = `nei confronti di <strong>_______________</strong>, `;
    }
    
    // Aggiungi il testo del soggetto ai placeholders
    placeholders['sequestro_soggetto'] = sequestroSoggettoText;
    
    // Genera il testo della norma di sequestro: sempre art. 13, comma 2, Legge 689/1981
    const baseSequestro = `ai sensi dell'art. 13, comma 2, Legge 689/1981`;
    let sequestroNormaText = baseSequestro;
    if (allData['09'] && allData['09'].trim() !== '') {
        // Aggiungi anche la norma specifica (colonna H) quando presente
        sequestroNormaText = `${baseSequestro} e dell'<strong>${escapeHtml(allData['09'])}</strong>`;
    }
    placeholders['sequestro_norma_testo'] = sequestroNormaText;

    for (const key in placeholders) {
        let value = placeholders[key];
        if (value) {
            // Se il valore contiene già HTML (come sequestro_soggetto), non aggiungere altro grassetto
            if (value.includes('<strong>')) {
                // Mantieni il valore come è
            } else {
                // Metti in grassetto i dati inseriti dall'utente
                value = `<strong>${escapeHtml(value)}</strong>`;
            }
        } else {
            value = '<strong>_______________</strong>';
        }
        templateHtml = templateHtml.replace(new RegExp(`<span class="placeholder-marker" data-placeholder="${key}">.*?<\\/span>`, 'g'), value);
    }
    
    if (allData.tipo_custodia === 'esterno') {
        templateHtml = templateHtml.replace('id="custodia_agenti_text"', 'id="custodia_agenti_text" style="display: none;"');
        templateHtml = templateHtml.replace('id="custodia_esterno_text" style="display: none;"', 'id="custodia_esterno_text"');
    }

    return templateHtml;
};


// ----- Funzioni di Esportazione File -----
const generateReport = () => {
    generateMessage.textContent = "Generazione report .html in corso...";
    generateMessage.classList.remove('hidden');
    [generateReportBtn, generateDocBtn, resetBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = true);
    setTimeout(() => {
        const reportBodyHtml = prepareVerbaleHtml();
        if (!reportBodyHtml) {
            generateMessage.classList.add('hidden');
            updateGenerateButtonsState();
            [resetBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = false);
            return;
        }
        
        const reportCss = ` body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.15; margin: 2cm; } table { width: 100%; border-collapse: collapse; border: 1px solid black; font-size: 8.5pt; } th, td { border: 1px solid black; padding: 0.4rem; vertical-align: top; } th { background-color: #e2e8f0; font-weight: bold; text-align: left; } .placeholder-marker { font-weight: normal; } strong { font-weight: bold; } img.effigie { display:block; margin: 0 auto 6px auto; height: 48px; } `;
        
        // Controlla se c'è un sequestro
        const isSequestro = document.querySelector('input[name="sequestro_presente"]:checked')?.value === 'si';
        
        if (isSequestro) {
            // Genera entrambi i verbali
            const sequestroHtml = prepareSequestroHtml();
            const verbaleNum = escapeHtml(document.getElementById('input_36').value || 'SenzaNumero');
            const sequestroNum = escapeHtml(document.getElementById('input_seq_01').value || 'SenzaNumero');
            
            const verbaleFullHtml = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verbale N. ${verbaleNum}</title><style>${reportCss}</style></head><body>${reportBodyHtml}</body></html>`;
            const sequestroFullHtml = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verbale Sequestro N. ${sequestroNum}</title><style>${reportCss}</style></head><body>${sequestroHtml}</body></html>`;
            
            // Crea un file con entrambi i verbali
            const combinedHtml = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verbali N. ${verbaleNum} e Sequestro N. ${sequestroNum}</title>
    <style>
        ${reportCss}
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    ${reportBodyHtml}
    
    <div class="page-break"></div>
    
    ${sequestroHtml}
</body>
</html>`;
            
            const blob = new Blob([combinedHtml], { type: "text/html;charset=utf-8" });
            const fileName = `Verbali_${verbaleNum.replace(/[\/\\]/g, '_')}_e_Sequestro_${sequestroNum.replace(/[\/\\]/g, '_')}.html`;
            saveAs(blob, fileName);
        } else {
            // Genera solo il verbale normale
            const fullHtml = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verbale N. ${escapeHtml(document.getElementById('input_36').value || 'SenzaNumero')}</title><style>${reportCss}</style></head><body>${reportBodyHtml}</body></html>`;
            const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
            const fileName = `Verbale_${(document.getElementById('input_36').value || 'report').replace(/[\/\\]/g, '_')}.html`;
            saveAs(blob, fileName);
        }
        
        generateMessage.classList.add('hidden');
        updateGenerateButtonsState();
        [resetBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = false);
    }, 50);
};

const generateDocument = async () => {
    generateMessage.textContent = "Generazione .docx in corso...";
    generateMessage.classList.remove('hidden');
    [generateReportBtn, generateDocBtn, resetBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = true);
    
    setTimeout(async () => {
        try {
            let finalHtml = prepareVerbaleHtml();
            if (!finalHtml) {
                generateMessage.classList.add('hidden');
                updateGenerateButtonsState();
                [resetBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = false);
                return;
            }
            
            console.log('=== GENERAZIONE VERBALE WORD CON LOGO INCORPORATO ===');
            
            // Usa il base64 dell'effigie caricato all'avvio
            if (effigieBase64 && effigieBase64.startsWith('data:image')) {
                console.log('✓ Usando effigie in base64');
                const logoHtml = `<p align="center" style="text-align:center;margin:0 0 8px 0;"><img src="${effigieBase64}" width="108" height="108" style="display:inline-block;" /></p>`;
                finalHtml = finalHtml.replace(
                    /<div[^>]*>\s*<img[^>]*effigie-stato[^>]*>\s*<\/div>/gi,
                    logoHtml
                );
                finalHtml = finalHtml.replace(
                    /<img[^>]*effigie-stato[^>]*>/gi,
                    `<img src="${effigieBase64}" width="108" height="108" />`
                );
            } else {
                console.warn('⚠ Base64 effigie non disponibile, rimozione logo dal Word');
                finalHtml = finalHtml.replace(/<div[^>]*>\s*<img[^>]*effigie-stato[^>]*>\s*<\/div>/gi, '');
                finalHtml = finalHtml.replace(/<img[^>]*effigie-stato[^>]*>/gi, '');
            }
            
            const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:'Times New Roman',serif;font-size:10pt;line-height:1.15;">${finalHtml}</body></html>`;
            
            const docxBlob = htmlDocx.asBlob(content, { 
                orientation: 'portrait',
                margins: { top: 1440, right: 1080, bottom: 1440, left: 1080 }
            });
            
            const fileName = `${(document.getElementById('input_36').value || 'verbale').replace(/[\/\\]/g, '_')}.docx`;
            saveAs(docxBlob, fileName);
            
            generateMessage.textContent = "✓ Documento Word generato!";
            console.log('✓ Word generato con logo incorporato');
            
        } catch (error) {
            console.error('ERRORE generazione:', error);
            alert('Errore nella generazione: ' + error.message);
            generateMessage.classList.add('hidden');
        }
        
        setTimeout(() => generateMessage.classList.add('hidden'), 5000);
        updateGenerateButtonsState();
        [resetBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = false);
    }, 100);
};

const generateSequestroDocument = async () => {
    generateMessage.textContent = "Generazione Sequestro .docx in corso...";
    generateMessage.classList.remove('hidden');
    [generateReportBtn, generateDocBtn, resetBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = true);
    
    setTimeout(async () => {
        try {
            let finalHtml = prepareSequestroHtml();
            if (!finalHtml) {
                generateMessage.classList.add('hidden');
                updateGenerateButtonsState();
                [resetBtn, generateReportBtn, generateDocBtn].forEach(btn => btn.disabled = false);
                return;
            }
            
            console.log('=== GENERAZIONE VERBALE SEQUESTRO WORD CON LOGO INCORPORATO ===');
            
            // Usa il base64 dell'effigie caricato all'avvio
            if (effigieBase64 && effigieBase64.startsWith('data:image')) {
                console.log('✓ Usando effigie in base64');
                const logoHtml = `<p align="center" style="text-align:center;margin:0 0 8px 0;"><img src="${effigieBase64}" width="117" height="117" style="display:inline-block;" /></p>`;
                finalHtml = finalHtml.replace(
                    /<div[^>]*>\s*<img[^>]*effigie-stato[^>]*>\s*<\/div>/gi,
                    logoHtml
                );
                finalHtml = finalHtml.replace(
                    /<img[^>]*effigie-stato[^>]*>/gi,
                    `<img src="${effigieBase64}" width="117" height="117" />`
                );
            } else {
                console.warn('⚠ Base64 effigie non disponibile, rimozione logo dal Word');
                finalHtml = finalHtml.replace(/<div[^>]*>\s*<img[^>]*effigie-stato[^>]*>\s*<\/div>/gi, '');
                finalHtml = finalHtml.replace(/<img[^>]*effigie-stato[^>]*>/gi, '');
            }
            
            const content = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:'Times New Roman',serif;font-size:11pt;line-height:1.2;">${finalHtml}</body></html>`;
            
            const docxBlob = htmlDocx.asBlob(content, { 
                orientation: 'portrait',
                margins: { top: 1440, right: 1080, bottom: 1440, left: 1080 }
            });
            
            const fileName = `Sequestro_${(document.getElementById('input_seq_01').value || 'verbale').replace(/[\/\\]/g, '_')}.docx`;
            saveAs(docxBlob, fileName);
            
            generateMessage.textContent = "✓ Documento Sequestro Word generato!";
            console.log('✓ Word sequestro generato con logo incorporato');
            
        } catch (error) {
            console.error('ERRORE generazione sequestro:', error);
            alert('Errore nella generazione: ' + error.message);
            generateMessage.classList.add('hidden');
        }
        
        setTimeout(() => generateMessage.classList.add('hidden'), 5000);
        updateGenerateButtonsState();
        [resetBtn, generateReportBtn, generateDocBtn, generateSequestroDocBtn].forEach(btn => btn.disabled = false);
    }, 100);
};


// ----- Event Listener Principale (Inizializzazione) -----
document.addEventListener('DOMContentLoaded', async () => {
    // Assegnazione elementi DOM
    fileInput = document.getElementById('excelFile'); loadDataBtn = document.getElementById('loadDataBtn'); clearDataBtn = document.getElementById('clearDataBtn'); offlineStatus = document.getElementById('offlineStatus'); offlineDate = document.getElementById('offlineDate'); searchSection = document.getElementById('searchSection'); searchInput = document.getElementById('searchInput'); searchBtn = document.getElementById('searchBtn'); toggleTitlesBtn = document.getElementById('toggleTitlesBtn'); titleListContainer = document.getElementById('titleListContainer'); titleList = document.getElementById('titleList'); resultsListContainer = document.getElementById('resultsListContainer'); resultsList = document.getElementById('resultsList'); resultsHeader = document.getElementById('resultsHeader'); verbaleTemplateContainer = document.getElementById('verbaleTemplate'); generateReportBtn = document.getElementById('generateReportBtn'); generateDocBtn = document.getElementById('generateDocBtn'); loadingMessage = document.getElementById('loadingMessage'); loadSuccessMessage = document.getElementById('loadSuccessMessage'); loadErrorMessage = document.getElementById('loadErrorMessage'); noResultsMessage = document.getElementById('noResultsMessage'); generateMessage = document.getElementById('generateMessage'); fileNameDisplay = document.getElementById('fileNameDisplay'); obbligatoFieldsDiv = document.getElementById('obbligato_fields'); coincideRadioButtons = document.querySelectorAll('input[name="coincide_obbligato"]'); contestazioneRadioButtons = document.querySelectorAll('input[name="contestazione_tipo"]'); contestazioneMotivoTextarea = document.getElementById('input_contestazione_motivo'); pecRadioButtons = document.querySelectorAll('input[name="pec_esito"]'); pecIndirizzoInput = document.getElementById('input_pec_indirizzo'); input_43 = document.getElementById('input_43'); toggleAuthoritiesBtn = document.getElementById('toggleAuthoritiesBtn'); authorityListContainer = document.getElementById('authorityListContainer'); authorityList = document.getElementById('authorityList'); input_39 = document.getElementById('input_39'); input_40 = document.getElementById('input_40'); input_42 = document.getElementById('input_42'); input_44 = document.getElementById('input_44'); input_45 = document.getElementById('input_45'); input_g = document.getElementById('input_g'); inputIbanDisplay = document.getElementById('input_iban_display'); speseNotificaImportoContainer = document.getElementById('spese_notifica_importo_container'); inputSpeseNotificaImporto = document.getElementById('input_spese_notifica_importo'); input_36 = document.getElementById('input_36'); inputComandoProcedenteNome = document.getElementById('input_comando_procedente_nome'); riduzione30RadioButtons = document.querySelectorAll('input[name="riduzione_30"]');
    resetBtn = document.getElementById('resetBtn');
    sequestroRadioButtons = document.querySelectorAll('input[name="sequestro_presente"]');
    sequestroFieldsContainer = document.getElementById('sequestroFieldsContainer');
    generateSequestroDocBtn = document.getElementById('generateSequestroDocBtn');
    sequestroTemplateContainer = document.getElementById('sequestroTemplate');
    tipoCustodiaRadioButtons = document.querySelectorAll('input[name="tipo_custodia"]');
    custodeFieldsContainer = document.getElementById('custodeFieldsContainer');
    normativaRadioButtons = document.querySelectorAll('input[name="normativa_tipo"]');
    sequestroTrasgressoreRadioButtons = document.querySelectorAll('input[name="sequestro_trasgressore"]');
    sequestroTrasgressoreFields = document.getElementById('sequestroTrasgressoreFields');
    sequestroAltroFields = document.getElementById('sequestroAltroFields');
    custodeTrasgressoreRadioButtons = document.querySelectorAll('input[name="custode_trasgressore"]');
    custodeTrasgressoreFields = document.getElementById('custodeTrasgressoreFields');
    custodeAltroFields = document.getElementById('custodeAltroFields');
    inputSeq09Norma = document.getElementById('input_seq_09');
    checkSequestroBtn = document.getElementById('checkSequestroBtn');
    modalOverlay = document.getElementById('modalOverlay');
    modalIcon = document.getElementById('modalIcon');
    modalTitle = document.getElementById('modalTitle');
    modalMessage = document.getElementById('modalMessage');
    modalCloseBtn = document.getElementById('modalCloseBtn');

    // Event listeners
    loadDataBtn.addEventListener('click', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); else alert('Seleziona un file Excel per caricarlo.'); }); 
    fileInput.addEventListener('change', (e) => { fileNameDisplay.textContent = e.target.files[0] ? e.target.files[0].name : 'Seleziona file Excel...'; });
    clearDataBtn.addEventListener('click', async () => {
        if (confirm("Sei sicuro di voler cancellare la banca dati dalla memoria del dispositivo? Dovrai ricaricarla da un file.")) {
            await clearDataFromDB();
            updateOfflineStatus(false);
            resetSearchAndGenerate();
            location.reload();
        }
    });
    searchBtn.addEventListener('click', performSearch); searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); }); toggleTitlesBtn.addEventListener('click', () => { titleListContainer.style.display = titleListContainer.style.display === 'block' ? 'none' : 'block'; }); titleList.addEventListener('click', (e) => { if (e.target.matches('.title-item')) { displayInfractionsForTitle(e.target.dataset.title); titleListContainer.style.display = 'none'; } }); toggleAuthoritiesBtn.addEventListener('click', () => { authorityListContainer.style.display = authorityListContainer.style.display === 'block' ? 'none' : 'block'; }); authorityList.addEventListener('click', (e) => { if (e.target.matches('.authority-item')) { updatePaymentFieldsUI(e.target.dataset.authorityName); authorityListContainer.style.display = 'none'; } }); input_43.addEventListener('input', () => updatePaymentFieldsUI()); coincideRadioButtons.forEach(r => r.addEventListener('change', (e) => toggleObbligatoFields(e.target.value === 'si'))); contestazioneRadioButtons.forEach(r => r.addEventListener('change', handleContestazioneChange)); pecRadioButtons.forEach(r => r.addEventListener('change', handlePecChange)); document.querySelectorAll('input[name="spese_notifica_presenti"]').forEach(r => r.addEventListener('change', handleSpeseNotificaChange)); 
    generateReportBtn.addEventListener('click', generateReport);
    generateDocBtn.addEventListener('click', generateDocument);
    resetBtn.addEventListener('click', resetForm);
    checkSequestroBtn.addEventListener('click', checkSequestroObbligatorio);
    modalCloseBtn?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    sequestroRadioButtons.forEach(radio => radio.addEventListener('change', handleSequestroChange));
    tipoCustodiaRadioButtons.forEach(radio => radio.addEventListener('change', handleCustodiaChange));
    generateSequestroDocBtn.addEventListener('click', generateSequestroDocument);
    normativaRadioButtons.forEach(radio => radio.addEventListener('change', () => {
        displayTitles();
        resetSearchAndGenerate();
    }));
    sequestroTrasgressoreRadioButtons.forEach(radio => radio.addEventListener('change', handleSequestroTrasgressoreChange));
    custodeTrasgressoreRadioButtons.forEach(radio => radio.addEventListener('change', handleCustodeTrasgressoreChange));
    
    // Inizializzazione
    resetSearchAndGenerate();
    try {
        const savedData = await loadDataFromDB();
        if (savedData) {
            console.log("Dati trovati in IndexedDB. Li carico...");
            excelData = savedData.excelData;
            excelDataLocale = savedData.excelDataLocale || [];
            columnMapping = savedData.columnMapping || parseHeader(excelData[0]);
            columnMappingLocale = savedData.columnMappingLocale || {};
            paymentAuthorityData = new Map(savedData.paymentAuthorityData);
            
            // Carica la struttura dati se disponibile, altrimenti ricostruisci
            if (savedData.structuredData) {
                structuredData = savedData.structuredData;
            } else {
                // Fallback per dati vecchi - ricostruisci solo per normativa nazionale
                columnMapping = parseHeader(excelData[0]);
                structuredData = { 
                    nazionale: { titles: [], infractionsByTitle: {}, allInfractions: [] },
                    locale: { titles: [], infractionsByTitle: {}, allInfractions: [] }
                };
                let currentTitle = "Nessun Titolo Specificato";
                const uniqueTitles = new Set();
                for (let i = 1; i < excelData.length; i++) {
                    const row = excelData[i];
                    if (!row?.length) continue;
                    const infractionText = String(row[searchColumnIndex] || '').trim();
                    if (isPotentialTitleRow(row, columnMapping)) {
                        currentTitle = infractionText;
                        if (!structuredData.nazionale.infractionsByTitle[currentTitle]) {
                            structuredData.nazionale.infractionsByTitle[currentTitle] = [];
                            uniqueTitles.add(currentTitle);
                        }
                    } else if (isRowCompleteInfraction(row, columnMapping)) {
                        // Estrai informazioni di sequestro dalla colonna H (se disponibile)
                        const sequestroInfo = columnMapping['sequestro'] !== undefined && row.length > columnMapping['sequestro'] 
                            ? String(row[columnMapping['sequestro']] || '').trim() 
                            : '';
                        
                        const infractionObj = { 
                            originalIndex: i, 
                            text: infractionText, 
                            normativaType: 'nazionale',
                            sequestroInfo: sequestroInfo,
                            hasSequestroObbligatorio: sequestroInfo !== ''
                        };
                        structuredData.nazionale.allInfractions.push(infractionObj);
                        if (!structuredData.nazionale.infractionsByTitle[currentTitle]) {
                            structuredData.nazionale.infractionsByTitle[currentTitle] = [];
                            if (!uniqueTitles.has(currentTitle)) uniqueTitles.add(currentTitle);
                        }
                        structuredData.nazionale.infractionsByTitle[currentTitle].push(infractionObj);
                    }
                }
                structuredData.nazionale.titles = Array.from(uniqueTitles).sort();
            }
            authorityNamesList = Array.from(paymentAuthorityData.values()).map(d => d.rawName).sort();

            updateOfflineStatus(true, savedData.savedDate);
            searchSection.classList.remove('hidden');
            [searchInput, searchBtn, toggleTitlesBtn, input_43, toggleAuthoritiesBtn, checkSequestroBtn].forEach(el => el.disabled = false);
            displayTitles(); 
            displayAuthorities();
        } else {
            console.log("Nessun dato in IndexedDB. In attesa di caricamento file.");
            updateOfflineStatus(false);
        }
    } catch (error) {
        console.error("Errore nel caricamento da DB:", error);
        updateOfflineStatus(false);
    }

    // Carica l'immagine dell'effigie dello stato in base64
    effigieBase64 = await loadEffigieAsBase64();
    if (effigieBase64 && effigieBase64.startsWith('data:image')) {
        console.log('✓ Immagine effigie dello stato caricata per i documenti Word');
    } else {
        console.warn('⚠ ATTENZIONE: Logo effigie NON caricato. Nei documenti Word non apparirà il logo.');
        console.warn('⚠ Per vedere il logo nei Word, apri l\'app da un web server (es: Netlify, Live Server)');
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js').then(registration => {
                console.log('Service Worker registrato con successo:', registration.scope);
            }, err => {
                console.log('Registrazione del Service Worker fallita:', err);
            });
        });
    }
});