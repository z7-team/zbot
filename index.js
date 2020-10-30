const Discord = require('discord.js');
const admin = require('firebase-admin');
const { prefix, token } = require('./config.json');
const serviceAccount = require('./z7-bot-db-auth.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', async (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
	if (command == 'javascript') {
		message.channel.send('Welcome to zBot! Javascript edition!');
	}
	else if (command == 'escape') {
		message.channel.send('ВЫ ДОЛЖНЫ БЕЖАТЬ ИЗ ТАРЬКА!');
	}
	else if (command == 'members') {
		const onlin = message.guild.members.cache.filter(member => member.presence.status !== 'offline' && !member.bot).size;
		message.channel.send('Total members: ' + message.guild.members.cache.size + '\nTotal members online: ' + onlin);
	}
	else if (command == 'roll') {
		if (!args.length) {
			message.channel.send('Please include one # argument for dice to be rolled.');
			return;
		}
		let msg = '';
		for (let i = 0; i < args[0]; i++) {
			msg += ('[ ' + (Math.floor(Math.random() * 6) + 1) + ' ] ');
		}
		message.channel.send(msg);
	}
	else if (command === 'rank') {
		const usersRef = db.collection(message.guild.name);
		const users = await usersRef.orderBy('karma', 'desc').get();


		let leaderboard = '';
		let place = 1;
		await users.docs.forEach(async user => {
			const userData = user.data();
			message.guild.members.fetch(userData.id).then(guildMember => {
				leaderboard += `${place}. **${guildMember.user.username} :** ${userData.karma}\n`;
				place += 1;
			});
		});

		const embed = new Discord.MessageEmbed()
			.setTitle('Rank Leaderboard')
			.setDescription(leaderboard);


		await message.channel.send(
			embed,
		);
	}
	else if (args[0] == '++' || args[0] == '--') {
		const mention = message.mentions.users.first();
		if (message.author.id == mention.id) {
			message.channel.send('Can\'t give karma to yourself');
		}
		const userRef = db.collection(message.guild.name).doc(mention.id);
		const snapshot = await userRef.get();
		let karma = snapshot.data()['karma'];

		if (karma === undefined) {
			karma = 0;
		}
		else if (args[0] === '++') {
			karma++;
		}
		else if (args[0] === '--') {
			karma--;
		}
		await userRef.set({
			karma,
			id: mention.id.toString(),
		});

		const pointStr = karma === 1 ? 'point' : 'points';
		await message.channel.send(`${mention.username} you now have ${karma} ${pointStr}`);
	}
	else {
		message.channel.send('Not a command. Type zz help for commands.');
	}
});


client.login(token);
