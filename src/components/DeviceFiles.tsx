import * as React from "react";
import { Component, createRef } from "react";
import "./DeviceFiles.css";
import DeviceFile from "./DeviceFile";

class DeviceFiles extends Component<any,any> { // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11

  constructor(props) {
    super(props);
    this.state ={
      formFileField:null,
      uploadQueue: null,
      currentlyUploading: null,
      uploadBusy: false,
      deleting: false,
      drag: false,
      files:[],
      filesystem:{}
    }
    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onChange = this.onChange.bind(this)
    this.fileUpload = this.fileUpload.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleDragOut = this.handleDragOut.bind(this)
    this.handleDragIn = this.handleDragIn.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.refreshSPIFFSFileTree = this.refreshSPIFFSFileTree.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
  }

  /* 
    Drag-n-drop code borrowed from https://medium.com/@650egor/simple-drag-and-drop-file-upload-in-react-2cb409d88929
    and from https://www.smashingmagazine.com/2020/02/html-drag-drop-api-react/
  */
 
  dropRef = React.createRef<HTMLDivElement>() //Found help on this from: https://medium.com/@martin_hotell/react-refs-with-typescript-a32d56c4d315

  handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("in")
  }
  
  handleDragIn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("in")
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({drag: true})
    }
  }

  handleDragOut = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("out")
    this.setState({drag: false})
  }

  handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({drag: false})
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.setState({
        uploadQueue: e.dataTransfer.files
      });
      console.log("upload queue: ", e.dataTransfer.files);
    }
  }

  componentDidMount() {
    let div:any = this.dropRef.current // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
    div.addEventListener('dragenter', this.handleDragIn)
    div.addEventListener('dragleave', this.handleDragOut)
    div.addEventListener('dragover', this.handleDrag)
    div.addEventListener('drop', this.handleDrop)
    this.refreshSPIFFSFileTree()
  }

  componentWillUnmount() {
    let div:any = this.dropRef.current // TODO: Properly define / enforce Typescript types https://github.com/meshtastic/meshtastic-web/issues/11
    div.removeEventListener('dragenter', this.handleDragIn)
    div.removeEventListener('dragleave', this.handleDragOut)
    div.removeEventListener('dragover', this.handleDrag)
    div.removeEventListener('drop', this.handleDrop)
  }

  refreshSPIFFSFileTree() {
    console.log("getting filetree");
    fetch("/json/spiffs/browse/static").then(function(response) {
      if (response.status !== 200) {
         // couldn't read files
         return
      }
      response.json().then(function(data) {
        console.log(data.data);
        this.setState({
          files: data.data.files,
          filesystem: data.data.filesystem
        });
      }.bind(this));
    }.bind(this));
  }

  onFormSubmit(e){
    e.preventDefault() // Stop form submit
    this.setState({
      uploadQueue: [this.state.formFileField]
    });
  }

  onChange(e) {
    this.setState({formFileField:e.target.files[0]})
  }
  
  componentDidUpdate() {
    if (this.state.uploadQueue && this.state.uploadQueue.length > 0) {
      if (!this.state.uploadBusy) {
        if (this.state.currentlyUploading == null ) {
          this.setState({
            currentlyUploading: 0
          });
          return;
        }
        this.setState({
          uploadBusy: true
        });
        const fileToUpload = this.state.uploadQueue[this.state.currentlyUploading]

        this.fileUpload(fileToUpload).then((response) => {
          if (this.state.uploadQueue) {
            if (this.state.uploadQueue.length == this.state.currentlyUploading +1 ) {
              this.setState({
                uploadQueue: null,
                currentlyUploading: null
              });
              this.refreshSPIFFSFileTree();
            }
            else {
              this.setState({
                currentlyUploading: this.state.currentlyUploading +1,
                uploadBusy: false
              });
            }
          }
      })
    }
  }
    
}
  



  fileUpload(file:File){
    const formData = new FormData();
    formData.append('file',file)
    return fetch("/upload",{
      method:"POST",
      body: formData
    }).then((response)=>{
      console.log("File upload successful");
    });
  }


  filesystemUtilizationBar() {
    const kbUsed = Math.round(this.state.filesystem.used/1000)
    const kbFree =  Math.round(this.state.filesystem.free/1000);
    const kbTotal = Math.round(this.state.filesystem.total/1000);
    const pctUsed = Math.round((this.state.filesystem.used / this.state.filesystem.total)*100);
    const pctFree = Math.round((this.state.filesystem.free / this.state.filesystem.total)*100);
    return(
      <div className="UtilizationDiv">
        <div className="UtilizationUsed" style={{
          width: pctUsed +"%"
        }}>
          {kbUsed}kb Used ({pctUsed}%)
        </div>
        <div className="UtilizationFree" style={{
          width: pctFree+"%"
        }}>
          {kbFree}kb Free ({pctFree}%)
        </div>
        <div className="UtilizationTotal">
          Total Size: {kbTotal}kb
        </div>
      </div>
    )
  }

  deleteFile(filename:string) {
    fetch("/json/spiffs/delete/static?delete="+filename,{
      method:"DELETE"
    }).then(()=> {
      this.refreshSPIFFSFileTree();
    })
  }

  deleteAllFiles() {
    this.setState({
      deleting: true
    });
    Promise.all(this.state.files.map((file, index) => (
      fetch("/json/spiffs/delete/static?delete="+file.name,{
        method:"DELETE"
      })
    ))).then( () =>  {
        this.refreshSPIFFSFileTree();
        this.setState({
          deleting: false
        });
      }
    );
  }

  renderUploadQueue() {
    var response = new Array;
    for(var i=this.state.currentlyUploading;i<this.state.uploadQueue.length;i++){
      response.push(this.state.uploadQueue[i].name)
    }
    return response.map((value) => (
      <div>
        {value}
      </div>
    ));
  }

  render() {
    if (this.state.currentlyUploading) {
      return (
        <div className="DeviceFiles">
          <div className="FileActionMessage">
            Upload in progress: {this.state.uploadQueue[this.state.currentlyUploading].name}
            {this.renderUploadQueue()}
          </div>
        </div>
      );
    }
    else if (this.state.drag) {
      return (
        <div className="DeviceFiles">
          <div className="FileActionMessage">
            Drop files to upload
          </div>
        </div>
      );
    }
    else if (this.state.deleting) {
      return (
        <div className="DeviceFiles">
          <div className="FileActionMessage">
            Deleting files
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="DeviceFiles" ref={this.dropRef}>
          <form onSubmit={this.onFormSubmit}>
            <input type="file" onChange={this.onChange} />
            <button type="submit">Upload File</button>
            <p>Drop files here to upload</p>      
          </form>
          <div className="FileBrowser">
            {this.state.files.map((value, index) => (
              <DeviceFile name={value.name} size={value.size}  delete={this.deleteFile}/>
            ))}
             <button className="DeleteAllButton" onClick={
              (event)=>{ 
                event.preventDefault();
                this.deleteAllFiles();
              }}>Delete All</button>
          </div>
          
            {this.filesystemUtilizationBar()}
        </div>
      );
    }
  }
}

export default DeviceFiles;

