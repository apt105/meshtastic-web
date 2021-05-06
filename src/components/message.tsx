import * as React from "react";
import { Component } from "react";
import "./message.css";
import { PortNumEnum } from "../../node_modules/@meshtastic/meshtasticjs/dist/protobuf";

class Message extends Component<any,any> { // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
  sentByUs() {
    return this.props.message.from == this.props.OurNodeId;
  }

  messageBody() {
    return new TextDecoder().decode(this.props.message.decoded.data.payload as Uint8Array);
  }

  translateNodeIDToFriendlyName(nodeId) { 
    const EVERYONE_INT32_MAX = 4294967295; // avoid magic nubmers; define it here, use it later
    // TODO: this should probably be some kind of globally acessible
    // static class?  We might need this outside of a single message
    if (nodeId == EVERYONE_INT32_MAX) {
      return "Everyone";
    }
    else if (this.props.users.hasOwnProperty(nodeId)){
      if (this.props.users[nodeId].longName && this.props.users[nodeId].longName.length >0 ){
        return this.props.users[nodeId].longName
      }
    }
    return nodeId
  }

  render() {
    var rxTime = new Date(0); // The 0 there is the key, which sets the date to the epoch
    rxTime.setUTCSeconds(this.props.message.rxTime);
    return (
      <div
        className="Message"
        style={{
          backgroundColor: this.sentByUs() ? "red" : "blue",
          color: this.sentByUs() ? "black" : "white",
          float: this.sentByUs() ? "left" : "right",
        }}
      >
        <div className="MessageHead">
          From: {this.translateNodeIDToFriendlyName(this.props.message.from) } || To: {this.translateNodeIDToFriendlyName(this.props.message.to) }
        </div>
        <div
          className="MessageBody"
          style={{
            textAlign: this.sentByUs() ? "left" : "right",
          }}
        >
          {this.messageBody()}
        </div>
        <div className="MessageFooter">
          RxSnr: {this.props.message.rxSnr} || RxTime:{" "}
          {rxTime.toLocaleString("en-US", { timeZone: "EST" })} || hopLimit:{" "}
          {this.props.message.hopLimit}
        </div>
      </div>
    );
  }
}

interface MessageProps {
  message: {
    from: string,
    decoded: any, // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
    rxTime: string,
    rxSnr: any // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
    hopLimit: any // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
  }
}


export default Message;
