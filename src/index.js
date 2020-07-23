

// To-do
// Change the huge else if change to 1 call with objects

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
    conversation.say(messages).catch(errorCatch);
}

const participantsCheck = (conversation) => {
    log(Object.keys(conversation.participants).length + " users in this conversation.")
    return Object.keys(conversation.participants).length
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

bot.on('conversation.create', (message) => {
    //  log("Conversation created!", message);
    const userId = get(message, 'data.user.id');
    if (userId) {
        const userName = get(message, 'data.user.givenName', 'agent');
        const conversationId = get(message, 'data.conversation.id');
        const conversationPromise = bot.conversation(conversationId)
        const userPromise = bot.users.get(userId)
        Promise.all([conversationPromise, userPromise]).then(([conversation, user]) => {
            if (participantsCheck(conversation) <= 2) {
                const userProgress = get(user, 'meta.hasToured', 'false').catch(errorCatch)
                if (userProgress === 'true') {
                    //  log("Person has toured before.")
                    conversation.say([
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
                    conversation.say([
                        {
                            text: `Hello ${userName}! I am Chip, your guide to Chatshipper. Pleased to meet you!`,
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
                    conversation.say([
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
            } else {
                conversation.say([
                    {
                        text: `Hello ${userName}! It seems that you are not the only one in this conversation. Do you want to continue with the tour?`,
                        role: 'bot',
                        delay: incrementor.set(3),
                        actions: [
                            {
                                type: "reply",
                                text: `Yes`,
                                payload: `StartTour`
                            }
                        ]
                    }
                ]).catch(errorCatch);
            }
        }).catch(errorCatch);
    }
});


bot.on('message.create.agent.postback.agent', (message, conversation) => {
    log('Processing message ', message.text)
    const userId = message.user
    log(`UserId: ${userId}`)
    if (participantsCheck(conversation) <= 2) {
        if (message.text === "StartTour") {
            bot.users.update(userId, { meta: { hasToured: '0video' }}).then((user) => {
                log("User meta hasToured = " + user.meta.hasToured)
                conversation.say([
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
        } else if (message.text === "13complete") {
            bot.users.update(userId, { meta: { hasToured: 'true' }})
            conversation.say([
                {
                    text: "Alright, that was the tour! If you ever want to retake the tour, come back and i'll restart the tour for you!",
                    role: 'bot',
                    delay: incrementor.set(3)
                },
            ]).catch(errorCatch);
        } else if (message.text.match(/\d+complete/)) {} {
            bot.users.get(userId).then((user) => {
                const userProgress = get(user, 'meta.hasToured', 'false')
                const iteration = parseInt(userProgress, 10) + 1
                const messages = {
                    0: {
                        videoContents: "the different statusses of conversations."
                    },
                    1: {
                        videoContents: "how to edit contact fields in conversations",
                        specialMessage: "This tour has 14 videos by the way, but it shouldn't take up more than 15 minutes."
                    },
                    2: {
                        videoContents: "how to finish a conversation by making a form.",
                        specialMessage: "Also, if you don't have the time to take this tour now, you can always close this conversation and re-do the tour later."
                    },
                    3: {
                        videoContents: "how to edit your preferences and personal details in Chatshipper.",
                        specialMessage: "Be sure to visit the preferences tab later to select the options that you like best!"
                    },
                    4: {
                        videoContents: "... Actually, it won't show anything. The video is still set to private."
                    },
                    5: {
                        videoContents: "how to send files, videos or photos via Chatshipper.",
                        specialMessage: "We're halfway! Keep going!"
                    },
                    6: {
                        videoContents: "how to find a contact or conversation with the search bar."
                    },
                    7: {
                        videoContents: "how to forward your conversation with the search bar."
                    },
                    8: {
                        videoContents: "how to start a chat with one or more colleagues.",
                        specialMessage: "We hit number 10, just 4 more to go!"
                    },
                    9: {
                        videoContents: "how to ask a colleague to join your conversation with a consumer."
                    },
                    10: {
                        videoContents: "how to follow and unfollow conversations."
                    },
                    11: {
                        videoContents: "how to make and use pre-made (canned) responses in conversations."
                    },
                    12: {
                        videoContents: "how to give feedback on the forms that your colleague made.",
                        specialMessage: "This is the last video, we're almost here!"
                    }
                }
                nextVideoinPath(conversation, iteration, messages[iteration].videoContents, userId, messages[iteration].specialMessage)
            }).catch(errorCatch)
        }
    };
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
                        text: "Hey there! I'm Chip the tour guide! pleased to meet you!",
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
                        text: "Hey there! I'm Chip the tour guide! pleased to meet you!",
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
            }
        }).catch(errorCatch);
    }
})

// Start Express.js webhook server to start listening
bot.start();
