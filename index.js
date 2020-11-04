const Discord = require('discord.js');
const admin = require('firebase-admin');
const { prefix, token, rsecret, rid, reduser, rpass } = require('./config.json');
var snoowrap = require('snoowrap');
const serviceAccount = require('./z7-bot-db-auth.json');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const r = new snoowrap({
	userAgent: 'zbot reddit',
	clientId: rid,
	clientSecret: rsecret,
	username: reduser,
	password: rpass,
});

const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', async (message) => {
	if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;
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
			message.channel.send('[ ' + (Math.floor(Math.random() * 6) + 1) + ' ] ');
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
			return;
		}
		const userRef = db.collection(message.guild.name).doc(mention.id);
		const snapshot = await userRef.get();
		const data = snapshot.data();
		let karma = data && data.karma || 0;

		if (args[0] === '++') {
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
	else if (command == 'top') {
		message.channel.send('https://www.youtube.com/watch?v=Vppbdf-qtGU');
	}
	else if (command == 'reddit') {
		if (!args.length) {
			await r.getSubreddit('memes').getTop({ time: 'day', limit: 1 }).map(post =>{
				message.channel.send(post.url);
			});
		}
		else if (args.length == 1) {
			await r.getSubreddit(args[0]).getTop({ time: 'day', limit: 1 }).map(post=>{
				message.channel.send(post.url);
			});
		}
		else if (args.length == 2 && args[1].length == 1) {
			await r.getSubreddit(args[0]).getTop({ time:'day', limit: parseInt(args[1]) }).map(post=>{
				// for (var i = 0; i < parseInt(args[1]); i++) {
				// 	message.channel.send(post[i].url);
				// }
				message.channel.send(post.url);
			});
		}
		else{
			message.channel.send('Please check your arguments and try again.');
		}
	}
	else if (command == 'splou') {
		var d = new Date();
		if (d.getHours == 0) {
			message.channel.send('It is time to splou.');
		}
		else{
			message.channel.send('It is not time to splou.');
		}
	}
	else {
		message.channel.send('Available Commands: '
		+ '\n\tzz javascript: Welcome message.'
		+ '\n\tzz members: Displays total members and total members online.'
		+ '\n\tzz roll [n]: Rolls n dice. Leave blank for 1.'
		+ '\n\tzz escape: YOU MUST ESCAPE FROM THE TARKOV!'
		+ '\n\tzz rank: Displays karma leaderboard for server.'
		+ '\n\tzz @member ++: Add karma to user. Cannot add karma to yourself.'
		+ '\n\tzz @member --: Subtract karma from user.'
		+ '\n\tzz top: Danna dan-dan dan-dan dan-nana-nan.'
		+ '\n\tzz reddit [subreddit] [n]: Gets n top posts from subreddit for the day.'
		+ '\n\tzz splou: Tryna splou?'
		+ '\n\tzz help: Displays commands.');
	}
});


client.login(token);
