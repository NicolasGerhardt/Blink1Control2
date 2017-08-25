"use strict";

var React = require('react');

// var Grid = require('react-bootstrap').Grid;
// var Row = require('react-bootstrap').Row;
// var Col = require('react-bootstrap').Col;
// var Well = require('react-bootstrap').Well;
// var Form = require('react-bootstrap').Form;
// var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
// var ButtonInput = require('react-bootstrap').ButtonInput;
var ButtonGroup = require('react-bootstrap').ButtonGroup;

var log = require('../../logger');
var Blink1Service = require('../../server/blink1Service');

// var ColorPicker = require('react-color');

var HtmlColorChart = require('./htmlColorChart');
var tinycolor = require('tinycolor2');


var Blink1ColorPicker = React.createClass({
    getInitialState: function() {
        return {
            color: "#33dd33", // color is a hex string, not a tinycolor (had issues with using tinycolor here)
            secs: 0.1,
            ledn: 0,
            r: 0, // FIXME: should use color but easier & cleaner this way
            g: 1,
            b: 2,
            blink1Id: "0",
        };
    },
    componentDidMount: function() {
        log.msg("Blink1ColorPicker.componentDidMount",this.state.color);
        Blink1Service.addChangeListener( this.updateCurrentColor, "blink1ColorPicker" );
    },
    /**  Callback for Blink1Service notifyChange */
    updateCurrentColor: function() {
        // FIXME: the Blink1Service callback is crusty now
        var blink1Id = Blink1Service.getCurrentBlink1Id();
        var colr = Blink1Service.getCurrentColor( blink1Id );
        var secs = Blink1Service.getCurrentMillis( blink1Id ) / 1000;
        var ledn = Blink1Service.getCurrentLedN( blink1Id );
        var crgb = colr.toRgb();
        // log.msg("Blink1ColorPicker.updateCurrentColor, currentColor",colr.toHexString(), "ledn:",ledn, "blink1Id:",blink1Id);
        this.setState( {
            color: colr.toHexString(),
            colorHex: colr.toHexString().toUpperCase(),
            ledn: ledn,
            r: crgb.r, g: crgb.g, b: crgb.b,
            secs:secs,
             blink1Id: blink1Id
        });
    },
    // called by HtmlColorChart  why are there two?
    setColorHex: function(color) {
        this.setColor( tinycolor(color) );
        // Blink1Service.fadeToColor( this.state.secs*1000, color, this.state.ledn, this.state.blink1Idx ); // FIXME: time
    },
    // called by colorpicker & handleChange{R,G,B}
    setColor: function(color) {
        // console.log("colorpicker.setColor",color.hex, this.state.ledn, this.state.blink1Idx);
        Blink1Service.fadeToColor( this.state.secs*1000, color, this.state.ledn, this.state.blink1Id ); // FIXME: time
        // and the above will call 'fetchBlink1Color' anyway
        // there must be a better way to do this
    },
    // called by ledn buttons
    setLedN: function(n) {
        Blink1Service.setCurrentLedN(n); // doesn't trigger an updateCurrentColor?
        this.setState({ledn: n});
    },
    handleChangeSecs: function(event) {
        var secs = event.target.value;  // FIXME
        Blink1Service.setCurrentMillis(secs*1000); // doesn't trigger an updateCurrentColor?
        this.setState({secs: secs});
    },
    handleChangeR: function(event) {
        var number = event.target.value;
        number = ( number < 0 ) ? 0 : (number>255) ? 255 : number;
        // this.setState({r:number});
        var tc = tinycolor( {r:number, g:this.state.g, b:this.state.b} );
        this.setColor( tc );
    },
    handleChangeG: function(event) {
        var number = event.target.value;
        if(isNaN(number)) { console.log("not a number"); return; }
        number = ( number < 0 ) ? 0 : (number>255) ? 255 : number;
        // this.setState({g:number});
        var tc = tinycolor( {r:this.state.r, g:number, b:this.state.b} );
        this.setColor( tc );
    },
    handleChangeB: function(event) {
        var number = event.target.value;
        number = ( number < 0 ) ? 0 : (number>255) ? 255 : number;
        // this.setState({b:number});
        var tc = tinycolor( {r:this.state.r, g:this.state.g, b:number} );
        this.setColor( tc );
    },
    handleHexChange: function(event) {
        var colorHex = event.target.value;
        var c = tinycolor(colorHex);
        if( c.isValid() ) {
            this.setColor( c );
        }
        this.setState({colorHex: colorHex.toUpperCase()});
    },
    handleBlink1IdChange: function(evt) {
        var id = evt.target.value;
        Blink1Service.setCurrentBlink1Id(id);
        this.setState( {blink1Id: id});
    },
    render: function() {
        var serials = Blink1Service.getAllSerials();
        var makeBlink1IdOption = function(serial,idx) {
            return <option value={serial} key={idx}>{serial}</option>;
        };
        var deviceCombo = (serials.length <= 1) ? null :
            <div> device:
                <select style={{fontSize:'80%'}} onChange={this.handleBlink1IdChange} value={this.state.blink1Id}>
                    {serials.map( makeBlink1IdOption )}
                </select>
            </div>;

        return (
                <div>
                    <HtmlColorChart handleClick={this.setColorHex} currentColor={this.state.color}/>
                    <div className="row" style={{paddingTop:5, fontSize:'0.9em'}}>
                        <ButtonGroup vertical className="col-sm-4">
                          <Button onClick={this.setLedN.bind(this, 0)} active={this.state.ledn===0}
                              bsSize="small" style={{padding:2,textAlign:'left'}} ><img width={20} height={14} src="images/iconLedAB.png" /> LED AB </Button>
                          <Button onClick={this.setLedN.bind(this, 1)} active={this.state.ledn===1}
                              bsSize="small" style={{padding:2,textAlign:'left'}} ><img width={20} height={14} src="images/iconLedA.png" /> LED A </Button>
                          <Button onClick={this.setLedN.bind(this, 2)} active={this.state.ledn===2}
                              bsSize="small" style={{padding:2,textAlign:'left'}} ><img width={20} height={14} src="images/iconLedB.png" /> LED B  </Button>
                        </ButtonGroup>
                        <table className="col-sm-4" style={{ border:'0px solid #ddd'}}>
                            <tbody>
                            <tr><td style={{textAlign:'right'}}>R:</td><td>
                                <input type="number" min={0} max={255} step={1} size={3}
                                    className="input" style={{textAlign:'right'}}
                                      value={this.state.r} onChange={this.handleChangeR}/></td></tr>
                            <tr><td style={{textAlign:'right'}}>G:</td><td>
                                <input type="number" min={0} max={255} step={1} size={3}
                                    className="input" style={{textAlign:'right'}}
                                      value={this.state.g} onChange={this.handleChangeG}/></td></tr>
                            <tr><td style={{textAlign:'right'}}>B:</td><td>
                                <input type="number" min={0} max={255} step={1} size={3}
                                    className="input" style={{textAlign:'right'}}
                                      value={this.state.b} onChange={this.handleChangeB}/></td></tr>
                            <tr><td style={{textAlign:'right'}}>hex:</td><td>
                                  <input type="text" size={7} className="input" style={{fontFamily:'monospace'}}
                                  value={this.state.colorHex} onChange={this.handleHexChange}/></td></tr>
                              </tbody>
                          </table>
                          <div className="col-sm-4">
                            time (sec):
                            <input type="number" className="input" min={0.1} max={10.0} step={0.1} size={3}
                                value={this.state.secs} onChange={this.handleChangeSecs} />
                            {deviceCombo}
                          </div>
                    </div>
                </div>
        );
    }
});

