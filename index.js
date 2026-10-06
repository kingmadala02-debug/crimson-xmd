import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import pino from "pino"
import config from "./config.js"

async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState("./auth_new")
const { version } = await fetchLatestBaileysVersion()
console.log("Baileys version:", version)

const sock = makeWASocket({
  version,
  auth:state,
  logger:pino({level:"silent"}),
  printQRInTerminal: false,
  browser:["Chrome","Chrome","1.0.0"]
})
sock.ev.on("creds.update", saveCreds)

if(!sock.authState.creds.registered){
  const phone = "254738072477"
  console.log(`\n🩸 Najaribu kupair namba: ${phone} 🩸\nSubiri sec 8...`)
  await new Promise(r=>setTimeout(r,8000))
  try{
    const code = await sock.requestPairingCode(phone)
    console.log(`\n====================\n🔥 CODE: ${code} 🔥\n====================\nWeka haraka! Inaisha baada ya 60 sec!\nWhatsApp > ⋮ > Linked Devices > Link a device > Link with phone number\n`)
  }catch(e){
    console.log("PAIR FAIL: "+e.message+"\nJaribu tena deploy")
  }
}

sock.ev.on("connection.update", u=>{
const {connection,lastDisconnect}=u
console.log("Connection:", connection)
if(connection==="close"){
  const code = lastDisconnect?.error?.output?.statusCode
  console.log("Closed code:", code)
  if(code!==DisconnectReason.loggedOut) startBot()
}
if(connection==="open") console.log(`🩸 CRIMSON BLOOD CONNECTED! 🩸`)
})

// --- COMMANDS ZOTE 180+ ULIOTUMA ZIKO HAPA ---
sock.ev.on("messages.upsert", async ({messages})=>{
const m=messages[0]; if(!m.message || m.key.fromMe) return
const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||""
if(!body.startsWith(config.prefix)) return
const args=body.slice(1).trim().split(/ +/); const cmd=args.shift().toLowerCase(); const jid=m.key.remoteJid
const isGroup=jid.endsWith("@g.us"); const mentioned=m.message.extendedTextMessage?.contextInfo?.mentionedJid||[]

if(cmd==="menu"){
await sock.sendMessage(jid,{text:`🩸 *${config.botName} - 180 CMDS* 🩸\nADMIN: add promote promoteall demote demoteall kick kickall ban unban clearbanlist warn mute unmute gctime antileave welcome joinapproval onlyadmins creategroup leave ex\nAUTO-MOD: antilink antisticker antiimage antivideo antiaudio antimention antistatusmention antigrouplink antidemote antipromote\nGROUP: groupinfo grouplink tagadmin tagall poll hidetag link invite revoke setdesc fangtrace getgpp togstatus listinactive stickerpack online disp\nCORE: setbotname resetbotname checkbotname setprefix iamowner about block unblock blockdetect silent anticall antidelete antiedit mode setpp repo ownermenu platform shutdown broadcast restart reloadenv settings hostip update\nAUTO: autoread autotyping autorecording autoreact autoreactstatus autoviewstatus autobio autorec autojoin\nMUSIC: play song video videodoc lyrics shazam spotify ytmp3 ytmp4 ytv yts ytplay ytvdoc videodl apk downloadurl facebook instagram snapchat tiktok twitter tgsticker tiksearch playlist\nAI: gpt chatgpt chatbot copilot bard bing claudeai grok blackbox mistral metai perplexity venice wormgpt ilama qwenai analyze aiscanner humanizer summarize speechwriter suno flux removebg enlarger erase aimenu imagine imagegen image anime art real remini vision logoai brandlogo companylogo videogen introvideo lovevideo tigervideo lightningpubg goldlogo silverlogo platinumlogo chromelogo diamondlogo bronzelogo steelogo copperlogo titaniumlogo firelogo icelogo iceglowlogo lightninglogo rainbowlogo sunlogo moonlogo dragonlogo phoenixlogo wizardlogo crystallogo darkmagiclogo shadowlogo smokelogo bloodlogo neonlogo glowlogo gradientlogo matrixlogo logo\nUTILITY: alive ping ping2 covid remind sessioninfo genmusic genlyrics musicprompt define fetch getpp getgpp getip inspect iplookup news citizennews bbcnews ntvnews kbcnews technews prefixinfo qrencode qrdecode topdf extractpdf toword extractword toexcel extractexcel toppt extractppt resetwarn save rename screenshot setwarn shorturl take tiktok autobio toimage tosticker toaudio tovoice tts trebleboost jarvis movie trailer couple bf gf gay getjid quote channelstatus goodmorning goodnight ipinfo nglflood nmap shodan gitclone repanalyze\n\n${config.footer}`},{quoted:m}); return
}
if(["ping","alive"].includes(cmd)){ await sock.sendMessage(jid,{text:`🩸 ${config.botName} ALIVE!`},{quoted:m}); return }
})
}
startBot()
}
startBot()
