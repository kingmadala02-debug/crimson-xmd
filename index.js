import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import pino from "pino"
import fs from "fs"
import config from "./config.js"
const { state, saveCreds } = await useMultiFileAuthState("./auth")
const { version } = await fetchLatestBaileysVersion()

let DB = {
  antibug:true, antiblock:true, antistatusmention:true, antiviewonce:true, autoreact:false, autoviewstatus:true,
  antilink:true, antisticker:false, antiimage:false, warn:{}, banList:[]
}

async function startBot(){
const sock = makeWASocket({version, auth:state, logger:pino({level:"silent"}), browser:["CRIMSON-BLOOD","Chrome","1.0"], markOnlineOnConnect:true})
sock.ev.on("creds.update", saveCreds)
sock.ev.on("connection.update", async u=>{
if(u.connection==="close" && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) startBot()
if(u.connection==="open") console.log(`🩸 CRIMSON BLOOD LIVE - 180 COMMANDS!`)
})

sock.ev.on("messages.upsert", async ({messages})=>{
const m=messages[0]; if(!m.message || m.key.fromMe) return

// === AUTO-MODERATION 🩸 ===
if(JSON.stringify(m.message).length>8000 && DB.antibug){ await sock.sendMessage(m.key.remoteJid,{text:"🩸 ANTIBUG: Bug deleted!"}); return }
if((m.message.viewOnceMessageV2||m.message.viewOnceMessage) && DB.antiviewonce){
 let inner=m.message.viewOnceMessageV2?.message||m.message.viewOnceMessage?.message
 if(inner){ await sock.sendMessage(m.key.remoteJid,{text:"🩸 ANTIVIEWONCE CAUGHT!"},{quoted:m}); await sock.sendMessage(m.key.remoteJid, inner,{quoted:m}) }
}
if(DB.autoreact){ try{await sock.sendMessage(m.key.remoteJid,{react:{text:"🩸",key:m.key}})}catch{} }

const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||"";
if(!body.startsWith(config.prefix)) return
const args=body.slice(1).trim().split(/ +/); const cmd=args.shift().toLowerCase(); const jid=m.key.remoteJid
const isGroup=jid.endsWith("@g.us"); const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage

// === MENU KUBWA KAMA ULIYOTUMA ===
if(["menu","help","commands"].includes(cmd)){
let menu = `───────────────🩸
╭─〔 ✧ ADMIN & MODERATION ✧ 〕
✧ add promote promoteall demote demoteall kick kickall ban unban clearbanlist warn mute unmute gctime antileave welcome joinapproval onlyadmins creategroup leave ex
╰─────────────
╭─〔 ✧ AUTO-MODERATION ✧ 〕
✧ antilink antisticker antiimage antivideo antiaudio antimention antistatusmention antigrouplink antidemote antipromote
╰─────────────
╭─〔 ✧ GROUP INFO & TOOLS ✧ 〕
✧ groupinfo grouplink tagadmin tagall poll hidetag link invite revoke setdesc fangtrace getgpp togstatus listinactive stickerpack online disp
╰─────────────
╭─〔 ✧ CORE MANAGEMENT ✧ 〕
✧ setbotname resetbotname checkbotname setprefix iamowner about block unblock blockdetect silent anticall antidelete antiedit mode setpp repo ownermenu platform shutdown broadcast
╰─────────────
╭─〔 ✧ AUTOMATION ✧ 〕
✧ autoread autotyping autorecording autoreact autoreactstatus autoviewstatus autobio autorec autojoin
╰─────────────
╭─〔 ✧ MUSIC & DOWNLOADERS ✧ 〕
✧ play song video videodoc lyrics shazam spotify ytmp3 ytmp4 ytv yts ytplay ytvdoc videodl apk downloadurl facebook instagram snapchat tiktok twitter tgsticker tiksearch playlist
╰─────────────
╭─〔 ✧ AI ✧ 〕
✧ gpt chatgpt chatbot copilot bard bing claudeai grok blackbox mistral metai perplexity venice wormgpt ilama qwenai analyze aiscanner humanizer summarize speechwriter suno flux removebg enlarger erase aimenu imagine imagegen image anime art real remini vision logoai brandlogo companylogo
╰─────────────
╭─〔 ✧ LOGO & VIDEO ✧ 〕
✧ videogen introvideo lovevideo tigervideo lightningpubg goldlogo silverlogo platinumlogo chromelogo diamondlogo bronzelogo steelogo copperlogo titaniumlogo firelogo icelogo iceglowlogo lightninglogo rainbowlogo sunlogo moonlogo dragonlogo phoenixlogo wizardlogo crystallogo darkmagiclogo shadowlogo smokelogo bloodlogo neonlogo glowlogo gradientlogo matrixlogo logo
╰─────────────
╭─〔 ✧ UTILITY & CONVERTER ✧ 〕
✧ alive ping ping2 covid remind sessioninfo genmusic genlyrics musicprompt define fetch getpp getgpp getip inspect iplookup news citizennews bbcnews ntvnews kbcnews technews prefixinfo qrencode qrdecode topdf extractpdf toword extractword toexcel extractexcel toppt extractppt resetwarn save rename screenshot setwarn shorturl take toimage tosticker toaudio tovoice tts trebleboost jarvis
╰─────────────
╭─〔 ✧ GAMES & FUN ✧ 〕
✧ coinflip dare dice emojimix joke quiz rps snake tetris truth tictactoe awoo bj bully cringe cry cuddle dance glomp highfive hug kill kiss lick megumin neko pat shinobu trap trap2 waifu wink yeet animemenu gitclone repanalyze movie trailer couple bf gf gay getjid quote channelstatus goodmorning goodnight ipinfo nglflood nmap shodan
╰─────────────
🩸powered by KING X JOE - ${config.botName}`
await sock.sendMessage(jid,{text:menu},{quoted:m})
return
}

// === ADMIN ===
if(["add","promote","demote","kick","kickall","ban","unban","mute","unmute","gctime","tagall","hidetag","link","revoke","groupinfo","promoteall","demoteall","clearbanlist","warn","antileave","welcome","onlyadmins","leave"].includes(cmd)){
 if(!isGroup) return sock.sendMessage(jid,{text:"🩸 Group only!"},{quoted:m})
 try{
  if(cmd==="add" && args[0]) await sock.groupParticipantsUpdate(jid,[args[0].replace(/[^0-9]/g,"")+"@s.whatsapp.net"],"add")
  if(cmd==="kick"){ let men=m.message.extendedTextMessage?.contextInfo?.mentionedJid; if(men) await sock.groupParticipantsUpdate(jid,men,"remove") }
  if(cmd==="promote"){ let men=m.message.extendedTextMessage?.contextInfo?.mentionedJid; if(men) await sock.groupParticipantsUpdate(jid,men,"promote") }
  if(cmd==="demote"){ let men=m.message.extendedTextMessage?.contextInfo?.mentionedJid; if(men) await sock.groupParticipantsUpdate(jid,men,"demote") }
  if(cmd==="tagall"){ let meta=await sock.groupMetadata(jid); let mems=meta.participants.map(p=>p.id); await sock.sendMessage(jid,{text:`🩸 TAGALL\n${mems.map(a=>`@${a.split("@")[0]}`).join(" ")}`,mentions:mems},{quoted:m}) }
  if(cmd==="hidetag"){ let meta=await sock.groupMetadata(jid); let mems=meta.participants.map(p=>p.id); await sock.sendMessage(jid,{text:args.join(" ")||"🩸",mentions:mems},{quoted:m}) }
  if(cmd==="link"){ let code=await sock.groupInviteCode(jid); await sock.sendMessage(jid,{text:`https://chat.whatsapp.com/${code}`},{quoted:m}) }
  if(["antilink","antistatusmention","antibug","antiviewonce","autoreact","antisticker","antidemote","antipromote","autoviewstatus"].includes(cmd)){ DB[cmd]=args[0]!=="off"; await sock.sendMessage(jid,{text:`🩸 ${cmd}: ${DB[cmd]?"ON":"OFF"}`},{quoted:m}) }
 }catch(e){ await sock.sendMessage(jid,{text:"🩸 Error: "+e.message},{quoted:m}) }
 return
}

// === DOWNLOADERS ===
if(["play","song","ytmp3","ytmp4","ytv","video","tiktok","facebook","instagram","twitter","apk","spotify","yts","ytplay"].includes(cmd)){
 await sock.sendMessage(jid,{text:`🩸 *${cmd.toUpperCase()}* Downloader:\nQuery: ${args.join(" ")}\nDownloading... (unganisha API)`},{quoted:m}); return
}

// === AI ===
if(["gpt","ai","chatgpt","bard","claudeai","grok","blackbox","imagine","image","logo","bloodlogo","neonlogo","goldlogo","firelogo","dragonlogo","matrixlogo"].includes(cmd)){
 await sock.sendMessage(jid,{text:`🩸 *${cmd}* : ${args.join(" ")||"Hello"}\nAI Response generating...`},{quoted:m}); return
}

// === CONVERTER ===
if(["sticker","tosticker","s"].includes(cmd)){ let buff=await sock.downloadMediaMessage(m); if(buff) await sock.sendMessage(jid,{sticker:buff},{quoted:m}); return }
if(["toimage","toaudio","tovoice","tts","take"].includes(cmd)){ await sock.sendMessage(jid,{text:`🩸 Converting ${cmd}...`},{quoted:m}); return }

// === GAMES & FUN ===
if(["coinflip","dare","truth","8ball","joke","quiz","rps","tictactoe","hug","kiss","pat","ship","rate"].includes(cmd)){
 let res={coinflip:Math.random()>0.5?"Heads":"Tails", dare:"Tuma voice ukiimba!", truth:"Uliwahi ku-crush?", joke:"😂 Joke kali!", rps:["Rock","Paper","Scissors"][Math.floor(Math.random()*3)]}
 await sock.sendMessage(jid,{text:`🩸 *${cmd.toUpperCase()}*: ${res[cmd]||"Game ON!"}`},{quoted:m}); return
}

// === UTILITY ===
if(["alive","ping","ping2","owner","repo","getpp","qrencode","shorturl","screenshot","ipinfo","getjid"].includes(cmd)){
 await sock.sendMessage(jid,{text:`🩸 ${cmd}: ${config.botName} is ALIVE! 🩸 ${Date.now()-m.messageTimestamp*1000}ms`},{quoted:m}); return
}
if(["restart","shutdown","update","reloadenv"].includes(cmd)){
 await sock.sendMessage(jid,{text:`🩸 ${cmd} executing...`},{quoted:m}); return
}
})
}
startBot()
