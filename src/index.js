

// To-do
// Make a good save/load system that allows an agent to come back to a conversation that has since been closed.
// Editing the videoContentDescription on Video 6 once it is unprivatised.

const path = require('path');
const envfile = `${process.cwd()}${path.sep}.env`;
require('dotenv').config({
       path: envfile
});
const ChipChat = require('chipchat');
const log = require('debug')('tourguide')
const get = require('lodash/get');
const incrementor = {
    // This function adds delay to the message to ensure the messages are posted in the right order
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
log(process.env.HOST,process.env.TOKEN)
const errorCatch = (error) => {
   log(error);
}

const nextVideoinPath = (conversation, currentIteration = 0, videoContentDescription, userId, specialMessage) => {
    // This function automatically constructs and sends a message
    const videoArray = [
        "https://www.youtube.com/embed/px-KEHbUrVo", // Video 1
        "https://www.youtube.com/embed/846DWH8soIw", // Video 2
        "https://www.youtube.com/embed/yKyD8VkxbLQ", // Video 3
        "https://www.youtube.com/embed/_IngYmHinUU", // Video 4
        "https://www.youtube.com/embed/KUzVqZjW250", // Video 5
        "https://www.youtube.com/embed/sGVeE46Ar3g", // Video 6
        "https://www.youtube.com/embed/GJGuTAFegVc", // Video 7
        "https://www.youtube.com/embed/XqHwvFCx2tQ", // Video 8
        "https://www.youtube.com/embed/_IQkGaMBVGU", // Video 9
        "https://www.youtube.com/embed/P5hIPjVL1QA", // Video 10
        "https://www.youtube.com/embed/ySs2zriUIIs", // Video 11
        "https://www.youtube.com/embed/seT5DpPcOzo", // Video 12
        "https://www.youtube.com/embed/ZzUP4uxOeh0", // Video 13
        "https://www.youtube.com/embed/iEgnFXG03Yk"  // Video 14
    ]
    bot.users.update(userId, { meta: { hasToured: currentIteration + 'video' }}).catch(errorCatch) // Update the position of the agent in the quiz
    const messages = [
        {
            text: "The next video will show " + videoContentDescription,
            role: 'bot',
            delay: incrementor.set(3)
        },
    ]
    if (specialMessage) { // Adds a second message
        messages.push(
            {
                text: specialMessage,
                role: "bot",
                delay: incrementor.increment(3)
            }
        )
    }
    messages.push( // Puts the messages in an array to be sent in the conversation
        {
            text: videoArray[currentIteration],
            contentType: "text/url",
            delay: incrementor.increment(7),
            actions: [
                {
                    type: "reply",
                    text: "Done",
                    payload: (currentIteration) + "complete"
                }
            ]
        }
    )
    bot.send(conversation.id, messages).catch(errorCatch);
}

// Create a new bot instance
const bot = new ChipChat({
    host: process.env.HOST,
    token: process.env.TOKEN
});

// Crashes the code if no token is found
if (!process.env.TOKEN) {
    throw 'No token found, please define a token with export TOKEN=(Webhook token), or use an .env file.'
}


// Use any REST resource
// bot.users.get(bot.auth.user).then((botUser) => {
// log(`Hello ${botUser.role}`);
//});

// Logs any error produced to the console
bot.on('error', log);

bot.on('user.login', async (user) => {
    const userToCheck = await bot.users.get(get(user, 'data.user.id'))
    const userProgress = get(userToCheck, 'meta.hasToured', 'false')
    log(userProgress)
    if (userProgress === "false") {
        log("Detected a login, user has not toured.")
        const userId = get(user, 'data.user.id');
        if (userId) {
            const userName = get(user, 'data.user.givenName', 'agent');
            let conversation
            const conversationId = get(user, 'data.conversation.id');
            const oldConvFinder = await bot.conversations.list ({ name:'Tour', participants:{ user: userToCheck.id } })
            if (oldConvFinder.length > 0) {
                conversation = oldConvFinder[0]
            } else {
                conversation = await bot.conversations.create(
                    { name: 'Tour', messages: [{ text: "Hey there! I'm Chip, your guide to Chatshipper!" }] }
                )
            }
            await bot.send(conversation.id, {
                type: 'command',
                text: '/assign',
                meta: {
                    "users": [
                        user.data.user.id
                    ]
                }
            })
            if (userProgress === 'true') {
                //  log("Person has toured before.")
                bot.send(conversation.id, [
                    {
                        text: `Hello ${userName}! It seems that you've already taken this tour.`,
                        role: 'bot',
                        delay: incrementor.set(3)
                    },
                    {
                        text:"Would you like to take the tour again?",
                        role: "bot",
                        delay: incrementor.increment(4),
                        actions: [
                            {
                                type: "reply",
                                text: "Yes",
                                payload: "StartTour"
                            },
                            {
                                type: "reply",
                                text: "No",
                                payload: "CancelTour"
                            }
                        ]
                    }
                ]).catch(errorCatch);
            } else if (userProgress === 'false') {
                log("Person hasn't toured")
                bot.send(conversation.id, [
                    {
                        text: `Hello ${userName}! Pleased to meet you!`,
                        role: 'bot',
                        delay: incrementor.set(3)
                    },
                    {
                        text:"Would you like to take the tour now?",
                        role: "bot",
                        delay: incrementor.increment(4),
                        actions: [
                            {
                                type: "reply",
                                text: "Yes",
                                payload: "StartTour"
                            },
                            {
                                type: "reply",
                                text: "No",
                                payload: "CancelTour"
                            }
                        ]
                    }
                ]).catch(errorCatch);
            } else if (userProgress.includes("video") == true) {
                let progressNumber = parseInt(userProgress, 10)
                log(`User has started but not finished a tour. Their position was ${progressNumber}`)
                bot.send(conversation.id, [
                    {
                        text: `Hello ${userName}! It seems you stopped the tour at video ${progressNumber + 1}.`,
                        role: 'bot',
                        delay: incrementor.set(3)
                    },
                    {
                        text:"Would you like to start where you left off or do you want to restart the tour?",
                        role: "bot",
                        delay: incrementor.increment(4),
                        actions: [
                            {
                                type: "reply",
                                text: `Skip to ${progressNumber + 1}`,
                                payload: `${progressNumber - 1}complete`
                            },
                            {
                                type: "reply",
                                text: "Restart the tour",
                                payload: "StartTour"
                            }
                        ]
                    }
                ]).catch(errorCatch);
            } else {
                log("Can't find status")
            }
        }
    } else {
        log("Login detected. User has started or finished tour.")
    }
});


bot.on('message.create.bot.postback.agent', (message, conversation) => {
    log('Processing message', message.text)
    const userId = message.user
    log(`UserId: ${userId}`)
    log("Starting Switch chain")
    switch (message.text) {
        case "StartTour":
            log("Starting Tour")
            bot.users.update(userId, { meta: { hasToured: 'SkippedTour' }}).then((user) => {
                log("User meta hasToured = " + user.meta.hasToured)
                bot.send(conversation.id, [
                    {
                        text: "Great! Then let's get started!",
                        role: 'bot',
                        delay: incrementor.set(3)
                    },
                    {
                        text: "This tour will be done with Youtube videos, which i will send to you one by one.",
                        role: 'bot',
                        delay: incrementor.increment(5)
                    },
                    {
                        text: "Please click the button when you are done watching the video.",
                        role: 'bot',
                        delay: incrementor.increment(4)
                    },
                    {
                        text: "The first video will show you how to accept an incoming chat.",
                        role: 'bot',
                        delay: incrementor.increment(4)
                    },
                    {
                        text: "https://www.youtube.com/embed/px-KEHbUrVo",
                        contentType: "text/url",
                        delay: incrementor.increment(7),
                        actions: [
                            {
                                type: "reply",
                                text: "Done",
                                payload: "0complete"
                            }
                        ]
                    }
                ]).catch(errorCatch);
            }).catch(errorCatch)
            break
        case "CancelTour":
            bot.users.update(userId, { meta: { hasToured: 'false' }}).then((user) => {
                bot.send(conversation.id[
                    {
                        text: "Alright then, you can take the tour at any time! Just come back and type >tour in the command menu if i don't respond.",
                        role: 'bot',
                        delay: incrementor.set(3)
                    },
                    {
                        text: "Have a nice day!",
                        role: 'bot',
                        delay: incrementor.increment(2)
                    },
                    {
                        text: "/leave",
                        type: "command",
                        role: 'bot',
                        delay: incrementor.increment(1)
                    }
                ]).catch(errorCatch);
            }).catch(errorCatch)
            break
        case "0complete":
            nextVideoinPath(conversation, 1, "the different statusses of conversations.", userId, "By the way. You can open the tour menu by using the bot command >tour.")
            break
        case "1complete":
            nextVideoinPath(conversation, 2, "how to edit contact fields in conversations.", userId, "This tour has 14 videos by the way, but it shouldn't take up more than 15 minutes.")
            break
        case "2complete":
            nextVideoinPath(conversation, 3, "how to finish a conversation by making a form.", userId, "Also, if you don't have the time to take this tour now, you can always close this conversation and re-do the tour later.")
            break
        case "3complete":
            nextVideoinPath(conversation, 4, "how to edit your preferences and personal details in Chatshipper.", userId, "Be sure to visit the preferences tab later to select the options that you like best!")
            break
        case "4complete":
            nextVideoinPath(conversation, 5, "... Actually, it won't show anything. The video is still set to private.", userId)
            break
        case "5complete":
            nextVideoinPath(conversation, 6, "how to send files, videos or photos via Chatshipper.", userId, "We're halfway! Keep going!")
            break
        case "6complete":
            nextVideoinPath(conversation, 7, "how to find a contact or conversation with the search bar.", userId)
            break
        case "7complete":
            nextVideoinPath(conversation, 8, "how to forward your conversation to another agent or department.", userId)
            break
        case "8complete":
            nextVideoinPath(conversation, 9, "how to start a chat with one or more colleagues.", userId, "We hit number 10, just 4 more to go!")
            break
        case "9complete":
            nextVideoinPath(conversation, 10, "how to ask a colleague to join your current conversation with a consumer.", userId)
            break
        case "10complete":
            nextVideoinPath(conversation, 11, "how to follow and unfollow conversations.", userId)
            break
        case "11complete":
            nextVideoinPath(conversation, 12, "how to make and use pre-made (canned) responses in conversations.", userId)
            break
        case "12complete":
            nextVideoinPath(conversation, 13, "how to give feedback on the forms that your colleagues made.", userId, "This is the last video, we're almost here!")
            break
        case "13complete":
            bot.users.update(userId, { meta: { hasToured: 'true' }})
            bot.send(conversation.id[
                {
                    text: "Alright, that was the tour! If you ever want to retake the tour, come back and i'll restart the tour for you!",
                    role: 'bot',
                    delay: incrementor.set(3)
                },
                {
                    text: "/leave",
                    type: "command",
                    role: 'bot',
                    delay: incrementor.increment(1)
                }
            ]).catch(errorCatch);
            break
        default:
            log("No recognized message in postback.")
            break
    }
});

bot.on('message.create.agent.command', (message, conversation) => {
    if (message.type === 'command' && message.text === ">tour") {
        const userId = message.user
        bot.users.get(userId).then((user) => {
            const userProgress = get(user, 'meta.hasToured', 'false')
            const progressNumber = parseInt(userProgress, 10)
            if (userProgress.includes("video") === true) {
                conversation.say([
                    {
                        text: "Hey there! I'm Chip the tour guide! Welcome back!",
                        role: 'bot',
                        delay: incrementor.set(2)
                    },
                    {
                        text: "What can i do for you?",
                        role: 'bot',
                        delay: incrementor.increment(3),
                        actions: [
                            {
                                type: "reply",
                                text: `Start a tour`,
                                payload: `StartTour`
                            },
                            {
                                type: "reply",
                                text: "Continue tour",
                                payload: `${(progressNumber - 1)}complete`
                            }
                        ]
                    }
                ]).catch(errorCatch)
            } else if (userProgress.includes("video") === false) {
                conversation.say([
                    {
                        text: "Hey there! I'm Chip the tour guide! Pleased to meet you!",
                        role: 'bot',
                        delay: incrementor.set(2)
                    },
                    {
                        text: "What can i do for you?",
                        role: 'bot',
                        delay: incrementor.increment(3),
                        actions: [
                            {
                                type: "reply",
                                text: `Start a tour`,
                                payload: `StartTour`
                            }
                        ]
                    }
                ]).catch(errorCatch)
            } else if (userProgress === "SkippedTour") {
                conversation.say([
                    {
                        text: "Hey there! I'm Chip the tour guide! Welcome back!",
                        role: 'bot',
                        delay: incrementor.set(2)
                    },
                    {
                        text: "Do you want to do the tour now?",
                        role: 'bot',
                        delay: incrementor.increment(3),
                        actions: [
                            {
                                type: "reply",
                                text: `Start a tour`,
                                payload: `StartTour`
                            }
                        ]
                    }
                ]).catch(errorCatch)
            }
        }).catch(errorCatch);
    }
})

// Start Express.js webhook server to start listening
bot.start();
