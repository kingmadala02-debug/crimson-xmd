const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, DisconnectReason } = require('@whiskeysockets/baileys')
const express = require('express')
const cors = require('cors')
const P = require('pino')
const path = require('path')
const config = require('./config')
const commands = require('./commands')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

let sock = null
let isConnected = false

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('crimson-session')
  sock = makeWASocket({
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })) },
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: [config.botName, "Chrome", "1.0"]
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', (u) => {
    if (u.connection === 'close' && u.lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut) startBot()
    if (u.connection === 'open') {
      isConnected = true
      console.log(`👑 ${config.botName} Online - ${config.ownerName}`)
    }
  })

  sock.ev.on('messages.upsert', async m => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return
    const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim()
    const from = msg.key.remoteJid
    if (!body.startsWith(config.prefix)) return
    const cmd = body.slice(1).split(' ')[0].toLowerCase()

    if (cmd === 'menu') {
      let text = `👑 ${config.botName} COMMAND LIST\n🩸 Owner: ${config.ownerName}\n━━━━━━━━━━━━━━━━━━━━\n\n`
      commands.panel.forEach(c => { text += `${c.cmd}\n └ ${c.desc}\n\n` })
      commands.general.forEach(c => { text += `${c.cmd}\n └ ${c.desc}\n\n` })
      text += `━━━━━━━━━━━━━━━━━━━━\n👑 Panel: ${config.website}\n🩸 Channel: ${config.channelLink}`
      await sock.sendMessage(from, { text })
    }
    if (cmd === 'panel') {
      await sock.sendMessage(from, { text: `👑 ${config.botName} PANEL\n\n🩸 Link: ${config.website}\n\n👑 Enter number to get code\n🩸 Instant generation\n\nBy ${config.ownerName}` })
    }
    if (cmd === 'ping') {
      await sock.sendMessage(from, { text: `👑 Pong!\n🩸 Speed: Active\n👑 ${config.botName}` })
    }
    if (cmd === 'owner') {
      await sock.sendMessage(from, { text: `👑 Owner: ${config.ownerName}\n🩸 Number: ${config.ownerNumber}\n👑 Group: ${config.groupLink}\n🩸 Channel: ${config.channelLink}` })
    }
  })
}

app.get('/code', async (req, res) => {
  let number = req.query.number
  if (!number) return res.json({ error: 'Number required' })
  number = number.replace(/\D/g, '')
  if (number.startsWith('0')) number = '254' + number.slice(1)
  if (number.length === 9) number = '254' + number
  if (!number.startsWith('254')) return res.json({ error: 'Use format 2547XXXXXXXX' })
  if (!sock ||!isConnected) return res.json({ error: 'Bot not online, wait 10 seconds and retry' })
  try {
    let code = await sock.requestPairingCode(number)
    code = code?.match(/.{1,4}/g)?.join('-') || code
    res.json({ number, code, success: true })
  } catch (e) {
    res.json({ error: 'Failed. Make sure number is on WhatsApp' })
  }
})

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'panel.html')))
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Running on ${PORT}`))
startBot()
