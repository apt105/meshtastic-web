import * as React from "react";
import { Component } from "react";
import Message from "./message";
import "./messages.css";

class Messages extends Component<any,any> { // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
  constructor(props) {
    super(props);
    this.SendMessage = this.SendMessage.bind(this);
    this.NewMessageChange = this.NewMessageChange.bind(this);
    this.state = {
      NewMessageValue: "",
    };
  }

  SendMessage() {
    this.props.SendMessage(this.state.NewMessageValue, () => {
      this.setState({
        NewMessageValue: "",
      });
    });
  }

  NewMessageChange(event) {
    this.setState({
      NewMessageValue: event.target.value,
    });
  }

  render() {
    return (
      <div className="Messages">
        <div className="MessageHistory">
          Messages:
          {this.props.messages.map((value, index) => (
            <Message message={value} OurNodeId={this.props.OurNodeId} users={this.props.users} />
          ))}
        </div>
        <div className="NewMessage">
          <label>
            Compose Message:
            <br />
            <textarea
              name="messageEntry"
              onChange={this.NewMessageChange}
              value={this.state.NewMessageValue}
            />
          </label>
          <button name="Send" onClick={this.SendMessage}>
            Send
          </button>
        </div>
      </div>
    );
  }
}

interface MessagesProps {
  SendMessage: any, // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
  messages: any // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
}

interface MessagesState {
  NewMessageValue: string
}


export default Messages;
