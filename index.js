// Z7 Discord Bot
// index.js
const Discord = require('discord.js');
const admin = require('firebase-admin');
const { prefix, token, rsecret, rid, reduser, rpass, openaikey } = require('./config.json');
const snoowrap = require('snoowrap');
const fetch = require('node-fetch');
const serviceAccount = require('./z7-bot-db-auth.json');
const ytdl = require("ytdl-core-discord");
const OpenAI = require("openai");

// firebase db
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// OpenAI Config
const configuration = new OpenAI.Configuration({
	organization: "org-pUGGBzLbAkPSvpFGsmT718re",
	apiKey: openaikey,
});
const openai = new OpenAI.OpenAIApi(configuration);

// initialize reddit api
const r = new snoowrap({
	userAgent: 'zbot reddit',
	clientId: rid,
	clientSecret: rsecret,
	username: reduser,
	password: rpass,
});

// initialize discord client
const client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

// welcome message
/*client.on('guildMemberAdd', member =>{
		member.guild.channels.get('channelID').send('Welcome ' + member.nickname + ' to the Z7 army!');
});*/

// commands
client.on('message', async (message) => {
	if (message.content.toLowerCase() == 'm o n k e') {
		message.channel.send('Reject modernism, embrace M O N K E');
	}
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
	/*else if (command == 'blackdice'){
			const embed = new Discord.MessageEmbed();
			var gameOver = false;
			var ucount = 0;
			var ecount = 0;
			var it = 0
			while(!gameOver){
					if (it === 0){

					}
			}
	}*/
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
		if (message.author.id == mention.id && args[0] === '++') {
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
		if (!data) {
			await userRef.set({
				karma,
				id: mention.id.toString(),
			});
		}
		else {
			await userRef.update({ karma });
		}

		const pointStr = karma === 1 ? 'point' : 'points';
		await message.channel.send(`${mention.username} you now have ${karma} ${pointStr}`);
	}
	else if (command === 'entrance') {
		const userRef = db.collection(message.guild.name).doc(message.author.id);
		const snapshot = await userRef.get();
		const data = snapshot.data();

		if (!data) {
			await userRef.set({
				id: message.author.id.toString(),
			});
		}

		if (args[0] === "off") {
			await userRef.update({ entrance: false });
			message.channel.send("You turned off your entrance music");
			return;
		}

		if (args[0] === "on") {
			await userRef.update({ entrance: true });
			message.channel.send("You turned on your entrance music");
			return;
		}

		let entranceUrl = args[0] || "";
		await userRef.update({ entranceUrl, entrance: true });
		message.channel.send("New entrance added and enable");
	}
	else if (command == 'qod') {
		const url = 'https://quotes.rest/qod';
		await fetch(url)
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error(response);
			})
			.then((response) => {
				console.log(response);
				const quote = response.contents.quotes[0].quote;
				const author = response.contents.quotes[0].author;
				const embed = new Discord.MessageEmbed()
					.setColor('EBBE08')
					.setTitle('Quote of the day:')
					.setDescription('\"' + quote + '\"\n—' + author);
				message.channel.send(embed);
			})
			.catch(console.error);
	}
	else if (command == 'urban') {
		const query = args.join(' ')
		const queryURIEncoded = encodeURIComponent(query)
		const url = `https://api.urbandictionary.com/v0/define?term=${queryURIEncoded}`
		await fetch(url)
			.then((response) => {
				if (response.ok) {
					return response.json()
				}
				throw new Error(response)
			})
			.then((response) => {
				// used for formatting definitions and examples to match urban dictionary format
				function replacer(match, p1, p2, p3, offset, string) {
					// p1 is nondigits, p2 digits, and p3 non-alphanumerics
					const term = match.slice(1, -1)
					const termURIEncoded = encodeURIComponent(term)
					return `[${term}](https://www.urbandictionary.com/define.php?term=${termURIEncoded})`;
				}

				// check if no results were found
				const isEmpty = response.list.length === 0
				if (isEmpty) {
					message.channel.send(`No results found for "${query}"`)
					return
				}

				// construct the discord message embed
				const topResult = response.list.reduce((prev, current) => (prev.thumbs_up > current.thumbs_up) ? prev : current)
				const definition = topResult.definition
				const formattedDefinition = definition.replace(/\[(.*?)\]/g, replacer)
				const example = topResult.example
				const formattedExample = example.replace(/\[(.*?)\]/g, replacer)
				const link = topResult.permalink

				const title = topResult.word
				const description = formattedDefinition

				const embed = new Discord.MessageEmbed()
					.setColor('#efff00')
					.setTitle(title)
					.setDescription(description)
					.setURL(link)

				if (formattedExample) {
					embed.addFields({
						name: 'examples',
						value: formattedExample
					})
				}

				message.channel.send(embed)
			})
			.catch(console.error);
	}
	else if (command == 'news') {
		let bestStoryId;
		if (args[0]) {
			let query = encodeURIComponent([...args]);
			await fetch(
				`https://hn.algolia.com/api/v1/search?query=${query}&hitsPerPage=2&page=0&tags=story`
			)
				.then((response) => {
					if (response.ok) {
						return response.json();
					}
					throw new Error(response);
				})
				.then((response) => {
					bestStoryId = response.hits[0].objectID || response.hits[0].story_id;
				})
				.catch(console.error);
		} else {
			await fetch('https://hacker-news.firebaseio.com/v0/beststories.json')
				.then((response) => {
					if (response.ok) {
						return response.json();
					}
					throw new Error(response);
				})
				.then((response) => {
					bestStoryId = response[0];
				})
				.catch(console.error);
		}
		await fetch(
			`https://hacker-news.firebaseio.com/v0/item/${bestStoryId}.json`)
			.then((response) => {
				if (response.ok) {
					return response.json();
				}
				throw new Error(response);
			})
			.then((response) => {
				const embed = new Discord.MessageEmbed()
					.setTitle(response.title)
					.setURL(response.url)
					.addFields({ name: 'HackerNews Score', value: response.score });
				message.channel.send(embed);
			})
			.catch(console.error);
	}
	else if (command == "c") {
		if (args[0]) {
			const postData = {
				model: "text-davinci-003",
				prompt: args.join(' '),
				temperature: 0,
				max_tokens: 1000
			};
			console.log(JSON.stringify(postData));
			fetch('https://api.openai.com/v1/completions', {
				method: 'POST',
				body: JSON.stringify(postData),
				headers: {
					Authorization: `Bearer ${openaikey}`,
					'content-type': 'application/json'
				}
			})
				.then(data => data.json())
				.then(response => {
					console.log(response);
					message.channel.send(response.choices[0].text);
				})
				.catch(console.error);
		}
	}
	else if (command == 'top') {
		message.channel.send('https://www.youtube.com/watch?v=Vppbdf-qtGU');
	}
	else if (command === 'move') {
		const channelCache = message.guild.channels.cache;
		const channelName = message.content.match(/"(.*?)"/);
		let channelId;
		for (const key of channelCache.keys()) {
			const channel = channelCache.get(key);
			if (channelName[1] === channel.name) {
				channelId = channel.id;
			}
		}
		message.mentions.members.forEach(member => {
			const voiceState = new Discord.VoiceState(message.guild, { user_id: member.id });
			voiceState.setChannel(channelId, null);
		});
	}
	else if (command == 'reddit') {
		if (!args.length) {
			await r.getSubreddit('memes').getTop({ time: 'day', limit: 1 }).map(post => {
				message.channel.send(post.url);
			});
		}
		else if (args.length == 1) {
			await r.getSubreddit(args[0]).getTop({ time: 'day', limit: 1 }).map(post => {
				message.channel.send(post.url);
			});
		}
		else if (args.length == 2 && args[1].length == 1) {
			await r.getSubreddit(args[0]).getTop({ time: 'day', limit: parseInt(args[1]) }).map(post => {
				// for (var i = 0; i < parseInt(args[1]); i++) {
				//      message.channel.send(post[i].url);
				// }
				message.channel.send(post.url);
			});
		}
		else {
			message.channel.send('Please check your arguments and try again.');
		}
	}
	else if (command == 'splou') {
		const date = new Date();
		const d = new Date(
			date.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
		);
		if (d.getHours() >= 0 && d.getHours() < 2) {
			message.channel.send('It is time to splou.');
		}
		else {
			message.channel.send('It is not time to splou.');
		}
	}
	// else if (command == 'play'){
	//      const url = args[0];
	//      let userChannel = message.member.voice.channel;

	//      if (!args.length){
	//              message.channel.send('Please provide a song link.');
	//      }
	//      else{
	//              if (!ytdl.validateURL(url)){
	//              message.channel.send('Must provide a YouTube link.');
	//              }
	//      }

	//      if (url && ytdl.validateURL(url)) {
	//              userChannel
	//                      .join()
	//                      .then((connection) => {
	//                              play(connection, url);
	//                      })
	//                      .catch((reject) => {
	//                              console.error(reject);
	//                      });
	//      }
	// }
	else if (command == 'poll') {
		const pollArgs = message.content.match(/\[.*?\]/g);
		const options = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
		const pollQuestion = pollArgs.shift();
		let pollString = '';
		if (pollArgs.length > 10) {
			message.channel.send('***You\'ve added too many choices, the limit is 10***');
			return;
		}
		if (pollArgs.length === 0) {
			message.channel.send('***Please add choices***');
			return;
		}
		pollArgs.forEach((choice, index) => {
			pollString += `${options[index]}: ${choice}\n\n`;
		});

		const embed = new Discord.MessageEmbed()
			.setTitle(pollQuestion.replace(/[\[\]']+/g, ''))
			.setDescription(pollString.replace(/[\[\]']+/g, ''));
		message.channel.send(embed).then(r => {
			for (let i = 0; i < pollArgs.length; i++) {
				r.react(options[i]);
			}
		});
	}
	else {
		const embed = new Discord.MessageEmbed()
			.setTitle('Available Commands')
			.setDescription('\n\tzz javascript: Welcome message.' +
				'\n\tzz members: Displays total members and total members online.' +
				'\n\tzz roll [n]: Rolls n dice. Leave blank for 1.' +
				'\n\tzz escape: YOU MUST ESCAPE FROM THE TARKOV!' +
				'\n\tzz rank: Displays karma leaderboard for server.' +
				'\n\tzz @member ++: Add karma to user. Cannot add karma to yourself.' +
				'\n\tzz @member --: Subtract karma from user.' +
				'\n\tzz top: Danna dan-dan dan-dan dan-nana-nan.' +
				'\n\tzz reddit [subreddit] [n]: Gets n top posts from subreddit for the day.' +
				'\n\tzz splou: Tryna splou?' +
				'\n\tzz poll: Create a poll in the format \'zz poll "question" "choice1" "choice2"\'' +
				'\n\tzz news [query]: Get current top HackerNews articles.' +
				'\n\tzz entrance [on, off, youtubeURL]: When you want to join a voice channel with a bang' +
				'\n\tzz qod: Gets quote of the day.' +
				'\n\tzz c: Ask ChatGPT.' +
				'\n\tzz help: Displays commands.');
		message.channel.send(embed);
	}
});

client.on("voiceStateUpdate", async (oldState, newState) => {
	const newUserChannel = newState.channel;
	const oldUserChannel = oldState.channel;

	if (oldUserChannel == undefined && newUserChannel !== undefined) {
		const userRef = db.collection(newState.guild.name).doc(newState.member.id);
		const snapshot = await userRef.get();
		const data = snapshot.data();
		const url = data && data.entranceUrl;
		if (url && ytdl.validateURL(url) && data.entrance) {
			newUserChannel
				.join()
				.then((connection) => {
					play(connection, url);
				})
				.catch((reject) => {
					console.error(reject);
				});
		}
	}
});

async function play(connection, url) {
	const seconds = new URL(url).searchParams.get('t') || 0;
	const milliseconds = Number(seconds) * 1000;
	connection.play(await ytdl(url, { begin: milliseconds }).catch(), {
		type: "opus",
	});
}

client.login(token);
