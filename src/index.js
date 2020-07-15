

const ChipChat = require('chipchat');
const get = require('lodash/get');
const incrementor = {
    autoDelayTime: 500,
    increment: function (timeToIncrease = 1) {
        this.autoDelayTime += (timeToIncrease * 1000);
        return this.autoDelayTime;
    },
    set: function (timeToSet = 1) {
        this.autoDelayTime = (timeToSet * 1000);
        return this.autoDelayTime;
    }
};


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


bot.on('message.create.agent.postback.agent', (message, conversation) => {
    console.log('Processing message ', message.text)
    if (message.text === "Done") {
        conversation.say([
            {
                text: "Alright, you should know how to accept a conversation now!",
                role: 'bot',
                delay: incrementor.set(1)
            },
            {
                text: "The next video will show the different statusses of a conversation.",
                role: 'bot',
                delay: incrementor.increment(2)
            },
            {
                text: "Please click the button when you are done watching the video.",
                role: 'bot',
                delay: incrementor.increment(1)
            },
            {
                text: "https://www.youtube.com/embed/dQw4w9WgXcQ",
                contentType: "text/url",
                delay: incrementor.increment(6),
                actions: [
                    {
                        type: "reply",
                        text: "You just got Rick rolled!"
                    }
                ]
            }
        ]);
    };
});


bot.on('message.create.agent.postback.agent', (message, conversation) => {
    console.log('Processing message ', message.text)
    if (message.text === "Yes") {
        conversation.say([
            {
                text: "Great! Then let's get started!",
                role: 'bot',
                delay: incrementor.set(2)
            },
            {
                text: "This tour will be done with Youtube videos, which i will send to you one by one.",
                role: 'bot',
                delay: incrementor.increment(2)
            },
            {
                text: "Please click the button when you are done watching the video.",
                role: 'bot',
                delay: incrementor.increment(1)
            },
            {
                text: "The first video will show you how to accept an incoming chat.",
                role: 'bot',
                delay: incrementor.increment(1)
            },
            {
                text: "https://www.youtube.com/embed/px-KEHbUrVo",
                contentType: "text/url",
                delay: incrementor.increment(6),
                actions: [
                    {
                        type: "reply",
                        text: "Done"
                    }
                ]
            }
        ]);
    };
});

bot.on('conversation.create', (message) => {
    console.log("Conversation created!", message);
    const userName = get(message, 'data.user.givenName', 'agent');
    const conversationId = get(message, 'data.conversation.id');
    bot.conversation(conversationId).then(conversation => {
        conversation.say([
            {
                text: `Hello ${userName}! I am Chip, your guide to Chatshipper. Pleased to meet you!`,
                role: 'bot',
                delay: incrementor.increment(2)
            },
            {
                text:"Would you like to take the tour now?",
                role: "bot",
                delay: incrementor.increment(2),
                actions: [
                    {
                        type: "reply",
                        text: "Yes"
                    },
                    {
                        type: "reply",
                        text: "No"
                    }
                ]
            }
        ]);
    });
});

// Start Express.js webhook server to start listening
bot.start();
