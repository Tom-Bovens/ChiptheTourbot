

const ChipChat = require('chipchat');
const get = require('lodash/get');

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
		text: `Echo: ${message.text}`,
		role: 'agent'
	});
});
*/

bot.on('conversation.create', (message) => {
    console.log("Conversation created!", message);
    const userName = get(message, 'data.user.displayName', 'agent');
    const conversationId = get(message, 'data.conversation.id');
    bot.conversation(conversationId).then(conversation => {
        conversation.say([
            {
                text: `Hello ${userName}.`,
                role: 'agent'
            },
            {
                text: `/leave`,
                type: 'command'
            }
        ]);
    });
});

// Start Express.js webhook server to start listening
bot.start();
