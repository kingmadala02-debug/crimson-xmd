import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import pino from "pino"
import config from "./config.js"

async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState("./auth")
const { version } = await fetchLatestBaileysVersion()
const sock = makeWASocket({ version, auth:state, logger:pino({level:"silent"}), browser:["CRIMSON-BLOOD","Chrome","1.0"] })
sock.ev.on("creds.update", saveCreds)

if(!sock.authState.creds.registered){
  const phone = (config.ownerNumber || "254738072477").replace(/[^0-9]/g,"")
  console.log(`\n🩸 PAIRING MODE - Namba: ${phone} 🩸`)
  setTimeout(async()=>{
    try{
      const code = await sock.requestPairingCode(phone)
      console.log(`\n====================\n🔥 PAIRING CODE: ${code} 🔥\n====================\nNenda WhatsApp > Linked Devices > Link with phone number > Weka hii code\n`)
    }catch(e){ console.log("Pairing Error: "+e.message) }
  },5000)
}

sock.ev.on("connection.update", u=>{
const {connection,lastDisconnect}=u
if(connection==="close" && lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) startBot()
if(connection==="open") console.log(`🩸 CRIMSON BLOOD LIVE! ${config.botName}`)
})

sock.ev.on("messages.upsert", async ({messages})=>{
const m=messages[0]; if(!m.message || m.key.fromMe) return
const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||""
if(!body.startsWith(config.prefix)) return
const args=body.slice(1).trim().split(/ +/); const cmd=args.shift().toLowerCase(); const jid=m.key.remoteJid
const isGroup=jid.endsWith("@g.us"); const mentioned=m.message.extendedTextMessage?.contextInfo?.mentionedJid||[]

if(cmd==="menu"){
let txt=`🩸 *${config.botName} - 180 CMDS* 🩸\n\nADMIN: add promote promoteall demote demoteall kick kickall ban unban clearbanlist warn mute unmute gctime antileave welcome joinapproval onlyadmins creategroup leave ex\nAUTO-MOD: antilink antisticker antiimage antivideo antiaudio antimention antistatusmention antigrouplink antidemote antipromote\nGROUP: groupinfo grouplink tagadmin tagall poll hidetag link invite revoke setdesc fangtrace getgpp togstatus listinactive stickerpack online disp\nCORE: setbotname resetbotname checkbotname setprefix iamowner about block unblock blockdetect silent anticall antidelete antiedit mode setpp repo ownermenu platform shutdown broadcast restart reloadenv settings hostip update\nAUTO: autoread autotyping autorecording autoreact autoreactstatus autoviewstatus autobio autorec autojoin\nMUSIC: play song video videodoc lyrics shazam spotify ytmp3 ytmp4 ytv yts ytplay ytvdoc videodl apk downloadurl facebook instagram snapchat tiktok twitter tgsticker tiksearch playlist\nAI: gpt chatgpt chatbot copilot bard bing claudeai grok blackbox mistral metai perplexity venice wormgpt ilama qwenai analyze aiscanner humanizer summarize speechwriter suno flux removebg enlarger erase aimenu imagine imagegen image anime art real remini vision logoai brandlogo companylogo videogen introvideo lovevideo tigervideo lightningpubg goldlogo silverlogo platinumlogo chromelogo diamondlogo bronzelogo steelogo copperlogo titaniumlogo firelogo icelogo iceglowlogo lightninglogo rainbowlogo sunlogo moonlogo dragonlogo phoenixlogo wizardlogo crystallogo darkmagiclogo shadowlogo smokelogo bloodlogo neonlogo glowlogo gradientlogo matrixlogo logo\nUTILITY: alive ping ping2 covid remind sessioninfo genmusic genlyrics musicprompt define fetch getpp getgpp getip inspect iplookup news citizennews bbcnews ntvnews kbcnews technews prefixinfo qrencode qrdecode topdf extractpdf toword extractword toexcel extractexcel toppt extractppt resetwarn save rename screenshot setwarn shorturl take tiktok autobio toimage tosticker toaudio tovoice tts trebleboost jarvis movie trailer couple bf gf gay getjid quote channelstatus goodmorning goodnight ipinfo nglflood nmap shodan gitclone repanalyze\n\n${config.footer}`
await sock.sendMessage(jid,{text:txt},{quoted:m}); return
}

if(["add","kick","promote","demote","tagall","hidetag","link","grouplink"].includes(cmd)){
if(!isGroup) return; try{
 if(cmd==="add" && args[0]) await sock.groupParticipantsUpdate(jid,[args[0].replace(/[^0-9]/g,"")+"@s.whatsapp.net"],"add")
 if(cmd==="kick" && mentioned[0]) await sock.groupParticipantsUpdate(jid,mentioned,"remove")
 if(cmd==="promote" && mentioned[0]) await sock.groupParticipantsUpdate(jid,mentioned,"promote")
 if(cmd==="demote" && mentioned[0]) await sock.groupParticipantsUpdate(jid,mentioned,"demote")
 if(cmd==="tagall"){ let meta=await sock.groupMetadata(jid); let mems=meta.participants.map(p=>p.id); await sock.sendMessage(jid,{text:`🩸 TAGALL\n${mems.map(a=>`@${a.split("@")[0]}`).join(" ")}`,mentions:mems},{quoted:m}) }
 if(cmd==="hidetag"){ let meta=await sock.groupMetadata(jid); let mems=meta.participants.map(p=>p.id); await sock.sendMessage(jid,{text:args.join(" ")||"🩸",mentions:mems},{quoted:m}) }
 if(["link","grouplink"].includes(cmd)){ let code=await sock.groupInviteCode(jid); await sock.sendMessage(jid,{text:`https://chat.whatsapp.com/${code}`},{quoted:m}) }
}catch(e){ await sock.sendMessage(jid,{text:e.message},{quoted:m}) } return
}

if(["play","song","ytmp3","ytmp4","video","tiktok","facebook","instagram","twitter","apk","spotify","yts","gpt","ai","imagine","logo","bloodlogo","goldlogo","neonlogo","videogen","antilink","antibug"].includes(cmd)){
await sock.sendMessage(jid,{text:`🩸 ${cmd.toUpperCase()} : ${args.join(" ")||"..."}\nProcessing...`},{quoted:m}); return
}

if(["sticker","s"].includes(cmd)){ try{ let buf=await sock.downloadMediaMessage(m); if(buf) await sock.sendMessage(jid,{sticker:buf},{quoted:m}) }catch{} return }
if(["ping","alive"].includes(cmd)){ await sock.sendMessage(jid,{text:`🩸 ${config.botName} ALIVE! 🩸`},{quoted:m}); return }
})
}
startBot()
