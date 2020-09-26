// To-do
// Editing the videoContentDescription on Video 6 once it is unprivatised.

const path = require('path');

const envfile = `${process.cwd()}${path.sep}.env`;

require('dotenv').config({
    path: envfile
});
const ChipChat = require('chipchat');

const log = require('debug')('tourguide');

const get = require('lodash/get');

const incrementor = {
    // This function adds delay to the message to ensure the messages are posted in the right order
    autoDelayTime: 500,
    increment(timeToIncrease = 1) {
        this.autoDelayTime += (timeToIncrease * 1000);
        return this.autoDelayTime;
    },
    set(timeToSet = 1) {
        this.autoDelayTime = (timeToSet * 1000);
        return this.autoDelayTime;
    }
};
log(process.env.HOST, process.env.TOKEN);
const errorCatch = (error, line) => {
    log("A promise has errored. You can find it's location in the index.js file with the following trace.", line, error);
};

// Create a new bot instance
const bot = new ChipChat({
    host: process.env.HOST,
    token: process.env.TOKEN
});

const nextVideoinPath = (conv, currentIter = 0, videoContent, userId, specialMessage) => {
    // This function automatically constructs and sends a message
    const videoArray = [
        'https://www.youtube.com/embed/px-KEHbUrVo', // Video 1
        'https://www.youtube.com/embed/846DWH8soIw', // Video 2
        'https://www.youtube.com/embed/yKyD8VkxbLQ', // Video 3
        'https://www.youtube.com/embed/_IngYmHinUU', // Video 4
        'https://www.youtube.com/embed/KUzVqZjW250', // Video 5
        'https://www.youtube.com/embed/sGVeE46Ar3g', // Video 6
        'https://www.youtube.com/embed/GJGuTAFegVc', // Video 7
        'https://www.youtube.com/embed/XqHwvFCx2tQ', // Video 8
        'https://www.youtube.com/embed/_IQkGaMBVGU', // Video 9
        'https://www.youtube.com/embed/P5hIPjVL1QA', // Video 10
        'https://www.youtube.com/embed/ySs2zriUIIs', // Video 11
        'https://www.youtube.com/embed/seT5DpPcOzo', // Video 12
        'https://www.youtube.com/embed/ZzUP4uxOeh0', // Video 13
        'https://www.youtube.com/embed/iEgnFXG03Yk' // Video 14
    ];
    bot.users.update(userId, { meta: { hasToured: `${currentIter}video` } }).catch((err) => { errorCatch(err, console.trace()); });
    const messages = [
        {
            text: `The next video will show ${videoContent}`,
            role: 'bot',
            delay: incrementor.set(3)
        }
    ];
    if (specialMessage) { // Adds a second message
        messages.push(
            {
                text: specialMessage,
                role: 'bot',
                delay: incrementor.increment(3)
            }
        );
    }
    messages.push( // Puts the messages in an array to be sent in the conversation
        {
            text: videoArray[currentIter],
            contentType: 'text/url',
            delay: incrementor.increment(7),
            actions: [
                {
                    type: 'reply',
                    text: 'Done',
                    payload: `${currentIter}complete`
                }
            ]
        }
    );
    bot.send(conv, messages).catch((err) => { errorCatch(err, console.trace()); });
};

// Crashes the code if no token is found
if (!process.env.TOKEN) {
    console.warn('No token found, please define a token with export TOKEN=(Webhook token), or use an .env file. The bot will still work, but nothing will be posted.');
}

// Logs any error produced to the console
bot.on('error', log);

process.on('uncaughtException', (error, origin) => {
    log(error, origin);
});

