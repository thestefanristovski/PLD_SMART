import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import ImagePicker from "react-image-picker";
import { Multiselect } from 'multiselect-react-dropdown';
import ProgressButton from "react-progress-button";

import ResultTile from "./ResultTile";

import { saveAs } from 'file-saver';
import alternative from "../images/alternative.png"
import disco from "../images/disco.png"
import electronic from "../images/electronic.png"
import hiphop from "../images/hip hop.png"
import indie from "../images/indie.png"
import jazz from "../images/jazz.png"
import rock from "../images/rock.png"
import pop from "../images/pop.png"
import hardrock from "../images/hardrock.png"
import metal from "../images/metal.png"
import flamenco from "../images/flamenco.png"
import classical from "../images/classical.png"
import xmark from "../images/xmark.png"

//import 'react-image-picker/dist/index.css'
import '../imagepicker.css'
import ReactAutocomplete from "react-autocomplete";
import Slider, {Handle, SliderTooltip} from "rc-slider";
const superagent = require('superagent');
const styleList = [alternative, disco, electronic, hiphop, indie, jazz, rock];

export default class Scratch1Comp extends Component{
    constructor(props) {
        super(props)
        this.state = {
            image: null,
            artistOptions: [{name: 'Loading...', id: 1},{name: 'Make sure you have selected a style', id: 2},],
            selectedArtists: null,
            instrumentOptions: [{name: 'guitar', id: 1},{name: 'piano', id: 2},{name: 'drums', id: 3},{name: 'bass', id: 4}, {name: 'strings', id: 4}],
            selectedInstruments: null,
            buttonState: '',
            isLoading: false,
            hasResult:false,
            downloadLink: '',
            fileName: 'New Creation',
            length: 50,
            songs: ['Loading...', 'Make sure the previous fields are filles',],
            selectedSongs: [],
            value: '',
            styleOptions: [{name: 'Loading...', id: 1},{name: 'Make sure you have selected an instrument', id: 2},],
            selectedStyles: null
        }
        this.onPick = this.onPick.bind(this);
        this.generateFile = this.generateFile.bind(this);
        this.onSelectArtist = this.onSelectArtist.bind(this);
        this.onRemoveArtist = this.onRemoveArtist.bind(this);
        this.onSelectInstrument = this.onSelectInstrument.bind(this);
        this.onRemoveInstrument = this.onRemoveInstrument.bind(this);
        this.onSelectStyle = this.onSelectStyle.bind(this);
        this.onRemoveStyle = this.onRemoveStyle.bind(this);
        this.handleClickChip = this.handleClickChip.bind(this);
    }


    onPick(image) {
        this.setState({image})
    }

    async onSelectArtist(selectedList, selectedItem) {
        this.setState({
            selectedArtists: selectedList
        });
        var songsList;
        var servername = await this.getServername()
        //var myList = await this.getList()
        //console.log("+++");
        //console.log(myList);
        console.log("98984")
        console.log(this.state.selectedInstruments)
        const url = `${(servername)}/search/artists?artist=${(selectedItem.name)}&instrument=${(this.state.selectedInstruments.name)}`
        var responseSongsList = await fetch(url, 
            {
                headers : { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
            }})
            .then( (responseSongsList) => songsList =  responseSongsList.json() )
            .then (json => {
                songsList = json
                console.log(json) 
                console.log("\\\\\\")
                console.log(songsList.artists)
                var tempList = []
                songsList.artists.forEach(item => {
                    tempList.push(item)                        
                })
                this.setState({
                    songs:tempList
                })
            }
            )


    }

    onRemoveArtist(selectedList, removedItem) {
        this.setState({
            selectedArtists: selectedList
        })
    }

    async onSelectInstrument(selectedList, selectedItem) {
        this.setState({
            selectedInstruments: selectedItem
        })
        var styleList;
        var servername = await this.getServername()
        //var myList = await this.getList()
        //console.log("+++");
        //console.log(myList);
        const url = `${(servername)}/search/instruments?instrument=${(selectedItem.name)}`
        var responseStyleList = await fetch(url, 
            {
                headers : { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
            }})
            .then( (responseStyleList) => styleList =  responseStyleList.json() )
            .then (json => {
                styleList = json
                console.log(json) 
                console.log("//////")
                console.log(styleList.genre)
                var tempList = []
                var index = 1
                styleList.genre.forEach(item => {
                    tempList.push({name: item , id:index})
                        index = index +1                        
                })
                this.setState({
                    styleOptions:tempList
                })
            }
            )            
        
    }

    onRemoveInstrument(selectedList, removedItem) {
        this.setState({
            selectedInstruments: selectedList
        })
    }

    async onSelectStyle(selectedList, selectedItem) {
        this.setState({
            selectedStyles: selectedItem
        })
        var artistList;
        var servername = await this.getServername()
        //var myList = await this.getList()
        //console.log("+++");
        //console.log(myList);
        console.log(this.state.selectedInstruments)
        console.log(this.state.selectedInstruments.name)
        const url = `${(servername)}/search/genres?genre=${(selectedItem.name)}&instrument=${(this.state.selectedInstruments.name)}`
        var responseArtistList = await fetch(url, 
            {
                headers : { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
            }})
            .then( (responseArtistList) => artistList =  responseArtistList.json() )
            .then (json => {
                artistList = json
                console.log(json) 
                console.log("//////")
                console.log(artistList.artists)
                var tempList = []
                var index = 1
                artistList.artists.forEach(item => {
                    tempList.push({name: item , id:index})
                        index = index +1                        
                })
                this.setState({
                    artistOptions:tempList
                })
            }
            )


    }

    onRemoveStyle(selectedList, removedItem) {
        this.setState({
            selectedStyles: selectedList
        })
    }

