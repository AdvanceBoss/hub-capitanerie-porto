-- Sample data for HUB Nazionale Capitanerie di Porto
-- Insert hierarchical organization structure

-- 1. MARICOGECAP (Root level)
INSERT INTO organizations (nome, tipo, codice, parent_id, indirizzo, telefono, email, pec) VALUES
('Comando Generale del Corpo delle Capitanerie di Porto', 'maricogecap', 'MARICOGECAP', NULL, 
 'Via dell''Arte, 16 - 00144 Roma', '06-59081', 'comgen@guardiacostiera.it', 'comgen@pec.guardiacostiera.it');

-- 2. Direzioni Marittime (Level 2)
INSERT INTO organizations (nome, tipo, codice, parent_id, indirizzo, telefono, email, pec) VALUES
('Direzione Marittima di Palermo', 'direzione_marittima', 'DM_PALERMO', 
 (SELECT id FROM organizations WHERE codice = 'MARICOGECAP'),
 'Via della Libertà, 123 - 90143 Palermo', '091-1234567', 'dm.palermo@guardiacostiera.it', 'dm.palermo@pec.guardiacostiera.it'),

('Direzione Marittima di Napoli', 'direzione_marittima', 'DM_NAPOLI', 
 (SELECT id FROM organizations WHERE codice = 'MARICOGECAP'),
 'Via Partenope, 45 - 80132 Napoli', '081-9876543', 'dm.napoli@guardiacostiera.it', 'dm.napoli@pec.guardiacostiera.it'),

('Direzione Marittima di Genova', 'direzione_marittima', 'DM_GENOVA', 
 (SELECT id FROM organizations WHERE codice = 'MARICOGECAP'),
 'Via del Molo, 78 - 16126 Genova', '010-5555555', 'dm.genova@guardiacostiera.it', 'dm.genova@pec.guardiacostiera.it');

-- 3. Capitanerie di Porto (Level 3)
INSERT INTO organizations (nome, tipo, codice, parent_id, indirizzo, telefono, email, pec) VALUES
('Capitaneria di Porto di Porto Empedocle', 'capitaneria', 'CP_PORTO_EMPEDOCLE', 
 (SELECT id FROM organizations WHERE codice = 'DM_PALERMO'),
 'Via del Porto, 1 - 92014 Porto Empedocle (AG)', '0922-123456', 'cp.portoempedocle@guardiacostiera.it', 'cp.portoempedocle@pec.guardiacostiera.it'),

('Capitaneria di Porto di Trapani', 'capitaneria', 'CP_TRAPANI', 
 (SELECT id FROM organizations WHERE codice = 'DM_PALERMO'),
 'Via del Molo, 15 - 91100 Trapani', '0923-987654', 'cp.trapani@guardiacostiera.it', 'cp.trapani@pec.guardiacostiera.it'),

('Capitaneria di Porto di Napoli', 'capitaneria', 'CP_NAPOLI', 
 (SELECT id FROM organizations WHERE codice = 'DM_NAPOLI'),
 'Via Partenope, 12 - 80132 Napoli', '081-1234567', 'cp.napoli@guardiacostiera.it', 'cp.napoli@pec.guardiacostiera.it');

-- 4. Uffici Circondariali Marittimi (Level 4)
INSERT INTO organizations (nome, tipo, codice, parent_id, indirizzo, telefono, email, pec) VALUES
('Ufficio Circondariale Marittimo di Licata', 'ufficio_circondariale', 'UCM_LICATA', 
 (SELECT id FROM organizations WHERE codice = 'CP_PORTO_EMPEDOCLE'),
 'Via del Porto, 5 - 92027 Licata (AG)', '0922-555555', 'ucm.licata@guardiacostiera.it', 'ucm.licata@pec.guardiacostiera.it'),

('Ufficio Circondariale Marittimo di Sciacca', 'ufficio_circondariale', 'UCM_SCIACCA', 
 (SELECT id FROM organizations WHERE codice = 'CP_PORTO_EMPEDOCLE'),
 'Via del Molo, 8 - 92019 Sciacca (AG)', '0925-777777', 'ucm.sciacca@guardiacostiera.it', 'ucm.sciacca@pec.guardiacostiera.it'),

