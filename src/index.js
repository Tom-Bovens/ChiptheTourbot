

// To-do

const ChipChat = require('chipchat');
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

function nextVideoinPath(conversation, currentIteration = 0, videoContentDescription, userId, specialMessage) {
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
    bot.users.update(userId, { meta: { hasToured: currentIteration + 'video' }}) // Update the position of the agent in the quiz
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
            text: videoArray[(currentIteration)],
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
    conversation.say(messages);
}

function participantsCheck(conversation) {
    console.log(Object.keys(conversation.participants).length + " users in this conversation.")
    return Object.keys(conversation.participants).length
}

// Create a new bot instance
const bot = new ChipChat({
    host: "https://development-api.chatshipper.com",
    token: process.env.TOKEN
});

// Crashes the code if no token is found
if (!process.env.TOKEN) {
    throw 'No token found, please define a token with export TOKEN=(Webhook token).'
}

// Use any REST resource
// bot.users.get(bot.auth.user).then((botUser) => {
// console.log(`Hello ${botUser.role}`);
//});

// Logs any error produced to the console
bot.on('error', console.log);

bot.on('conversation.create', (message) => {
    console.log("Conversation created!", message);
    const userId = get(message, 'data.user.id');
    if (userId) {
        const userName = get(message, 'data.user.givenName', 'agent');
        const conversationId = get(message, 'data.conversation.id');
        bot.conversation(conversationId).then(conversation => {
            bot.users.get(userId).then((user) => {
                if (participantsCheck(conversation) <= 2) {
                    const userProgress = get(user, 'meta.hasToured', 'false')
                    if (userProgress === 'true') {
                        console.log("Person has toured before.")
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
                        ]);
                    } else if (userProgress === 'false') {
                        console.log("Person hasn't toured")
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
                        ]);
                    } else if (userProgress.includes("video") == true) {
                        let progressNumber = parseInt(userProgress, 10)
                        console.log(`User has started but not finished a tour. Their position was ${progressNumber}`)
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
                        ]);
                    } else {
                        console.log("Can't find status")
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
                    ]);

                }
            });
        });
    }
});


bot.on('message.create.agent.postback.agent', (message, conversation) => {
    console.log('Processing message ', message.text)
    const userId = message.user
    console.log(userId)
    if (participantsCheck(conversation) <= 2) {
        if (message.text === "StartTour") {
            const userId = message.user
            bot.users.update(userId, { meta: { hasToured: '0video' }}).then((user) => {
                console.log("User meta hasToured = " + user.meta.hasToured)
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
                ]);
            })
        } else if (message.text === "ResetProgress") {
            bot.users.get(userId).then((user) => {
                const userId = message.user
                const userProgress = get(user, 'meta.hasToured', 'false')
                let progressNumber = parseInt(userProgress, 10)
                if (userProgress === false) {
                    conversation.say([
                        {
                            text: "You don't have any progress in the tour.",
                            role: 'bot',
                            delay: incrementor.set(3)
                        }
                    ]);
                } else if (message.text === "true") {
                    bot.users.update(userId, { meta: { hasToured: 'false' }}).then((user) => {
                        conversation.say([
                            {
                                text: "You have finished the tour, your progress has been reset!",
                                role: 'bot',
                                delay: incrementor.set(3)
                            }
                        ]);
                    })
                } else if (userProgress.includes("video") == true) {
                    bot.users.update(userId, { meta: { hasToured: 'false' }}).then((user) => {
                        conversation.say([
                            {
                                text: `You started but haven't finished the tour. you reached video ${(progressNumber + 1)}. Your progress has been reset!`,
                                role: 'bot',
                                delay: incrementor.set(3)
                            }
                        ]);
                    })
                }
            })
        } else if (message.text === "0complete") {
            const userId = message.user
            nextVideoinPath(conversation, 1, "the different statusses of conversations.", userId)
        } else if (message.text === "1complete") {
            const userId = message.user
            nextVideoinPath(conversation, 2, "how to edit contact fields in conversations.", userId, "This tour has 14 videos by the way, but it shouldn't take up more than 15 minutes.")
        } else if (message.text === "2complete") {
            const userId = message.user
            nextVideoinPath(conversation, 3, "how to finish a conversation by making a form.", userId, "Also, if you don't have the time to take this tour now, you can always close this conversation and re-do the tour later.")
        } else if (message.text === "3complete") {
            const userId = message.user
            nextVideoinPath(conversation, 4, "how to edit your preferences and personal details in Chatshipper.", userId, "Be sure to visit the preferences tab later to select the options that you like best!")
        } else if (message.text === "4complete") {
            const userId = message.user
            nextVideoinPath(conversation, 5, "... Actually, it won't show anything. The video is still set to private.", userId)
        } else if (message.text === "5complete") {
            const userId = message.user
            nextVideoinPath(conversation, 6, "how to send files, videos or photos via Chatshipper.", userId, "We're halfway! Keep going!")
        } else if (message.text === "6complete") {
            const userId = message.user
            nextVideoinPath(conversation, 7, "how to find a contact or conversation with the search bar.", userId)
        } else if (message.text === "7complete") {
            const userId = message.user
            nextVideoinPath(conversation, 8, "how to forward your conversation to another agent or department.", userId)
        } else if (message.text === "8complete") {
            const userId = message.user
            nextVideoinPath(conversation, 9, "how to start a chat with one or more colleagues.", userId, "We hit number 10, just 4 more to go!")
        } else if (message.text === "9complete") {
            const userId = message.user
            nextVideoinPath(conversation, 10, "how to ask a colleague to join your current conversation with a consumer.", userId)
        } else if (message.text === "10complete") {
            const userId = message.user
            nextVideoinPath(conversation, 11, "how to follow and unfollow conversations.", userId)
        } else if (message.text === "11complete") {
            const userId = message.user
            nextVideoinPath(conversation, 12, "how to make and use pre-made (canned) responses in conversations.", userId)
        } else if (message.text === "12complete") {
            const userId = message.user
            nextVideoinPath(conversation, 13, "how to give feedback on the forms that your colleagues made.", userId, "This is the last video, we're almost here!")
        }  else if (message.text === "13complete") {
            const userId = message.user
            bot.users.update(userId, { meta: { hasToured: 'true' }})
            conversation.say([
                {
                    text: "Alright, that was the tour! If you ever want to retake the tour, come back and i'll restart the tour for you!",
                    role: 'bot',
                    delay: incrementor.set(3)
                },
            ]);
        }
    };
});

bot.on('message.create.agent.command', (message, conversation) => {
    if (message.type === 'command' && message.text === ">tour") {
        const userId = message.user
        const promise = bot.users.get(userId).then((user) => {
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
                ])
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
                ])
            }
        });
    }
})

    /*
promise.catch((error) => {
    console.log(error)
    conversation.say([
        {
            text: "Hey there! I'm Chip the tour guide! Something went wrong while trying to get your progress. If you want to continue with your tour, please run the >tour command again. If you want to restart your tour, just press the button.",
            role: 'bot',
            delay: incrementor.set(2),
            actions: [
                {
                    type: "reply",
                    text: `Start a tour`,
                    payload: `StartTour`
                }
            ]
        },
    ])
})
    */
// Start Express.js webhook server to start listening
bot.start();
