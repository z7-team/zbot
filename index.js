const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');


client.once('ready', () => {
	console.log('Ready!');
});


client.on('message', message =>{
	if (message.content.startsWith(prefix + 'javascript')) {
		message.channel.send('Welcome to zBot! Javascript edition!');
	}
	else if (message.content.startsWith(prefix + 'escape')) {
		message.channel.send('ВЫ ДОЛЖНЫ БЕЖАТЬ ИЗ ТАРЬКА!');
	}
});


client.login(token);