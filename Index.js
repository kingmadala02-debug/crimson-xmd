import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys'
import pino from 'pino'
import config from './config.js'

async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser: ["CRIMSON-XMD","Chrome","1.0"] })
  sock.ev.on('creds.update', saveCreds)

  if(!sock.authState.creds.registered){
    const num = process.env.PHONE_NUMBER
    if(num){
      setTimeout(async()=>{
        const code = await sock.requestPairingCode(num)
        console.log(`\n🔥 CODE: ${code} 🔥\n`)
      }, 3000)
    }
  }

  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0]
    if(!m.message) return
    const txt = m.message.conversation || m.message.extendedTextMessage?.text || ""
    if(!txt.startsWith(config.prefix)) return
    const cmd = txt.slice(1).split(' ')[0].toLowerCase()
    if(cmd === 'ping') await sock.sendMessage(m.key.remoteJid, {text:`👑 ${config.botName} Pong! ⚡`}, {quoted:m})
    if(cmd === 'menu') await sock.sendMessage(m.key.remoteJid, {text:`*${config.botName} by ${config.ownerName}*\nGroup: ${config.group}\n\nCommands:\n.ping\n.menu`}, {quoted:m})
  })
  sock.ev.on('connection.update', ({connection})=>{ if(connection==='open') console.log(`✅ ${config.botName} IMEWAKA!`) })
}
start()