    handleClickChip(item) {
        console.log(item);
        var tempList = this.state.selectedSongs;
        tempList = tempList.filter(x=> x!= item);
        this.setState({
            selectedSongs: tempList,
        });
    }

    async getServername(){
        var servername;
        var styleList;
        const responseServerName = await superagent.get('http://127.0.0.1:5000/')
        servername = JSON.parse(responseServerName.text).idd
        return servername
    }

    async getList(adress){
        var servername;
        var styleList;
        const responseServerName = await superagent.get(`${adress}`)
        servername = JSON.parse(responseServerName.text())
        return servername
    }


    async generateFile() {
        //call code to generate file and get download link
        //wait until complete
        //when complete
        console.log("startofGeneration");
        var mySongs = {midi:this.state.selectedSongs}
        console.log(JSON.stringify(mySongs))

        var servername = await this.getServername()
        //var myList = await this.getList()
        //console.log("+++");
        //console.log(myList);
        console.log("9999999999999999")
        //console.log(data)
        const url = `${(servername)}/api/v1/compose/monophonic/lstm/firebase/v0?length=${(this.state.length)}`
        var responseSongsList = await fetch(url, 
            {
                method: 'POST',
                body: JSON.stringify(mySongs),
            }).then(response => response.blob())
            .then(
                blob => {saveAs(blob, 'musici.mid')
                console.log(blob)})
            .then(success => {
            this.setState({
            isLoading: true,
            buttonState: 'loading',
        })})

        //this.generateRandomMusicRequest()
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
        return(
            <>
                <div className="scratch">
                    <Link to="/studio">back to studio</Link>
                    <h4>Make from Scratch</h4>
                    <p>Create a completely new musical piece with one or multiple instruments. Choose
                        between multiple musical styles, artists of inspiration, and types of instruments
                        to make every unique piece your own. Uses the MuseGAN and LSTM algorithms.</p>
                    <Link to="/scratch5">5 instruments</Link><a style={selectedStyle}>1 instrument</a>
                    <p><br/></p>
                    <ResultTile isLoading={this.state.isLoading} downloadLink={this.state.downloadLink} fileName={this.state.fileName} hasResult={this.state.hasResult}></ResultTile>
                    <h5>Options</h5>
                    <div className="scratch1">
                        <h6>Maximum Length</h6>
                        <div className="maxislider">
                            <Slider min={0} max={500} defaultValue={100} handle={handle} step={1} onChange={value => {this.setState({length: value})}} />
                        </div>
                        <h6>Choose an instrument</h6>
                        <Multiselect
                            options={this.state.instrumentOptions} // Options to display in the dropdown
                            onSelect={this.onSelectInstrument} // Function will trigger on select event
                            onRemove={this.onRemoveInstrument} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown op
                            singleSelect
                            id="css_custom"
                            style={ {multiselectContainer: {width: '600px'}, searchBox:{color: 'black', border: 'solid white 2px', borderRadius:'0px'}, optionContainer: {backgroundColor: 'black', fontFamily: 'Arial', border: 'solid white 1px', borderRadius: '0px'}, chips: {backgroundColor: '#6EC3F4', fontFamily: 'Arial'}, } }
                        />
                    </div>
                    <div className="scratch1">
                        <h6>Choose your style</h6>
                        <Multiselect
                            options={this.state.styleOptions} // Options to display in the dropdown
                            onSelect={this.onSelectStyle} // Function will trigger on select event
                            onRemove={this.onRemoveStyle} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown op
                            singleSelect
                            id="css_custom"
                            style={ {multiselectContainer: {width: '600px'}, searchBox:{color: 'black', border: 'solid white 2px', borderRadius:'0px'}, optionContainer: {backgroundColor: 'black', fontFamily: 'Arial', border: 'solid white 1px', borderRadius: '0px'}, chips: {backgroundColor: '#6EC3F4', fontFamily: 'Arial'}, } }
                        />
                        <h6>Choose an artist of inspiration</h6>
                        <Multiselect
                            options={this.state.artistOptions} // Options to display in the dropdown
                            onSelect={this.onSelectArtist} // Function will trigger on select event
                            onRemove={this.onRemoveArtist} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown op
                            closeIcon = "circle" // tions
                            id="css_custom"
                            style={ {multiselectContainer: {width: '600px'}, searchBox:{color: 'black', border: 'solid white 2px', borderRadius:'0px'}, optionContainer: {backgroundColor: 'black', fontFamily: 'Arial', border: 'solid white 1px', borderRadius: '0px'}, chips: {backgroundColor: '#6EC3F4', fontFamily: 'Arial'}, } }
                        />
                    </div>
                    <h6>Choose songs</h6>
                    <div className="files">
                        <ReactAutocomplete
                            menuStyle={{
                                width: '400px',
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
                            items={this.state.songs}
                            shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
                            getItemValue={item => item}
                            renderItem={(item, highlighted) =>
                                <div
                                    key={item.id}
                                    style={{ backgroundColor: highlighted ? '#7038FF' : 'black'}}
                                >
                                    {item}
                                </div>
                            }
                            value={this.state.value}
                            onChange={e => this.setState({ value: e.target.value })}
                            onSelect={e => {
                                var listTemp = this.state.selectedSongs;
                                if(!listTemp.includes(e)) {
                                    listTemp.push(e);
                                }
                                this.setState({value: '', selectedSongs: listTemp});
                            }}
                        />
                        {this.state.selectedSongs.map(item => (
                            <div className="chip" onClick={this.handleClickChip.bind(this, item)}>
                                <p>{item}</p>
                                <img src={xmark}/>
                            </div>
                        ))}
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

//FOR LATER
//<ImagePicker
//    images ={styleList.map((image, i) => ({src: image, value: i}))}
//    onPick ={this.onPick}
///>