('Ufficio Circondariale Marittimo di Marsala', 'ufficio_circondariale', 'UCM_MARSALA', 
 (SELECT id FROM organizations WHERE codice = 'CP_TRAPANI'),
 'Via del Porto, 3 - 91025 Marsala (TP)', '0923-999999', 'ucm.marsala@guardiacostiera.it', 'ucm.marsala@pec.guardiacostiera.it');

-- Sample users for each level
INSERT INTO users (email, nome, cognome, ruolo, organization_id) VALUES
-- MARICOGECAP user
('admin@maricogecap.it', 'Andrea', 'Cicala', 'maricogecap', 
 (SELECT id FROM organizations WHERE codice = 'MARICOGECAP')),

-- Direzione Marittima users
('direttore@dm.palermo.it', 'Mario', 'Rossi', 'direzione_marittima', 
 (SELECT id FROM organizations WHERE codice = 'DM_PALERMO')),

('direttore@dm.napoli.it', 'Giuseppe', 'Verdi', 'direzione_marittima', 
 (SELECT id FROM organizations WHERE codice = 'DM_NAPOLI')),

-- Capitaneria users
('comandante@cp.portoempedocle.it', 'Francesco', 'Bianchi', 'capitaneria', 
 (SELECT id FROM organizations WHERE codice = 'CP_PORTO_EMPEDOCLE')),

('comandante@cp.trapani.it', 'Antonio', 'Neri', 'capitaneria', 
 (SELECT id FROM organizations WHERE codice = 'CP_TRAPANI')),

-- Ufficio Circondariale users
('responsabile@ucm.licata.it', 'Salvatore', 'Gialli', 'ufficio_circondariale', 
 (SELECT id FROM organizations WHERE codice = 'UCM_LICATA')),

('responsabile@ucm.sciacca.it', 'Giovanni', 'Rosa', 'ufficio_circondariale', 
 (SELECT id FROM organizations WHERE codice = 'UCM_SCIACCA'));

-- Sample payment authorities
INSERT INTO autorita_pagamento (nome, indirizzo, pec, codice_ufficio, codice_territoriale, causale, codice_tributo, iban) VALUES
('Comune di Licata', 'Piazza Progresso, 1 - 92027 Licata (AG)', 'protocollo@pec.comune.licata.ag.it', 
 'AG001', '92027', 'Sanzioni amministrative', '667T', 'IT60X0542816901000000123456'),

('Comune di Sciacca', 'Via Roma, 1 - 92019 Sciacca (AG)', 'protocollo@pec.comune.sciacca.ag.it', 
 'AG002', '92019', 'Sanzioni amministrative', '667T', 'IT60X0542816901000000123457'),

('Comune di Marsala', 'Via Garibaldi, 1 - 91025 Marsala (TP)', 'protocollo@pec.comune.marsala.tp.it', 
 'TP001', '91025', 'Sanzioni amministrative', '667T', 'IT60X0542816901000000123458');

-- Sample infractions (national)
INSERT INTO infrazioni (titolo, descrizione, norma_violata, norma_sanzionatoria, minimo_massimo_edittale, pagamento_misura_ridotta, tipo, sequestro_obbligatorio, norma_sequestro) VALUES
('Codice della Navigazione - Art. 20', 'Navigazione senza patente nautica', 'Art. 20 Cod. Nav.', 'Art. 20 Cod. Nav.', '€ 1.000 - € 6.000', 2000.00, 'nazionale', false, NULL),

('Codice della Navigazione - Art. 25', 'Navigazione senza documenti di bordo', 'Art. 25 Cod. Nav.', 'Art. 25 Cod. Nav.', '€ 500 - € 3.000', 1000.00, 'nazionale', false, NULL),

('Codice della Navigazione - Art. 30', 'Pesca senza licenza', 'Art. 30 Cod. Nav.', 'Art. 30 Cod. Nav.', '€ 2.000 - € 12.000', 4000.00, 'nazionale', true, 'Art. 13 L. 689/81'),

('Codice della Navigazione - Art. 35', 'Inquinamento marino', 'Art. 35 Cod. Nav.', 'Art. 35 Cod. Nav.', '€ 5.000 - € 30.000', 10000.00, 'nazionale', true, 'Art. 13 L. 689/81');

