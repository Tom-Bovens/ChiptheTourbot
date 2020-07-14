

const ChipChat = require('chipchat');

// Create a new bot instance
const bot = new ChipChat({
	host: "https://development-api.chatshipper.com",
	token: process.env.TOKEN
});


if (!process.env.TOKEN) {
    throw 'No token found, please define a token with export TOKEN=(Webhook token).'
}

// Use any REST resource
// bot.users.get(bot.auth.user).then((botUser) => {
// console.log(`Hello ${botUser.role}`);
//});

bot.on('error', console.log);

/*
bot.on('message.create.contact.chat', (message, conversation) => {
	console.log('Processing message ', message.text)
	conversation.say({
		text:`Echo: ${message.text}`,
		role:'agent'
	});
});
*/
:
bot.on('conversation.create', (message, conversation) => {
    console.log("Conversation created!", message)
});

// Start Express.js webhook server to start listening
bot.start();
