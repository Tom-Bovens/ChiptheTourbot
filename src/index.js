

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

function nextVideoinPath(conversation, currentIteration = 0, videoContentDescription, specialMessage = "none") {
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
    conversation.say([
        {
            text: "The next video will show " + videoContentDescription,
            role: 'bot',
            delay: incrementor.set(3)
        }
    ])
    if (specialmessage === "none") {
        conversation.say(
            {
                text: specialMessage,
                role: "bot",
                delay: incrementor.increment(3)
            }
        )}
    conversation.say([
        {
            text: videoArray[(currentIteration - 1)],
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
    ])

}


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

bot.on('conversation.create', (message) => {
    console.log("Conversation created!", message);
    const userName = get(message, 'data.user.givenName', 'agent');
    const conversationId = get(message, 'data.conversation.id');
    bot.conversation(conversationId).then(conversation => {
        conversation.say([
            {
                text: `Hello ${userName}! I am Chip, your guide to Chatshipper. Pleased to meet you!`,
                role: 'bot',
                delay: incrementor.increment(3)
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
    });
});


bot.on('message.create.agent.postback.agent', (message, conversation) => {
    console.log('Processing message ', message.text)
    if (message.text === "StartTour") {
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
                        payload: "FirstvideoWatched"
                    }
                ]
            }
        ]);
    };
});


bot.on('message.create.agent.postback.agent', (message, conversation) => {
    console.log('Processing message ', message.text)
    if (message.text === "FirstvideoWatched") {
        conversation.say([
            {
                text: "Alright, you should know how to accept a conversation now!",
                role: 'bot',
                delay: incrementor.set(3)
            },
            {
                text: "The next video will show the different statusses of a conversation.",
                role: 'bot',
                delay: incrementor.increment(4)
            },
            {
                text: "Please click the button when you are done watching the video.",
                role: 'bot',
                delay: incrementor.increment(3)
            },
            {
                text: "https://www.youtube.com/embed/846DWH8soIw",
                contentType: "text/url",
                delay: incrementor.increment(7),
                actions: [
                    {
                        type: "reply",
                        text: "Done",
                        payload: "2complete"
                    }
                ]
            }
        ]);
    };
});

bot.on('message.create.agent.postback.agent', (message, conversation) => {
    if (message.text === "2complete") {
        const string = "This tour has 14 videos by the way, but it shouldn't take more than 15 minutes"
        nextVideoinPath(conversation, 3, "how to edit contact fields in conversations.", string)
    } else if (message.text === "3complete") {
        nextVideoinPath(conversation, 4, "how to finish a conversation by making a form.", "Also, if you don't have the time to take this tour now, you can always close this conversation and resume later.")
    } else if (message.text === "4complete") {
        nextVideoinPath(conversation, 5, "how to edit your preferences and personal details in Chatshipper.", "Be sure to visit the preferences tab later to select the options that you like best!")
    } else if (message.text === "5complete") {
        nextVideoinPath(conversation, 6, "Video is private.","none")
    } else if (message.text === "6complete") {
        nextVideoinPath(conversation, 7, "how to send files, videos or photos via Chatshipper.", "We're halfway! Keep going!.")
    } else if (message.text === "7complete") {
        nextVideoinPath(conversation, 8, "how to find a contact or conversation with the search bar.")
    } else if (message.text === "8complete") {
        nextVideoinPath(conversation, 9, "how to forward your conversation to another agent or department.", "Remember, you can quit and come back at any time to finish the tour.")
    } else if (message.text === "9complete") {
        nextVideoinPath(conversation, 10, "how to start a chat with one or more colleagues.", "We hit number 10, just 4 more to go!")
    } else if (message.text === "10complete") {
        nextVideoinPath(conversation, 11, "how to ask a colleague to join your current conversation with a consumer.", "Did you know that this bot took approximately 16 manhours to be finished?")
    } else if (message.text === "11complete") {
        nextVideoinPath(conversation, 12, "how to follow and unfollow conversations.")
    } else if (message.text === "12complete") {
        nextVideoinPath(conversation, 13, "how to make and use pre-made (canned) responses in conversations.")
    } else if (message.text === "tourfinished") {
        nextVideoinPath(conversation, 14, "how to give feedback on the forms that your colleagues made.", "This is the last video, we're almost here!")
    };
});
// Start Express.js webhook server to start listening
bot.start();
