

// function to generate the Object to set the a components message state
// created this so messageState cannot not change anything else
const generateMessageState = (messageState, messageId) => {
        let messageCount = messageId + messageState.messages.length;
        return {
            messages: messageState.messages,
            messageId: messageCount
        };
};


export {generateMessageState};
