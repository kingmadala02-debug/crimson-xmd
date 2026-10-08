const express = require('express');
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

let sock = null;
let isReady = false;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./crimson-session');
    
    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ["CRIMSON-XMD", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('👑 CRIMSON-XMD Online - King 03');
            isReady = true;
        }
        if (connection === 'close') {
            isReady = false;
            startBot();
        }
    });

    // Keep bot alive
    setTimeout(() => { isReady = true; }, 5000);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'panel.html'));
});

app.get('/code', async (req, res) => {
    const number = req.query.number?.replace(/[^0-9]/g, '');
    if (!number || number.length < 10) {
        return res.json({ error: 'Invalid number' });
    }
    if (!sock) {
        return res.json({ error: 'Bot not online, wait 10 seconds and retry' });
    }
    try {
        let code = await sock.requestPairingCode(number);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        console.log(`🩸 Pair code for ${number}: ${code}`);
        res.json({ code: code });
    } catch (e) {
        console.log('Pair error:', e.message);
        res.json({ error: 'Failed to get code, wait 10 sec and retry. ' + e.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
    startBot();
});
