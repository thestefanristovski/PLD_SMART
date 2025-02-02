import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import Dropzone from 'react-dropzone'
import Slider, {Handle, SliderTooltip} from 'rc-slider';
import {toast} from "react-hot-toast";
import ProgressButton from "react-progress-button";
import ReactAutocomplete from "react-autocomplete";

import ResultTile from "./ResultTile";
import FileTile from "./FileTile";
import { saveAs } from 'file-saver';
import 'react-image-picker/dist/index.css'
import '../button.css'
import '../slider.css';

const superagent = require('superagent');
export default class JamComp extends Component{
    constructor(props) {
        super(props)
        this.state = {
            file1: [],
            selectedChords: [],
            chords: [{ id: 'Am', label: 'Am' }, { id: 'AM', label: 'AM' },{ id: 'A#', label: 'A#' }, { id: 'Ab', label: 'Ab' },{ id: 'A7', label: 'A7' },{ id: 'Bm', label: 'Bm' }, { id: 'BM', label: 'BM' },{ id: 'B#', label: 'B#' }, { id: 'Bb', label: 'Bb' },{ id: 'B7', label: 'B7' },{ id: 'Cm', label: 'Cm' }, { id: 'CM', label: 'CM' },{ id: 'C#', label: 'C#' }, { id: 'Cb', label: 'Cb' },{ id: 'C7', label: 'C7' },{ id: 'Dm', label: 'Dm' }, { id: 'DM', label: 'DM' },{ id: 'D#', label: 'D#' }, { id: 'Db', label: 'Db' },{ id: 'D7', label: 'D7' }, { id: 'Em', label: 'Em' }, { id: 'EM', label: 'EM' },{ id: 'E#', label: 'E#' }, { id: 'Eb', label: 'Eb' },{ id: 'E7', label: 'E7' },{ id: 'Fm', label: 'Fm' }, { id: 'FM', label: 'FM' },{ id: 'F#', label: 'F#' }, { id: 'Fb', label: 'Fb' },{ id: 'F7', label: 'F7' },{ id: 'Gm', label: 'Gm' }, { id: 'GM', label: 'GM' },{ id: 'G#', label: 'G#' }, { id: 'Gb', label: 'Gb' },{ id: 'G7', label: 'G7' },],
            buttonState: '',
            isLoading: false,
            hasResult:false,
            downloadLink: '',
            fileName: 'New Creation',
            length: 16,
            temperature: 1,
            value: '',
        }
        this.onDrop1 = this.onDrop1.bind(this);
        this.generateFile = this.generateFile.bind(this);
        this.treatClick = this.treatClick.bind(this);
    }

    onDrop1(acceptedFiles){
        console.log(acceptedFiles);
        var filesTemp = this.state.file1;
        acceptedFiles.forEach(item => {
            if (filesTemp.length<1) {
                filesTemp.push(item);
            }
        });
        this.setState(state => {
            return {
                file1: filesTemp,
            };
        })
    }

    async getServername(){
        var servername;
        var styleList;
        const responseServerName = await superagent.get('http://127.0.0.1:5000/')
        servername = JSON.parse(responseServerName.text).idd
        return servername
    }

    async generateFile() {
        this.setState({
            isLoading: true,
            buttonState: 'loading',
        })
        //get files
        console.log("66666")
        var formData = new FormData();
        formData.append('file0', this.state.file1[0]);
        var servername = await this.getServername()
        var chords = this.state.selectedChords[0].toString()
        var firstChord = true
        this.state.selectedChords.forEach(item =>{
            if(firstChord==true){
                firstChord=false
            }
            else{
                chords = chords.concat(" ")
                chords = chords.concat(item.toString())
            }
        })
        console.log("7777777")
        console.log(chords)
        chords = chords.replace("#","d")
        console.log(chords)
        var url = `${(servername)}/api/v1/compose/monophonic/improv_rnn/v0?length=${(this.state.length)}&temperature=${(this.state.temperature)}&primer_midi_track=2&backing_chords=${chords}`
        console.log(encodeURI(url))
        fetch(encodeURI(url), {
            // content-type header should not be specified!
            method: 'POST',
            body: formData
          })
            .then(response => response.blob())
            .then( blob => saveAs(blob, 'music.mid'))
            .then(success => {this.setState({
                isLoading: false,
                buttonState: 'success',
                hasResult: true,
                downloadLink: '' //insert download link...,
            })}).catch((error) => {
                    toast.error("Something went wrong. Please try again later");
                    this.setState({
                        isLoading: false,
                        buttonState: 'error',
                        hasResult: false,
                    });
                })
    }


