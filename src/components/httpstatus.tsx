import { DeviceStatusEnum } from "@meshtastic/meshtasticjs/dist/types";
import * as React from "react";
import { Component } from "react";

class HTTPStatus extends Component<any,any> { // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
  interval;

  state = {
    seconds_since_http_interaction: "",
    seconds_since_radio_packet: "",
  };

  GetTimeColor(seconds) {
    if (seconds < 10) {
      return "green";
    } else if (seconds < 30) {
      return "orange";
    } else {
      return "red";
    }
  }

  GetHTTPColor() {
    return this.props.HTTPStatus !== 200 ? "green" : "red";
  }

  GetFormattedSecondsString(seconds) {
    if (seconds < 60) {
      return seconds+"s";
    }
    else if (seconds < 60*60) {
      const minutes = Math.floor((seconds)/60)
      const seconds_rem = Math.round((seconds - (minutes*60)))
      return minutes +"m " + seconds_rem +"s";
    }
    else {
      const hours = Math.floor(seconds/60/60)
      const minutes = Math.round((seconds - (hours*60*60))/60)
      const seconds_rem = Math.round((seconds - (hours*60*60) - (minutes*60)))
      return hours + "h " + minutes +"m "+ seconds_rem +"s";
    }
  }

  componentDidMount() {
    // borrowed from: https://stackoverflow.com/questions/39426083/update-react-component-every-second
    this.interval = setInterval(() => {
      const now:any = new Date(); // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
      this.setState({
        seconds_since_http_interaction: Math.trunc(
          (now - this.props.HTTPStatus.interaction_time) / 1000
        ),
        seconds_since_radio_packet: Math.trunc(
          (now - this.props.RadioStatus.interaction_time) / 1000
        ),
      });
    }, 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  GetStatusText() {
    switch (this.props.connectionStatus) {
      case DeviceStatusEnum.DEVICE_RESTARTING:
        return "Restarting";
      case DeviceStatusEnum.DEVICE_DISCONNECTED:
        return "Disconnected";
      case DeviceStatusEnum.DEVICE_CONNECTING:
        return "Connecting";
      case DeviceStatusEnum.DEVICE_RECONNECTING:
        return "Reconnecting";
      case DeviceStatusEnum.DEVICE_CONNECTED:
        return "Connected";
      case DeviceStatusEnum.DEVICE_CONFIGURING:
        return "Configuring";
      case DeviceStatusEnum.DEVICE_CONFIGURED:
        return "Configured";
    }
  }

  // do this: https://stackoverflow.com/questions/39426083/update-react-component-every-second

  render() {
    return (
      <div>
        Status: {this.GetStatusText()}
        &nbsp; || &nbsp; Last Device Transaction: (
        <span
          style={{
            color: this.GetHTTPColor(),
          }}
        >
          {this.props.HTTPStatus.status}
        </span>
        /
        <span
          style={{
            color: this.GetTimeColor(this.state.seconds_since_http_interaction),
          }}
        >
          {this.GetFormattedSecondsString(this.state.seconds_since_http_interaction)}
        </span>
        ) &nbsp; || &nbsp; Last Mesh Message: (
        <span
          style={{
            color: this.GetTimeColor(this.state.seconds_since_radio_packet),
          }}
        >
          {this.GetFormattedSecondsString(this.state.seconds_since_radio_packet)}
        </span>
        )
      </div>
    );
  }
}

export default HTTPStatus;
