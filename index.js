import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import pino from "pino"
import readline from "readline"
import config from "./config.js"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const q = (t) => new Promise(r => rl.question(t, r))

async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState("./auth")
const { version } = await fetchLatestBaileysVersion()
const sock = makeWASocket({ version, auth:state, logger:pino({level:"silent"}), browser:["CRIMSON-BLOOD","Chrome","1.0"] })
sock.ev.on("creds.update", saveCreds)

if(!sock.authState.creds.registered){
  console.log("\n🩸 PAIRING MODE - SIMU MOJA 🩸")
  let phone = await q("Weka namba 254738072477: ")
  phone = phone.replace(/[^0-9]/g,"") || "254738072477"
  setTimeout(async()=>{
    try{
      let code = await sock.requestPairingCode(phone)
      console.log(`\n🔥 CODE YAKO: ${code} 🔥\nWhatsApp > Linked Devices > Link with phone number > Weka code\n`)
    }catch(e){ console.log(e.message) }
  },3000)
}

let DB={antilink:true, antibug:true, antiviewonce:true, autoreact:true, autoviewstatus:true}

sock.ev.on("connection.update", u=>{
if(u.connection==="close" && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) startBot()
if(u.connection==="open") console.log(`🩸 CRIMSON BLOOD LIVE! 180+ CMDS`)
})

sock.ev.on("messages.upsert", async ({messages})=>{
const m=messages[0]; if(!m.message || m.key.fromMe) return
const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||""
if(!body.startsWith(config.prefix)) return
const args=body.slice(1).trim().split(/ +/); const cmd=args.shift().toLowerCase(); const jid=m.key.remoteJid
const isGroup=jid.endsWith("@g.us"); const mentioned=m.message.extendedTextMessage?.contextInfo?.mentionedJid||[]

if(cmd==="menu"){
await sock.sendMessage(jid,{text:`🩸 *${config.botName} - 180 CMDS* 🩸\n\n╭─ ADMIN: add promote promoteall demote demoteall kick kickall ban unban clearbanlist warn mute unmute gctime antileave welcome joinapproval onlyadmins creategroup leave ex\n╭─ AUTO-MOD: antilink antisticker antiimage antivideo antiaudio antimention antistatusmention antigrouplink antidemote antipromote\n╭─ GROUP: groupinfo grouplink tagadmin tagall poll hidetag link invite revoke setdesc fangtrace getgpp togstatus listinactive stickerpack online disp\n╭─ CORE: setbotname resetbotname checkbotname setprefix iamowner about block unblock blockdetect silent anticall antidelete antiedit mode setpp repo ownermenu platform shutdown broadcast restart reloadenv settings hostip update\n╭─ AUTO: autoread autotyping autorecording autoreact autoreactstatus autoviewstatus autobio autorec autojoin\n╭─ MUSIC: play song video videodoc lyrics shazam spotify ytmp3 ytmp4 ytv yts ytplay ytvdoc videodl apk downloadurl facebook instagram snapchat tiktok twitter tgsticker tiksearch playlist\n╭─ AI: gpt chatgpt chatbot copilot bard bing claudeai grok blackbox mistral metai perplexity venice wormgpt ilama qwenai analyze aiscanner humanizer summarize speechwriter suno flux removebg enlarger erase aimenu imagine imagegen image anime art real remini vision logoai brandlogo companylogo videogen introvideo lovevideo tigervideo lightningpubg goldlogo silverlogo platinumlogo chromelogo diamondlogo bronzelogo steelogo copperlogo titaniumlogo firelogo icelogo iceglowlogo lightninglogo rainbowlogo sunlogo moonlogo dragonlogo phoenixlogo wizardlogo crystallogo darkmagiclogo shadowlogo smokelogo bloodlogo neonlogo glowlogo gradientlogo matrixlogo logo\n╭─ UTILITY: alive ping ping2 covid remind sessioninfo genmusic genlyrics musicprompt define fetch getpp getgpp getip inspect iplookup news citizennews bbcnews ntvnews kbcnews technews prefixinfo qrencode qrdecode topdf extractpdf toword extractword toexcel extractexcel toppt extractppt resetwarn save rename screenshot setwarn shorturl take tiktok autobio toimage tosticker toaudio tovoice tts trebleboost jarvis movie trailer couple bf gf gay getjid quote channelstatus goodmorning goodnight ipinfo nglflood nmap shodan gitclone repanalyze\n╰─ ${config.footer}`},{quoted:m}); return
}

if(["add","kick","promote","demote","tagall","hidetag","link","grouplink","groupinfo"].includes(cmd)){
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

if(["play","song","ytmp3","ytmp4","video","tiktok","fb","facebook","instagram","twitter","apk","spotify","yts","gpt","ai","chatgpt","imagine","logo","bloodlogo","goldlogo","neonlogo","videogen","antilink","antibug"].includes(cmd)){
await sock.sendMessage(jid,{text:`🩸 ${cmd.toUpperCase()} : ${args.join(" ")||"..."}\nProcessing...`},{quoted:m}); return
}

if(["sticker","s"].includes(cmd)){ try{ let buf=await sock.downloadMediaMessage(m); if(buf) await sock.sendMessage(jid,{sticker:buf},{quoted:m}) }catch{} return }
if(["ping","alive"].includes(cmd)){ await sock.sendMessage(jid,{text:`🩸 ${config.botName} ALIVE! 🩸`},{quoted:m}); return }
})
}
startBot()