    treatClick() {
        this.setState({
            selectedChords: []
        });
    }

    render() {
        const handle = props => {
            const { value, dragging, index, ...restProps } = props;
            return (
                <SliderTooltip
                    prefixCls="rc-slider-tooltip"
                    overlay={`${value}`}
                    visible={dragging}
                    placement="top"
                    key={index}
                >
                    <Handle value={value} {...restProps} />
                </SliderTooltip>
            );
        };

        const selectedStyle = {
            color: 'white',
            backgroundColor: 'black',
            border: 'solid white 1px',
            marginBottom: '20px',
        };
        const generateStyle = {
            padding: '20px',
        };
        return(
            <>
                <div className="scratch">
                    <Link to="/studio">back to studio</Link>
                    <h4>Jam Session</h4>
                    <p>Write your own notes, upload your unfinished piece and get rid of the inspiration block.
                        Be creative and make any musical piece your own by tweaking the settings.
                    </p>
                    <div className="files">
                        <ResultTile isLoading={this.state.isLoading} downloadLink={this.state.downloadLink} fileName={"File 1 into File 2"} hasResult={this.state.hasResult}></ResultTile>
                    </div>
                    <h5>Options</h5>
                    <div className="maxislider">
                        <h6>Chord Length</h6>
                        <Slider min={1} max={100} defaultValue={16} handle={handle} step={1} onChange={value => {this.setState({length: value})}}/>
                    </div>
                    <div className="maxislider">
                        <h6>Temperature</h6>
                        <Slider min={0} max={2} defaultValue={1} handle={handle} step={0.1} onChange={value => {this.setState({temperature : value})}}/>
                    </div>
                    <h6>Write your chords</h6>
                    <div className="files">
                        <a onClick={this.treatClick}>reset</a>
                        <ReactAutocomplete
                            menuStyle={{
                                borderRadius: '3px',
                                boxShadow: '0 0px 0px rgba(0, 0, 0, 0.1)',
                                background: 'black',
                                padding: '5px 0px',
                                fontSize: '18px',
                                fontFamily: 'Arial',
                                border: '1px solid white',
                                position: 'fixed',
                                overflow: 'auto',
                                maxHeight: '50%', // TODO: don't cheat, let it flow to the bottom
                            }}
                            items={this.state.chords}
                            shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                            getItemValue={item => item.label}
                            renderItem={(item, highlighted) =>
                                <div
                                    key={item.id}
                                    style={{ backgroundColor: highlighted ? '#7038FF' : 'black'}}
                                >
                                    {item.label}
                                </div>
                            }
                            value={this.state.value}
                            onChange={e => this.setState({ value: e.target.value })}
                            onSelect={e => {
                                var listTemp = this.state.selectedChords;
                                listTemp.push(e);
                                this.setState({value: '', selectedChords: listTemp});
                                //console.log(this.state.selectedChords)
                            }}
                        />
                        {this.state.selectedChords.map(item => (
                            <div className="chip" >
                                <p>{item}</p>
                            </div>
                        ))}

                    </div>
                    <h5>Upload your file (optional)</h5>
                    <div className="files">
                        {this.state.file1.length == 1 ?
                            <FileTile fileName={this.state.file1[0].name} downloadLink={""}></FileTile>
                            : <Dropzone onDrop={this.onDrop1} maxFiles={1}>
                                {({getRootProps, getInputProps}) => (
                                    <section>
                                        <div className="tile" {...getRootProps()}>
                                            <h4>Upload File</h4>
                                            <div className="zone">
                                                <input {...getInputProps()} />
                                                <p>Drag & drop up your file here, or click to select a file</p>
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>}
                    </div>
                    <h6><br/> </h6>
                    <ProgressButton onClick={this.generateFile} state={this.state.buttonState}>
                        Generate
                    </ProgressButton>
                    <h5> </h5>

                </div>
            </>
        )

    }
}