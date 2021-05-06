import * as React from "react";
import { Component } from "react";
import "./DeviceSettings.css";

class DeviceSettings extends Component<any,any> { // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11

  constructor(props) {
    super(props);
    this.handlePreferenceChange = this.handlePreferenceChange.bind(this);
    this.writeToRadio = this.writeToRadio.bind(this);
    this.handleChannelChange = this.handleChannelChange.bind(this);
    this.handleOwnerChange = this.handleOwnerChange.bind(this);
    this.state = {
      radioConfig: {},
      myInfo: {},
      owner: {},
      isDirty: false
    };
  }

  static getDerivedStateFromProps(props,state) {
    // This will erase any local state updates!
    // Do not do this.
    console.log(props);
    return { 
      radioConfig: props.radioConfig,
      myInfo: props.myInfo,
      owner: props.owner
    };
  }

  handlePreferenceChange(event) {
    console.log(event);
    const newPreferences = this.state.radioConfig.preferences;
    newPreferences[event.target.name] = event.target.value
    console.log(newPreferences);

    const newRadioConfig = this.state.radioConfig;
    newRadioConfig.preferences = newPreferences
    this.setState({
      radioConfig: newRadioConfig,
      isDirty: true
    });
  }

  handleChannelChange(event) {
    console.log(event);
    const newChannel = this.state.radioConfig.channelSettings;
    newChannel[event.target.name] = event.target.value
    console.log(newChannel);

    const newRadioConfig = this.state.radioConfig;
    newRadioConfig.channelSettings = newChannel
    this.setState({
      radioConfig: newRadioConfig,
      isDirty: true
    });
    
  }

  handleOwnerChange(event) {
    console.log(event);
    const newOwner = this.state.owner;
    newOwner[event.target.name] = event.target.value
    console.log(newOwner);

    this.setState({
      owner: newOwner,
      isDirty: true
    });
  }

  writeToRadio() {
    console.log("setting radio configs: ", this.state.radioConfig)
    this.props.httpconn.setRadioConfig(this.state.radioConfig);
    this.props.httpconn.setOwner(this.state.owner);
    console.log("done setting radio config; rebooting");
    fetch("/restart",{
      method:"POST"
    });
  }

  unsavedChanges() {
    if (this.state.isDirty){
      return (
        <div>
          <span>Notice: There are unsaved configuration changes</span><br/>
          <button onClick={this.writeToRadio} disabled={!this.state.isDirty}> Save and Reboot</button>
        </div>
      )
    }
  }

  render() {

    const preferencesProto = Object.getPrototypeOf(this.state.radioConfig.preferences)
    const availableUserPreferences =  Object.getOwnPropertyNames(preferencesProto).filter(name => typeof this.state.radioConfig.preferences[name] !== 'function' &&  name !== '$type').sort();

    const channelProto = Object.getPrototypeOf(this.state.radioConfig.channelSettings)
    const availableChannelSettings =  Object.getOwnPropertyNames(channelProto).filter(name => typeof this.state.radioConfig.preferences[name] !== 'function' &&  name !== '$type').sort();


    const prefs = availableUserPreferences.map(key => 
      <div>
        <span className="settingLabel">{key} </span>
        <input className="settingValue" name={key} onChange={this.handlePreferenceChange} value={this.state.radioConfig.preferences[key]} /><br/>
       </div>
    )

    const myInfo = Object.keys(this.state.myInfo).map(key => 
      <div>
        <span className="settingLabel">{key} </span>
        <span className="settingValue">{this.state.myInfo[key]}</span><br/>
       </div>
    )


    const channelSettings = availableChannelSettings.map(key => 
      <div>
        <span className="settingLabel">{key} </span>
        <input className="settingValue" name={key} onChange={this.handleChannelChange} value={this.state.radioConfig.channelSettings[key]}/><br/>
       </div>
    )
    const owner = Object.keys(this.state.owner).map(key =>
      <div>
        <span className="settingLabel">{key} </span>
        <input className="settingValue" name={key}  onChange={this.handleOwnerChange} value={this.state.owner[key]}/><br/>
      </div>
    )

    return (
      <div className="DeviceSettings">
        <div className="DeviceProfile">
          <span className="SectionHeader">Device Profile</span><br/>
          { myInfo }
        </div>
        <div className="DeviceActions">
          <span className="SectionHeader">Device Actions</span><br/>
          <button onClick={()=>{ fetch("/restart",{
              method:"POST"
            }); }} >Restart</button>
          <button onClick={()=>{ 
            var formData = new FormData();
            formData.append("blink_target", "LED");
            fetch("/json/blink?blink_target=LED",{
              method:"POST"
            }); }} >Blink LED</button>
          <button onClick={()=>{ 
            var formData = new FormData();
            formData.append("blink_target", "SCREEN");
            fetch("/json/blink?blink_target=SCREEN",{
              method:"POST"
            }); }} >Blink Screen</button>
          {this.unsavedChanges()}          
        </div>
        <div className="UserPreferences">
        <span className="SectionHeader">User Preferences</span><br/>
          {prefs}
        </div>
        
        <div className="ChannelSettings">
        <span className="SectionHeader">Channel Settings</span><br/>
         { channelSettings }
        </div>

        <div className="Owner">
        <span className="SectionHeader">Owner</span><br/>
         { owner }
        </div>



        
      </div>
    );
  }
}

export default DeviceSettings;