-- Sample infractions (local)
INSERT INTO infrazioni (titolo, descrizione, norma_violata, norma_sanzionatoria, minimo_massimo_edittale, pagamento_misura_ridotta, tipo, sequestro_obbligatorio, norma_sequestro) VALUES
('Ordinanza Comune Licata - Art. 5', 'Sosta non autorizzata in zona portuale', 'Art. 5 Ord. Com. Licata', 'Art. 5 Ord. Com. Licata', '€ 100 - € 500', 200.00, 'locale', false, NULL),

('Regolamento Porto Sciacca - Art. 12', 'Mancato pagamento diritti portuali', 'Art. 12 Reg. Porto Sciacca', 'Art. 12 Reg. Porto Sciacca', '€ 200 - € 1.000', 400.00, 'locale', false, NULL);

-- Sample transgressors
INSERT INTO trasgressori (cognome, nome, luogo_nascita, data_nascita, residenza_comune, residenza_indirizzo, documento_tipo, documento_numero, documento_rilasciato, documento_data, codice_fiscale, telefono, email) VALUES
('Rossi', 'Mario', 'Palermo', '1985-03-15', 'Licata', 'Via Roma, 123', 'Carta Identità', 'PA1234567', 'Comune di Palermo', '2020-01-15', 'RSSMRA85C15H501Z', '3331234567', 'mario.rossi@email.it'),

('Bianchi', 'Giuseppe', 'Agrigento', '1978-07-22', 'Sciacca', 'Via Garibaldi, 45', 'Patente', 'AG9876543', 'Motorizzazione Agrigento', '2018-05-22', 'BNCGPP78L22A089X', '3339876543', 'giuseppe.bianchi@email.it'),

('Verdi', 'Francesco', 'Trapani', '1990-11-08', 'Marsala', 'Via Mazzini, 78', 'Carta Identità', 'TP5555555', 'Comune di Trapani', '2019-11-08', 'VRDFNC90S08L331Y', '3335555555', 'francesco.verdi@email.it');

-- Sample verbali
INSERT INTO verbali (numero_verbale, anno, organization_id, created_by, trasgressore_id, obbligato_coincide, contestazione_tipo, verbalizzanti, data_fatto, ora_fatto, luogo_fatto, narrazione_fatto, dichiarazione_trasgressore, autorita_pagamento_id, codice_navigazione, spese_notifica_presenti, spese_notifica_importo, riduzione_30, sequestro_presente, status) VALUES
('001/2024', 2024, 
 (SELECT id FROM organizations WHERE codice = 'UCM_LICATA'),
 (SELECT id FROM users WHERE email = 'responsabile@ucm.licata.it'),
 (SELECT id FROM trasgressori WHERE codice_fiscale = 'RSSMRA85C15H501Z'),
 true, 'immediata', 'Salvatore Gialli, Giovanni Rosa', '2024-01-15', '14:30:00', 'Porto di Licata', 
 'Il trasgressore è stato sorpreso a navigare senza patente nautica nella zona portuale di Licata.', 
 'Non ho nulla da dichiarare.', 
 (SELECT id FROM autorita_pagamento WHERE nome = 'Comune di Licata'),
 true, false, NULL, true, false, 'confermato'),

('002/2024', 2024, 
 (SELECT id FROM organizations WHERE codice = 'UCM_SCIACCA'),
 (SELECT id FROM users WHERE email = 'responsabile@ucm.sciacca.it'),
 (SELECT id FROM trasgressori WHERE codice_fiscale = 'BNCGPP78L22A089X'),
 true, 'immediata', 'Giovanni Rosa, Salvatore Gialli', '2024-01-20', '10:15:00', 'Porto di Sciacca', 
 'Il trasgressore è stato sorpreso a pescare senza licenza nella zona di riserva marina.', 
 'Non sapevo che fosse vietato.', 
 (SELECT id FROM autorita_pagamento WHERE nome = 'Comune di Sciacca'),
 true, false, NULL, false, true, 'confermato');

-- Link verbali to infractions
INSERT INTO verbali_infrazioni (verbale_id, infrazione_id) VALUES
((SELECT id FROM verbali WHERE numero_verbale = '001/2024'), 
 (SELECT id FROM infrazioni WHERE descrizione = 'Navigazione senza patente nautica')),

((SELECT id FROM verbali WHERE numero_verbale = '002/2024'), 
 (SELECT id FROM infrazioni WHERE descrizione = 'Pesca senza licenza'));
