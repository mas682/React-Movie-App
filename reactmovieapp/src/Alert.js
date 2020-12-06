import React from 'react';
import style from './css/Alerts/alert.module.css';


/*
    Component to display messages on the screen
    Note: Requires parent elemnt to have a positon of absolute
*/
class Alert extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            messages: {},
            // count of messages received
            // needs to be 0 for first message
            messageCount: 0
        };
        this.generateMessages = this.generateMessages.bind(this);
        this.timerHandler = this.timerHandler.bind(this);
    }

    componentDidUpdate(prevProps, prevState)
    {
        // if there is a message
        if(this.props.message !== undefined)
        {
            // if the message is not a empty string
            if(this.props.message !== "")
            {
                // new message received
                if(prevProps.message !== this.props.message || prevProps.messageId !== this.props.messageId || this.state.messageCount === 0)
                {
                    console.log("New alert message found");
                    let messages = this.state.messages;
                    let messageKey = this.state.messageCount + 1;
                    let type = (this.props.type === undefined) ? "success" : this.props.type;
                    let messageStyle = (this.props.style === undefined) ? {} : this.props.style;
                    let timeout = (this.props.timeout === undefined) ? 5000 : this.props.timeout;
                    let interval = (timeout === 0) ? undefined : setInterval(() => this.timerHandler(messageKey), timeout);;
                    messages[messageKey] = {
                        message: this.props.message,
                        type: type,
                        timer: interval,
                        style: messageStyle
                    };
                    this.setState({
                        messages: messages,
                        messageCount: messageKey
                    });
                }
            }
        }
    }

    timerHandler(id)
    {
        let messages = this.state.messages;
        // if there is a timeout
        if(messages[id].timer !== undefined)
        {
            clearInterval(messages[id].timer);
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
            if(type === "success")
            {
                message = (
                    <div className={`${style.messageBox} ${style.success}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol}>
                            <i class="fas fa-check"/>
                        </div>
                        <div className={style.message}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "warning")
            {
                message = (
                    <div className={`${style.messageBox} ${style.warning}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol}>
                            <i class="fas fa-exclamation-triangle"/>
                        </div>
                        <div className={style.message}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "info")
            {
                message = (
                    <div className={`${style.messageBox} ${style.info}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol}>
                            <i class="fas fa-info"/>
                        </div>
                        <div className={style.message}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "failure")
            {
                message = (
                    <div className={`${style.messageBox} ${style.failure}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol}>
                            <i class="fas fa-ban"/>
                        </div>
                        <div className={style.message}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "unknown")
            {
                message = (
                    <div className={`${style.messageBox} ${style.unknown}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol}>
                            <i class="fas fa-question"/>
                        </div>
                        <div className={style.message}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton}>
                            <i class="fas fa-times"/>
                        </div>
                    </div>);
            }
            else if(type === "attention")
            {
                message = (
                    <div className={`${style.messageBox} ${style.attention}`} style={messageStyle} onClick={() => {this.timerHandler(key)}}>
                        <div className={style.symbol}>
                            <i class="fas fa-exclamation"/>
                        </div>
                        <div className={style.message}>
                            {this.state.messages[key].message}
                        </div>
                        <div className={style.closeButton}>
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
            <div className={style.messagesContainer}>
                <div className={style.messagesInnerContainer}>
                    {messages}
                </div>
            </div>
        );
    }
}

export default Alert;
