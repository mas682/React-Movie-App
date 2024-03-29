import React from 'react';
import style from '../css/Alerts/alert.module.css';


/*
    Component to display messages on the screen
    Note: Requires parent elemnt to have a positon of absolute
    child elements must be relative
*/
class Alert extends React.Component
{
    constructor(props) {
        super(props);
        let innerContainerStyle = (this.props.innerContainerStyle === undefined) ? {} : this.props.innerContainerStyle;
        let outterContainerStyle = (this.props.outterContainerStyle === undefined) ? {} : this.props.outterContainerStyle;
        this.state = {
            messages: {},
            messageCount: 0,
            innerContainerStyle: innerContainerStyle,
            outterContainerStyle: outterContainerStyle
        };
        this.generateMessages = this.generateMessages.bind(this);
        this.timerHandler = this.timerHandler.bind(this);
        this.clearAllMessages = this.clearAllMessages.bind(this);
        this.addNewMessage = this.addNewMessage.bind(this);
    }

    componentDidMount()
    {
        if(this.props.messages !== undefined)
        {
            if(this.props.messages.length > 0)
            {
                let state = this.state;
                for(let message of this.props.messages)
                {
                    state = this.addNewMessage(this.props, state, message);
                }
                this.setState(state);
            }
        }
    }

    async componentDidUpdate(prevProps, prevState)
    {
        // if the props received indicate to reset the component
        if(this.props.messageId === -1)
        {
            // if there are active messages
            if(Object.keys(this.state.messages).length > 0)
            {
                await this.clearAllMessages(this.state.messages);
                this.setState({
                    messages: {}
                });
            }
        }
        else if(this.props.messages !== undefined)
        {
            // if there are multiple values in the array
            if(this.props.messages.length > 0)
            {
                // if new message(s) were received
                if(prevProps.messageId !== this.props.messageId)
                {
                    let state = {...this.state};
                    if(this.props.clearMessages)
                    {
                        this.clearAllMessages(state.messages);
                        state.messages = {};
                    }
                    for(let message of this.props.messages)
                    {
                        state = this.addNewMessage(this.props, state, message);
                    }
                    this.setState(state);
                }
            }
        }
    }

    componentWillUnmount()
    {
        // remove all timers before closing the component
        this.clearAllMessages({...this.state.messages});
    }

    // function to recieve a new message and update the state appropriately
    addNewMessage(props, state, message)
    {
        console.log("New alert message found");
        let messages = {...state.messages};
        // key is the total message counter
        let messageKey = state.messageCount + 1;
        let type = (message.type === undefined) ? "success" : message.type;
        let messageStyle = (props.style === undefined) ? {} : props.style;
        messageStyle = (message.style === undefined) ? messageStyle : message.style;
        let symbolStyle = (props.symbolStyle === undefined) ? {} : props.symbolStyle;
        symbolStyle = (message.symbolStyle === undefined) ? symbolStyle : message.symbolStyle;
        let messageBoxStyle = (props.messageBoxStyle === undefined) ? {} : props.messageBoxStyle;
        messageBoxStyle = (message.messageBoxStyle === undefined) ? messageBoxStyle : message.messageBoxStyle;
        let closeButtonStyle = (props.closeButtonStyle === undefined) ? {} : props.closeButtonStyle;
        closeButtonStyle = (message.closeButtonStyle === undefined) ? closeButtonStyle : message.closeButtonStyle;
        let innerContainerStyle = (this.props.innerContainerStyle === undefined) ? {} : this.props.innerContainerStyle;
        let timeout = (props.timeout === undefined) ? 5000 : props.timeout;
        timeout = (message.timeout === undefined) ? timeout : message.timeout;
        let interval = (timeout === 0) ? undefined : setTimeout(() =>{this.timerHandler(messageKey)}, timeout);
        messages[messageKey] = {
            message: message.message,
            type: type,
            timer: interval,
            style: messageStyle,
            symbolStyle: symbolStyle,
            messageBoxStyle: messageBoxStyle,
            closeButtonStyle: closeButtonStyle
        };
        return {
            messages: messages,
            messageCount: messageKey,
            innerContainerStyle: innerContainerStyle
        };
    }

    async clearAllMessages(messages)
    {
        let keys = Object.keys(messages);
        //await keys.forEach((key) => {
        await keys.forEach((key) => {
            if(messages[key] !== undefined)
            {
                clearTimeout(messages[key].timer);
            }
        });
    }

    timerHandler(id)
    {
        let messages = {...this.state.messages};
        // if there is a timeout
        if(messages[id].timer !== undefined)
        {
            clearTimeout(messages[id].timer);
        }
        delete messages[id];
        this.setState({
            messages: messages
        });
    }

    generateMessages()
    {
        let keys = Object.keys(this.state.messages);
        let html = [];
        keys.forEach((key) => {
            let message = "";
            let type = this.state.messages[key].type;
            let messageStyle = this.state.messages[key].style;
            let symbolStyle = this.state.messages[key].symbolStyle;
            let messageStyle2 = this.state.messages[key].messageBoxStyle;
            let closeButtonStyle = this.state.messages[key].closeButtonStyle;
            if(type === "success")
            {
                message = (
                    <div className={`${style.messageBox} ${style.success}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol} style={symbolStyle}>
                            <i class="fas fa-check"/>
                        </div>
                        <div className={style.message} style={messageStyle2}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton} style={closeButtonStyle}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "warning")
            {
                message = (
                    <div className={`${style.messageBox} ${style.warning}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol} style={symbolStyle}>
                            <i class="fas fa-exclamation-triangle"/>
                        </div>
                        <div className={style.message} style={messageStyle2}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton} style={closeButtonStyle}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "info")
            {
                message = (
                    <div className={`${style.messageBox} ${style.info}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol} style={symbolStyle}>
                            <i class="fas fa-info"/>
                        </div>
                        <div className={style.message} style={messageStyle2}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton} style={closeButtonStyle}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "failure")
            {
                message = (
                    <div className={`${style.messageBox} ${style.failure}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol} style={symbolStyle}>
                            <i class="fas fa-ban"/>
                        </div>
                        <div className={style.message} style={messageStyle2}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton} style={closeButtonStyle}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "unknown")
            {
                message = (
                    <div className={`${style.messageBox} ${style.unknown}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol} style={symbolStyle}>
                            <i class="fas fa-question"/>
                        </div>
                        <div className={style.message} style={messageStyle2}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton} style={closeButtonStyle}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "attention")
            {
                message = (
                    <div className={`${style.messageBox} ${style.attention}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol} style={symbolStyle}>
                            <i class="fas fa-exclamation"/>
                        </div>
                        <div className={style.message} style={messageStyle2}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton} style={closeButtonStyle}>
                            <i class="fas fa-times" onClick={() => {this.timerHandler(key)}}/>
                        </div>
                    </div>);
            }
            html.push(message);
        });
        return html;
    }


    render()
    {
        if(Object.keys(this.state.messages) < 1)
        {
            return null;
        }
        let messages = this.generateMessages();
        return (
            <div className={style.messagesContainer} style={this.state.outterContainerStyle}>
                <div className={style.messagesInnerContainer} style={this.state.innerContainerStyle}>
                    {messages}
                </div>
            </div>
        );
    }
}

export default Alert;