module.exports = Blink1ColorPicker;

// <div style={{ display: "inline-block", boxSizing: 'border-box', verticalAlign: "top"}}>
// 	<ColorPicker.default type="sketch" color={this.state.color} onChange={this.setColor} />
// </div>
// <div style={{ display: "inline-block", boxSizing: 'border-box', verticalAlign: "top"}}>
// 	<ButtonGroup vertical>
// 	  <Button onClick={this.setLedN.bind(this, 0)} active={this.state.ledn===0}>LED AB</Button>
// 	  <Button onClick={this.setLedN.bind(this, 1)} active={this.state.ledn===1}>LED A</Button>
// 	  <Button onClick={this.setLedN.bind(this, 2)} active={this.state.ledn===2}>LED B</Button>
// 	</ButtonGroup>
// </div>

// <form horizontal className="col-sm-8">
// 	<Input type="number" label="msec" value={this.state.millis}  onChange={this.handleChangeMillis}
// 		labelClassName="col-sm-6" wrapperClassName="col-sm-6" bsSize="small" />
// </form>
// <form horizontal className="col-sm-8">
// 	<Input type="number" label='R'
// 		labelClassName="col-sm-4" wrapperClassName="col-sm-8" bsSize="small" />
// 	<Input type="number" label='G'
// 		labelClassName="col-sm-4" wrapperClassName="col-sm-8" bsSize="small" />
// 	<Input type="number" label='B'
// 		labelClassName="col-sm-4" wrapperClassName="col-sm-8" bsSize="small" />
// </form>
