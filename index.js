const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');


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
});


client.login(token);