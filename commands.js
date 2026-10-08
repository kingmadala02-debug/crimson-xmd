const config = require('./config');
const moment = require('moment-timezone');
moment.tz.setDefault('Africa/Nairobi');

function getMenu(pushName) {
const uptime = process.uptime();
const h = Math.floor(uptime/3600);
const m = Math.floor((uptime%3600)/60);
const date = moment().format('DD/MM/YYYY');
const time = moment().format('HH:mm:ss');

return `╭━━〘 👑 𝗖𝗥𝗜𝗠𝗦𝗢𝗡-𝗫𝗠𝗗 〙━━
│
│ 🩸 User: ${pushName}
│ 👑 Owner: KING 03
│ ⏱️ Uptime: ${h}h ${m}m
│ 📅 Date: ${date}
│ ⌚ Time: ${time}
│ ⚙️ Prefix: [. ]
│ 🌐 Mode: Public
│ 📦 Version: ALPHA
│
╰━━━━━━━━━━━━━━━

╭━━━「 *DOWNLOADER* 」━━━
│ •.play •.song •.playdoc
│ •.ytmp3 •.ytmp4 •.yts
│ •.tiktok •.tt2
│ •.fb •.ig •.twitter
│ •.mediafire •.gdrive
│ •.apk •.pinterest
╰━━━━━━━━━━━━━━━

╭━━━「 *GROUP* 」━━━
│ •.tagall •.hidetag •.tagadmin
│ •.kick •.add •.invite
│ •.promote •.demote
│ •.group open/close
│ •.link •.revoke
│ •.setname •.setdesc •.setppgc
│ •.antilink on/off
│ •.welcome on/off
│ •.poll
╰━━━━━━━━━━━━━━━

╭━━━「 *TOOLS* 」━━━
│ •.pair 254xxx •.panel
│ •.ss •.short •.tinyurl
│ •.sticker •.toimg •.toaudio
│ •.attp •.ttp •.qc
╰━━━━━━━━━━━━━━━

╭━━━「 *AI* 」━━━
│ •.ai •.gpt •.gemini
│ •.img •.imagine
│ •.remini •.hd
│ •.shazam
╰━━━━━━━━━━━━━━━

╭━━━「 *SEARCH* 」━━━
│ •.google •.wiki •.lyrics
│ •.ytsearch •.image
│ •.weather •.translate
╰━━━━━━━━━━━━━━━

╭━━━「 *FUN* 」━━━
│ •.fact •.quote •.joke •.meme
│ •.flirt •.ship •.truth •.dare
│ •.8ball
╰━━━━━━━━━━━━━━━

╭━━━「 *OWNER* 」━━━
│ •.alive •.ping •.menu
│ •.owner •.restart
│ •.broadcast •.block •.unblock
│ •.join •.leave
╰━━━━━━━━━━━━━━━

╭━━━「 *INFO* 」━━━
│ 🩸 Panel: ${config.panelLink}
│ 👑 Channel: whatsapp.com/channel/0029VbEPUuh5q08m91jnCD05
╰━━━━━━━━━━━━━━━
> 👑 *Power in the Shadows* 🩸
> *CRIMSON-XMD by KING 03*`;
}

const commands = {};

commands.menu = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, { text: getMenu(msg.pushName || 'User') });
};
commands.alive = async (s,m) => s.sendMessage(m.key.remoteJid, { text: `👑 *CRIMSON-XMD ALIVE* 🩸\n\n✅ 24/7 Online\n✅ 80+ Commands\n👑 KING 03\n\nType.menu` });
commands.ping = async (s,m) => {
    const start = Date.now();
    await s.sendMessage(m.key.remoteJid, { text: '🩸 Pinging...' });
    s.sendMessage(m.key.remoteJid, { text: `⚡ *${Date.now()-start}ms* 👑🩸` });
};
commands.owner = async (s,m) => s.sendMessage(m.key.remoteJid, { text: `👑 KING 03 🩸\nwa.me/${config.ownerNumber}` });
commands.panel = async (s,m) => s.sendMessage(m.key.remoteJid, { text: `🔗 PANEL:\n${config.panelLink}` });
commands.tagall = async (s,m) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return;
    const meta = await s.groupMetadata(m.key.remoteJid);
    const mentions = meta.participants.map(p=>p.id);
    await s.sendMessage(m.key.remoteJid, { text: `👑 TAGALL 🩸\n\n${mentions.map(id=>`@${id.split('@')[0]}`).join(' ')}\n\n> KING 03`, mentions });
};
commands.hidetag = async (s,m,a) => {
    if (!m.key.remoteJid.endsWith('@g.us')) return;
    const meta = await s.groupMetadata(m.key.remoteJid);
    await s.sendMessage(m.key.remoteJid, { text: a.join(' ') || '👑🩸', mentions: meta.participants.map(p=>p.id) });
};
commands.link = async (s,m) => { const c = await s.groupInviteCode(m.key.remoteJid); s.sendMessage(m.key.remoteJid, { text: `https://chat.whatsapp.com/${c}` }); };

const dlReply = (name) => async (s,m,a) => s.sendMessage(m.key.remoteJid, { text: `🩸 *${name}* \nQuery: ${a.join(' ') || 'No link'}\n\nAPI coming soon...` });
['play','song','ytmp3','ytmp4','tiktok','fb','ig','twitter','mediafire','gdrive','apk','pinterest','yts','ytsearch','google','ai','gpt','img','sticker','toimg','fact','joke'].forEach(cmd=>{ commands[cmd] = dlReply(cmd.toUpperCase()); });

// Override real ones
commands.menu = async (sock, msg) => { await sock.sendMessage(msg.key.remoteJid, { text: getMenu(msg.pushName || 'User') }); };
commands.alive = async (s,m) => s.sendMessage(m.key.remoteJid, { text: `👑 *CRIMSON-XMD ALIVE* 🩸\n\n✅ Online\n👑 KING 03\n\n.menu for commands` });

function handleCommands(sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!body.startsWith('.')) return;
        const [cmd,...args] = body.slice(1).trim().toLowerCase().split(' ');
        if (commands[cmd]) {
            try { await commands[cmd](sock, msg, args); }
            catch(e){ console.log(e); }
        }
    });
}
module.exports = { commands, handleCommands, getMenu };
