import "./App.css";

import "primeicons/primeicons.css";

import "/node_modules/primeflex/primeflex.css";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import "./index.css";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Stepper } from "primereact/stepper";
import { StepperPanel } from "primereact/stepperpanel";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { DataScroller } from "primereact/datascroller";
import { Tag } from "primereact/tag";

function App() {
  const toast = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [url, setUrl] = useState("");
  const options = [
    { name: "Video", code: ".mp4" },
    { name: "Audio Only", code: ".mp3" },
  ];

  const handleSubmit = async () => {
    const urlDestination = `http://127.0.0.1:8000/download`;
    try {
      const response = await axios.get(urlDestination);

      setlistVideos([]);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `${response.data.message}`,
        life: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `${error.response.data.detail}`,
        life: 3000,
      });
    }
  };
  const stepperRef = useRef(null);
  const [listVideos, setlistVideos] = useState([]);

  const itemTemplate = (data) => {
    return (
      <div
        className="grid"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <img
          className="col-2"
          src={data.thumbnail_url}
        ></img>
        <div className="col-8 grid ">
          <h4 className="col-12">
            <i>{data.title}</i>
          </h4>

          <Tag
            className="col-10"
            icon="pi pi-chevron-right"
            value={data.url}
            severity={"help"}
          />
          <Tag className="col-2" value={data.ex} severity={"info"} />
        </div>
        <div className="col-2">
          <Button
            icon="pi pi-times"
            rounded
            outlined
            severity="danger"
            aria-label="Cancel"
            onClick={async () =>
              await axios
                .get(`http://127.0.0.1:8000/delete/${data.index}`)
                .then(
                  (resp) =>
                    toast.current.show({
                      severity: "success",
                      summary: "Success",
                      detail: `${resp.data.message}`,
                      life: 3000,
                    }),
                  fetchData()
                )
            }
          />
        </div>
      </div>
    );
  };
  async function fetchData() {
    try {
      await axios
        .get("http://127.0.0.1:8000/videos")
        .then((resp) => setlistVideos(resp.data));
    } catch (error) {
      console.log(error.message);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <i>YouTube Downloader</i>
      </header>
      <div className="card grid lg:hidden">
        <div className=" col-12 sm:col-12 lg:col-6 ">
          <h2>
            <i>Upload Videos</i>
          </h2>
          <Stepper
            ref={stepperRef}
            style={{ margin: "1rem" }}
            orientation="vertical"
          >
            <StepperPanel header="Type your Url">
              <div className="   border-round justify-content-center align-items-center font-medium">
                <InputText
                  style={{ width: "100%", margin: "1rem" }}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <Button
                outlined
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                severity="info"
                onClick={() => stepperRef.current.nextCallback()}
              />
            </StepperPanel>
            <StepperPanel header="Chose the format">
              <Dropdown
                style={{ width: "100%" }}
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.value)}
                options={options}
                optionLabel="name"
                placeholder="Select format"
              />

              <div>
                <Button
                  outlined
                  style={{ margin: "1rem" }}
                  label="Back"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  outlined
                  style={{ margin: "1rem" }}
                  label="Upload"
                  icon="pi pi-upload"
                  iconPos="right"
                  onClick={async () =>
                    url !== "" && selectedOption !== null
                      ? await axios
                          .post("http://127.0.0.1:8000/uploadVideo", {
                            video_url: url,
                            ex: selectedOption.code,
                          })
                          .then((resp) => setlistVideos(resp.data), setUrl(""))
                      : toast.current.show({
                          severity: "error",
                          summary: "Error",
                          detail: `No Url or Format detected, Please fill the field.`,
                          life: 3000,
                        })
                  }
                />
              </div>
            </StepperPanel>
          </Stepper>
        </div>
        <div className=" col-12 sm:col-12 lg:col-6 ">
          <h2>
            <i>My Videos</i>
          </h2>
          <div style={{ height: "35vh", overflow: "auto" }}>
            <DataScroller
              value={listVideos}
              itemTemplate={itemTemplate}
              rows={50}
              buffer={0.4}
            />
          </div>
          <Button
            outlined
            style={{ margin: "1rem" }}
            label="Download"
            severity="info"
            position={"right"}
            icon="pi pi-download"
            onClick={handleSubmit}
          />
        </div>
      </div>
      <div className="hidden lg:block">
        <Splitter style={{ height: "85vh" }}>
          <SplitterPanel className="flex align-items-center justify-content-center ">
            <div className="card ">
              <h2>
                <i>Upload Videos</i>
              </h2>
              <div style={{ height: "60vh" }}>
                <Stepper ref={stepperRef} orientation="vertical">
                  <StepperPanel header="Type your Url">
                    <div className="flex-auto flex justify-content-center align-items-center font-medium">
                      <InputText
                        style={{ width: "100%" }}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>

                    <div className="flex py-4">
                      <Button
                        outlined
                        label="Next"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        severity="info"
                        onClick={() => stepperRef.current.nextCallback()}
                      />
                    </div>
                  </StepperPanel>
                  <StepperPanel header="Chose the format">
                    <div className="flex flex-column ">
                      <div className="flex-auto flex justify-content-center align-items-center font-medium">
                        <Dropdown
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.value)}
                          options={options}
                          optionLabel="name"
                          placeholder="Select format"
                          className="w-full"
                        />
                      </div>
                      <div className="flex py-2 ">
                        <Button
                          outlined
                          style={{ margin: "1rem" }}
                          label="Back"
                          severity="secondary"
                          icon="pi pi-arrow-left"
                          onClick={() => stepperRef.current.prevCallback()}
                        />
                        <Button
                          outlined
                          style={{ margin: "1rem" }}
                          label="Upload"
                          icon="pi pi-upload"
                          iconPos="right"
                          onClick={async () =>
                            url !== "" && selectedOption !== null
                              ? await axios
                                  .post("http://127.0.0.1:8000/uploadVideo", {
                                    video_url: url,
                                    ex: selectedOption.code,
                                  })
                                  .then(
                                    (resp) => setlistVideos(resp.data),
                                    setUrl("")
                                  )
                              : toast.current.show({
                                  severity: "error",
                                  summary: "Error",
                                  detail: `No Url or Format detected, Please fill the field.`,
                                  life: 3000,
                                })
                          }
                        />
                      </div>
                    </div>
                  </StepperPanel>
                </Stepper>
              </div>
            </div>
          </SplitterPanel>

          <SplitterPanel className="flex align-items-center justify-content-center ">
            <div className="card">
              <h2>
                <i>My Videos</i>
              </h2>
              <div style={{ height: "50vh", overflow: "auto" }}>
                <DataScroller
                  value={listVideos}
                  itemTemplate={itemTemplate}
                  rows={50}
                  buffer={0.4}
                />
              </div>
              <Button
                outlined
                style={{ margin: "1rem" }}
                label="Download"
                severity="info"
                position={"right"}
                icon="pi pi-download"
                onClick={handleSubmit}
              />
            </div>
          </SplitterPanel>
        </Splitter>

        <Toast ref={toast} position="center" />
      </div>
      <Toast ref={toast} position="center" />
    </div>
  );
}

export default App;
