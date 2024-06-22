import './App.css';

import 'primeicons/primeicons.css';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import "./index.css"
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { DataScroller } from 'primereact/datascroller';
import { Tag } from 'primereact/tag';
//Todo: farla girare in electron.

function App() {
  const toast = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [url, setUrl] = useState("");
  const options = [
    { name: 'Video', code: '.mp4' },
    { name: 'Audio Only', code: '.mp3' },
  ];

  const handleSubmit = async () => {
    const urlDestination = `http://127.0.0.1:8000/download`
    try {
      const response = await axios.get(urlDestination);

      if (response.status === 200) {
        setlistVideos([])
        toast.current.show({ severity: 'success', summary: 'Success', detail: `${response.data.message}`, life: 3000 });
      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: `${response.data.message}`, life: 3000 });
      }
    } catch (error) {
      console.error(error);
      toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });

    }

  }
  const stepperRef = useRef(null);
  const [listVideos, setlistVideos] = useState([])

  const itemTemplate = (data) => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "1rem" }}>
        <div style={{ display: "block", width: "80%" }}>
          <h4 style={{ width:"80%" }}>
            <i>{data.title}</i>
            <Tag style={{marginLeft:"3rem"}} value={data.ex} severity={"info"}></Tag>
          </h4>
          <Tag icon="pi pi-chevron-right" value={data.url} severity={"help"}></Tag>
        </div>

        <Button icon="pi pi-times" rounded outlined severity="danger" aria-label="Cancel" onClick={async () => await axios.get(`http://127.0.0.1:8000/delete/${data.index}`).then(resp => toast.current.show({ severity: 'success', summary: 'Success', detail: `${resp.data.message}`, life: 3000 }), setlistVideos([]))} />
        <hr />
      </div>


    );
  };

  useEffect(() => {
    async function fetchData() {
      try {
        await axios.get("http://127.0.0.1:8000/videos").then(resp => setlistVideos(resp.data))
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchData();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <i>YouTube Downloader</i>
      </header>
      <div style={{ padding: "1rem" }} >


        <Splitter style={{ height: '85vh' }}>
          <SplitterPanel className="flex align-items-center justify-content-center">
            <div className="card">
              <h2><i>Upload Videos</i></h2>
              <Stepper ref={stepperRef} style={{ flexBasis: '50rem', margin: "2rem" }} orientation="vertical">
                <StepperPanel header="Type your Url">
                  <div className="flex flex-column h-12rem">
                    <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">   <InputText style={{ width: "50%", margin: "1rem" }} value={url} onChange={(e) => setUrl(e.target.value)} /></div>
                  </div>
                  <div className="flex py-4">
                    <Button style={{ margin: "1rem" }} outlined label="Next" icon="pi pi-arrow-right" iconPos="right" severity='info' onClick={() => stepperRef.current.nextCallback()} />
                  </div>
                </StepperPanel>
                <StepperPanel header="Chose the format">
                  <div className="flex flex-column h-12rem ">
                    <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium"><Dropdown style={{ width: "50%", margin: "1rem" }} value={selectedOption} onChange={(e) => setSelectedOption(e.value)} options={options} optionLabel="name"
                      placeholder="Select format" className="w-full md:w-14rem" />
                      <div className="flex py-4 gap-2"></div>
                    </div>
                    <Button outlined style={{ margin: "1rem" }} label="Back" severity="secondary" icon="pi pi-arrow-left" onClick={() => stepperRef.current.prevCallback()} />
                    <Button outlined style={{ margin: "1rem" }} label="Upload" icon="pi pi-upload" iconPos="right" onClick={async () =>
                      await axios.post("http://127.0.0.1:8000/uploadVideo", {
                        "video_url": url,
                        "ex": selectedOption.code
                      }).then(resp => setlistVideos(resp.data), setUrl(""))

                    } />
                  </div>
                </StepperPanel>

              </Stepper>

            </div>
          </SplitterPanel>
          <SplitterPanel className="flex align-items-center justify-content-center ">

            <div className='card' >
              <h2><i>My Videos</i></h2>
              <div style={{ height: "60vh", overflow: "auto" }}>
                <DataScroller value={listVideos} itemTemplate={itemTemplate} rows={50} buffer={0.4} />
              </div>
              <Button outlined style={{ margin: "1rem" }} label="Download" severity="info" position={"right"} icon="pi pi-download" onClick={handleSubmit} />

            </div>
          </SplitterPanel>
        </Splitter>

        <Toast ref={toast} position='center' />
      </div>
    </div>

  );
}

export default App;
