require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const TOKEN = process.env.DISCORD_TOKEN;

client.once('ready', () => {
    console.log('Ready!');
});


client.on('message', message =>{
    if (message.content == 'zz javascript'){
        message.channel.send('Welcome to zBot! Javascript edition!');
    }
    else if (message.content == 'zz escape'){
        message.channel.send('ВЫ ДОЛЖНЫ БЕЖАТЬ ИЗ ТАРЬКА!')
    }
})

client.login('NzY4MjI2MDMxNzM1MDEzMzg3.X49YPg.hUNlsdHm3yIn5AuwKuG3Z05eLRw')