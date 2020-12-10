

// function to generate the Object to set the a components message state
// created this so messageState cannot not change anything else
const generateMessageState = (messageState, messageId) => {
        let messageCount = messageId + 1;
        return {
            message: messageState.message,
            messageId: messageCount,
            messageType: messageState.messageType
        };
};


export {generateMessageState};