bot.on('user.login', async (user) => {
    try {
        const userProgress = get(user, 'meta.hasToured', 'false');
        const userId = get(user, 'data.user.id');
        if (!userId) return;
        const userName = get(user, 'data.user.givenName', 'agent');
        let conversation;
        const oldConvFinder = await bot.conversations.list({ name: 'Tour', participants: { user: user.id } });
        if (oldConvFinder.length > 0) {
            conversation = oldConvFinder[0];
        } else {
            conversation = await bot.conversations.create(
                { name: 'Tour', messages: [{ text: "Hey there! I'm Chip, your guide to Chatshipper!" }] }
            ).catch((err) => { errorCatch(err, console.trace()); });
        }
        await bot.send(conversation.id, {
            type: 'command',
            text: '/assign',
            meta: {
                users: [
                    user.data.user.id
                ]
            }
        }).catch((err) => { errorCatch(err, console.trace()); });
        if (userProgress === 'true') {
            bot.send(conversation.id, [
                {
                    text: `Hello ${userName}! It seems that you've already taken this tour.`,
                    role: 'bot',
                    delay: incrementor.set(3)
                },
                {
                    text: 'Would you like to take the tour again?',
                    role: 'bot',
                    delay: incrementor.increment(4),
                    actions: [
                        {
                            type: 'reply',
                            text: 'Yes',
                            payload: 'StartTour'
                        },
                        {
                            type: 'reply',
                            text: 'No',
                            payload: 'CancelTour'
                        }
                    ]
                }
            ]).catch((err) => { errorCatch(err, console.trace()); });
        } else if (userProgress === 'false') {
            bot.send(conversation.id, [
                {
                    text: `Hello ${userName}! Pleased to meet you!`,
                    role: 'bot',
                    delay: incrementor.set(3)
                },
                {
                    text: 'Would you like to take the tour now?',
                    role: 'bot',
                    delay: incrementor.increment(4),
                    actions: [
                        {
                            type: 'reply',
                            text: 'Yes',
                            payload: 'StartTour'
                        },
                        {
                            type: 'reply',
                            text: 'No',
                            payload: 'CancelTour'
                        }
                    ]
                }
            ]).catch((err) => { errorCatch(err, console.trace()); });
        } else if (userProgress.includes('video') === true) {
            const actualNumber = Number(userProgress.replace(/[^0-9]/g, ''));
            bot.send(conversation.id, [
                {
                    text: `Hello ${userName}! It seems you stopped the tour at video ${actualNumber + 1}.`,
                    role: 'bot',
                    delay: incrementor.set(3)
                },
                {
                    text: 'Would you like to start where you left off or do you want to restart the tour?',
                    role: 'bot',
                    delay: incrementor.increment(4),
                    actions: [
                        {
                            type: 'reply',
                            text: `Skip to ${actualNumber + 1}`,
                            payload: `${actualNumber - 1}complete`
                        },
                        {
                            type: 'reply',
                            text: 'Restart the tour',
                            payload: 'StartTour'
                        }
                    ]
                }
            ]).catch((err) => { errorCatch(err, console.trace()); });
        } else {
            log("Can't find status");
        }
    } catch (e) {
        errorCatch(e, console.trace());
    }
});

bot.on('message.create.*.postback.agent', async (message, conversation) => {
    switch (message.text) {
        case 'StartTour':
            bot.users.update(message.user, { meta: { hasToured: 'SkippedTour' } }).catch((err) => { errorCatch(err, console.trace()); });
            bot.send(conversation.id, [
                {
                    text: "Great! Then let's get started!",
                    role: 'bot',
                    delay: incrementor.set(3)
                },
                {
                    text: 'This tour will be done with Youtube videos, which i will send to you one by one.',
                    role: 'bot',
                    delay: incrementor.increment(5)
                },
                {
                    text: 'Please click the button when you are done watching the video.',
                    role: 'bot',
                    delay: incrementor.increment(4)
                },
                {
                    text: 'The first video will show you how to accept an incoming chat.',
                    role: 'bot',
                    delay: incrementor.increment(4)
                },
                {
                    text: 'https://www.youtube.com/embed/px-KEHbUrVo',
                    contentType: 'text/url',
                    delay: incrementor.increment(7),
                    actions: [
                        {
                            type: 'reply',
                            text: 'Done',
                            payload: '0complete'
                        }
                    ]
                }
            ]).catch((err) => { errorCatch(err, console.trace()); });
            break;
        case 'CancelTour':
            bot.users.update(message.user, { meta: { hasToured: 'false' } }).catch((err) => { errorCatch(err, console.trace()); });
            bot.send(conversation.id, [
                {
                    text: "Alright then, you can take the tour at any time! Just come back and type >tour in the command menu if i don't respond.",
                    role: 'bot',
                    delay: incrementor.set(3)
                },
                {
                    text: 'Have a nice day!',
                    role: 'bot',
                    delay: incrementor.increment(2)
                },
                {
                    text: '/leave',
                    type: 'command',
                    role: 'bot',
                    delay: incrementor.increment(1)
                }
            ]).catch((err) => { errorCatch(err, console.trace()); });
            break;
        case '0complete':
            nextVideoinPath(conversation.id, 1, 'the different statusses of conversations.', message.user, 'By the way. You can open the tour menu by starting a new conversation with me via the dashboard..');
            break;
        case '1complete':
            nextVideoinPath(conversation.id, 2, 'how to edit contact fields in conversations.', message.user, "This tour has 14 videos by the way, but it shouldn't take up more than 15 minutes.");
            break;
        case '2complete':
            nextVideoinPath(conversation.id, 3, 'how to finish a conversation by making a form.', message.user, "Also, if you don't have the time to take this tour now, you can always close this conversation and re-do the tour later.");
            break;
        case '3complete':
            nextVideoinPath(conversation.id, 4, 'how to edit your preferences and personal details in Chatshipper.', message.user, 'Be sure to visit the preferences tab later to select the options that you like best!');
            break;
        case '4complete':
            nextVideoinPath(conversation.id, 5, "... Actually, it won't show anything. The video is still set to private.", message.user);
            break;
        case '5complete':
            nextVideoinPath(conversation.id, 6, 'how to send files, videos or photos via Chatshipper.', message.user, "We're halfway! Keep going!");
            break;
        case '6complete':
            nextVideoinPath(conversation.id, 7, 'how to find a contact or conversation with the search bar.', message.user);
            break;
        case '7complete':
            nextVideoinPath(conversation.id, 8, 'how to forward your conversation to another agent or department.', message.user);
            break;
        case '8complete':
            nextVideoinPath(conversation.id, 9, 'how to start a chat with one or more colleagues.', message.user, 'We hit number 10, just 4 more to go!');
            break;
        case '9complete':
            nextVideoinPath(conversation.id, 10, 'how to ask a colleague to join your current conversation with a consumer.', message.user);
            break;
        case '10complete':
            nextVideoinPath(conversation.id, 11, 'how to follow and unfollow conversations.', message.user);
            break;
        case '11complete':
            nextVideoinPath(conversation.id, 12, 'how to make and use pre-made (canned) responses in conversations.', message.user);
            break;
        case '12complete':
            nextVideoinPath(conversation.id, 13, 'how to give feedback on the forms that your colleagues made.', message.user, "This is the last video, we're almost here!");
            break;
        case '13complete':
            bot.users.update(message.user, { meta: { hasToured: 'true' } }).catch((err) => { errorCatch(err, console.trace()); });
            bot.send(conversation.id, [
                {
                    text: "Good job, we've finished the Tour! I just have one more thing to show you.",
                    role: 'bot',
                    delay: incrementor.set(2)
                },
                {
                    text: 'Chatshipper has a nice feature called result commenting, which can be used to leave feedback on forms your colleagues made! Let me give you an example...',
                    role: 'bot',
                    delay: incrementor.increment(4)
                },
                {
                    contentType: 'image/png',
                    text: 'https://cht.onl/a/x7zEKfz3X/commentonform.gif',
                    role: 'bot',
                    delay: incrementor.increment(3),
                    actions: [
                        {
                            type: 'reply',
                            text: 'Ok!',
                            payload: '14complete'
                        }
                    ]
                }
            ]).catch((err) => { errorCatch(err, console.trace()); });
            break;
        case '14complete':
            bot.users.update(message.user, { meta: { hasToured: 'true' } }).catch((err) => { errorCatch(err, console.trace()); });
            bot.send(conversation.id, [
                {
                    text: 'Nice, you finished the tour!',
                    role: 'bot',
                    delay: incrementor.set(2)
                },
                {
                    text: 'Start a new conversation with me if you want to take it again. Goodbye!',
                    role: 'bot',
                    delay: incrementor.increment(3)
                },
                {
                    text: '/leave',
                    type: 'command'
                }
            ]).catch((err) => { errorCatch(err, console.trace()); });
            break;
        default:
            log('No recognized message in postback.');
            break;
    }
});

