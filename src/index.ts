// Kanäle, die auf doppelte Nachrichten geprüft werden sollen (bitte als Strings angeben!)
const channelIds: string[] = [];
// Zeitspanne, in welcher eine Nachricht mit gleichem Inhalt erkannt wird [in Minuten]
const duplicateTime = 1;
// Nachricht des Bots bei doppelten Nachrichten (Die Nachricht des Bots wird nach 5s gelöscht, die doppelte sofort)
const botMessage = 'Bitte keine doppelten Nachrichten senden' + ' ';
// Soll der Nutzer in der botMessage erwähnt werden?
const mentionUser = true;

// --- AB HIER NICHTS ÄNDERN ---
import * as Discord from 'discord.js';
const client = new Discord.Client();
const channels: (Discord.Channel | undefined)[] = [];
const messageCache = new Map<Discord.User, Map<string, Date>>();

client.on('ready', async () => {
	console.log('Bot ready at ' + new Date());
	for (const channelId of channelIds) {
		const channel = client.channels.cache.get(channelId);
		channels.push(channel);
	}
});

client.on('message', async (message: Discord.Message) => {
	for (const [user, userMessages] of messageCache.entries()) {
		for (const cachedMessage of userMessages.entries()) {
			const diff = new Date().getTime() - cachedMessage[1].getTime();
			if (diff > duplicateTime * 60 * 1000) {
				userMessages.delete(cachedMessage[0]);
			}
		}
		messageCache.set(user, userMessages);
	}

	if(message.author.bot) {return;}
	if(!channels.includes(message.channel)) {return;}

	if(!messageCache.has(message.author)) {
		messageCache.set(message.author, new Map<string, Date>([[message.content, new Date()]]));
		return;
	}

	const messages: Map<string, Date> = messageCache.get(message.author) as Map<string, Date>;
	if (messages.get(message.content)) {
		if (mentionUser) {
			message.channel.send(botMessage + '<@' + message.author + '>').then(msg => {
				msg.delete({ timeout: 5000 });
			});
		} else {
			message.channel.send(botMessage).then(msg => {
				msg.delete({ timeout: 5000 });
			});
		}
		message.delete({ reason: 'Doppelte Nachricht' });
	} else {
		messages.set(message.content, new Date());
		messageCache.set(message.author, messages);
	}
});


client.login('');