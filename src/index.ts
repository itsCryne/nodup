// Umgebungsvaribalen laden
import * as dotenv from 'dotenv';
dotenv.config();

// Bibliotheken einbinden
import cron from 'node-cron';
import * as Discord from 'discord.js';
const client = new Discord.Client({ retryLimit: 5 });

// globale Variablen definieren
const channelIds: string[] = [],
	startTimestamp = new Date().getTime();
const messageCache = new Map<Discord.Snowflake, Map<string, number>>();
let	warnMessage = 'Bitte sende keine doppelten Nachrichten.',
	cooldown: number = 1 * 60 * 1000,
	newMessages = false,
	mentionUser = true;

const updateCache = () => {
	const timestamp = new Date().getTime();
	if (!newMessages) return; // → keine neuen Nachrichten
	for (const [user, messages] of messageCache.entries()) {
		for (const message of messages.entries()) {
			if (timestamp - message[1] > cooldown) {
				messages.delete(message[0]);
			}
		}
		messageCache.set(user, messages);
	}
};

client.on('ready', async () => {
	console.log('Der Bot ist bereit (' + (new Date().getTime() - startTimestamp) + ' ms)');
	if (process.env.CHANNELS) {
		process.env.CHANNELS.split(' ').forEach(channelId => {
			const channel = client.channels.cache.get(channelId);
			if (channel?.isText()) channelIds.push(channelId);
		});
	}
	if (process.env.MESSAGE) {
		warnMessage = process.env.MESSAGE;
	}
	if (process.env.MENTION) {
		mentionUser = Boolean(process.env.MENTION);
	}
	if (process.env.TIMER) {
		cooldown = Number(process.env.TIMER) * 60 * 1000;
	}
	console.log('→ Es werden ' + channelIds.length + ' Kanäle beobachtet.');
	cron.schedule('* * * * *', updateCache);
});

client.on('message', async (message: Discord.Message) => {
	if (message.author.bot || !channelIds.includes(message.channel.id)) return;
	newMessages = true; // → updateCache() räumt wieder etwas auf

	if (!messageCache.has(message.author.id)) {
		const messages = new Map<string, number>([[message.content, message.createdAt.getTime()]]);
		messageCache.set(message.author.id, messages);
		return;
	}

	const messages = messageCache.get(message.author.id),
		cachedMessage = messages?.get(message.content);
	if (cachedMessage) {
		if (message.createdAt.getTime() - cachedMessage < cooldown) {
			const embed = new Discord.MessageEmbed().setColor('#F36D6B');
			embed.setDescription(warnMessage);
			message.channel.send((mentionUser ? '<@' + message.author.id + '> ⚠' : undefined), embed).then(newMessage => {
				newMessage.delete({ timeout: 5000 });
			});
			message.delete({ reason: 'Doppelte Nachricht' });
			return;
		}
	}
	if (messages) {
		messages.set(message.content, message.createdAt.getTime());
		messageCache.set(message.author.id, messages);
	}
});

process.on('SIGTERM', () => {
	client.destroy();
	process.exit(0);
});

process.on('SIGINT', () => {
	client.destroy();
	process.exit(0);
});

client.login(process.env.TOKEN);