bot.on('assign', (message, conversation) => {
    if (message.type === 'command' && message.text === '/assign') {
        const userId = message.user;
        bot.users.get(userId).then((user) => {
            const userProgress = get(user, 'meta.hasToured', 'false');
            const actualNumber = Number(userProgress.replace(/[^0-9]/g, ''));
            if (userProgress.includes('video') === true) {
                bot.send(conversation.id, [
                    {
                        text: "Hey there! I'm Chip the tour guide! Welcome back!",
                        role: 'bot',
                        delay: incrementor.set(2)
                    },
                    {
                        text: 'What can i do for you?',
                        role: 'bot',
                        delay: incrementor.increment(3),
                        actions: [
                            {
                                type: 'reply',
                                text: 'Start a tour',
                                payload: 'StartTour'
                            },
                            {
                                type: 'reply',
                                text: 'Continue tour',
                                payload: `${(actualNumber - 1)}complete`
                            }
                        ]
                    }
                ]).catch((err) => { errorCatch(err, console.trace()); });
            } else if (userProgress.includes('video') === false) {
                bot.send(conversation.id, [
                    {
                        text: "Hey there! I'm Chip the tour guide! Pleased to meet you!",
                        role: 'bot',
                        delay: incrementor.set(2)
                    },
                    {
                        text: 'What can i do for you?',
                        role: 'bot',
                        delay: incrementor.increment(3),
                        actions: [
                            {
                                type: 'reply',
                                text: 'Start a tour',
                                payload: 'StartTour'
                            }
                        ]
                    }
                ]).catch((err) => { errorCatch(err, console.trace()); });
            } else if (userProgress === 'SkippedTour') {
                bot.send(conversation.id, [
                    {
                        text: "Hey there! I'm Chip the tour guide! Welcome back!",
                        role: 'bot',
                        delay: incrementor.set(2)
                    },
                    {
                        text: 'Do you want to do the tour now?',
                        role: 'bot',
                        delay: incrementor.increment(3),
                        actions: [
                            {
                                type: 'reply',
                                text: 'Start a tour',
                                payload: 'StartTour'
                            }
                        ]
                    }
                ]).catch((err) => { errorCatch(err, console.trace()); });
            }
        });
    }
});

// Start Express.js webhook server to start listening
bot.start();
