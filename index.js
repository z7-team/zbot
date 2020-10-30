const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
var snoowrap = require('snoowrap');


client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', message =>{
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
	else if (command == 'top') {
		message.channel.send('https://www.youtube.com/watch?v=Vppbdf-qtGU');
	}
	else {
		message.channel.send('Not a command. Type zz help for commands.');
	}
});


client.login(token);