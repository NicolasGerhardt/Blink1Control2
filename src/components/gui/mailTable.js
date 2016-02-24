"use strict";

var React = require('react');

var Table = require('react-bootstrap').Table;
var Button = require('react-bootstrap').Button;

var remote = window.require('remote');
var PatternsService = remote.require('./server/patternsService');
var config = remote.require('./configuration');

var MailForm = require('./mailForm');

var MailTable = React.createClass({
	propTypes: {
		//events: React.PropTypes.array.isRequired,
		//onClear: React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		var rules = config.readSettings('mailRules');
		if( !rules ) { rules = []; }
		return {
			rules: rules,
			workingIndex:-1,
			showForm: false
		};
	},
	saveRules: function(rules) {
		this.setState({rules: rules});
		config.saveSettings("mailRules", rules);
	},
	editRule: function(n) {
		console.log("MailTable.editRule:", n);
		this.openForm(n);
	},
	addRuleByForm: function() {
		//this.setState({workingrule: {name: 'poopy butt', patternId: 'whiteflashes'}});
		// this.setState({workingIndex: -1}); // -1 means new rule
		this.openForm(-1);
	},
	deleteRule: function(idx) {
		console.log("MailTable.deleteRule:", idx);
		var rules = this.state.rules;
		delete rules[idx];
		this.saveRules(rules);
	},
	deleteRuleEdit: function() {
		console.log("MailTable.deleteRuleEdit:", this.state.workingIndex);
		if( this.state.workingIndex !== -1 ) {
			this.deleteRule( this.state.workingIndex );
			this.setState( {workingIndex: -1} );
		}
		this.cancelForm();
	},
	openForm: function(idx) {
        console.log("MailTable.openForm",idx, this.state);
		this.setState( { workingIndex: idx } );
        this.setState({ showForm: true });
    },
	saveForm: function(data) {
        console.log("MailTable.saveForm:",data, "workingIndex:", this.state.workingIndex);
		var rules = this.state.rules;
		var rulenew = data;
		if( this.state.workingIndex === -1 ) { // new rule
			rules.unshift( rulenew );
		}
		else {
			rules[this.state.workingIndex] = rulenew;
		}
		this.saveRules(rules);
        this.setState({ showForm: false });
    },
	cancelForm: function() {
        console.log("MailTable.cancelForm");
        this.setState({ showForm: false });
    },

	render: function() {
		var formrule = { name: 'some new thing', patternId: 'whiteflashes'}; // FIXME:
		if (this.state.workingIndex !== -1) { // not new
			formrule.name = this.state.rules[this.state.workingIndex].name;
			formrule.patternId = this.state.rules[this.state.workingIndex].patternId;
		}

		var createRow = function(rule, index) {
			//var deleteButton = <button onClick={this.deleteRule.bind(this, index)}><i className="fa fa-times"></i></button>;
			var	patternCell = PatternsService.getNameForId( this.state.rules[index].patternId );  // just text
			var lastTime = rule.lastTime || '-not seen yet-';
			var source = rule.source || 'n/a';
			return (
					<tr key={index} onDoubleClick={this.editRule.bind(this, index, rule.name)} >
						<td >{rule.name}</td>
						<td >{rule.username}</td>
						<td >{patternCell}</td>
						<td>{lastTime}</td>
						<td >{source}</td>
						<td><Button bsSize="xsmall" onClick={this.editRule.bind(this, index, rule.name)} >edit</Button></td>
					</tr>
			);
		};

		return (
			<div style={{position: "relative", height: 200}}>

				<MailForm show={this.state.showForm} rule={formrule}
					onSave={this.saveForm} onCancel={this.cancelForm} onDelete={this.deleteRuleEdit} />

				<div style={{display: "block", overflowY: "scroll", height: 150}}>
					<Table bordered condensed hover style={{fontSize:"0.9em"}}>
						<thead>
							<tr>
								<th>Description</th>
								<th>Mail info</th>
								<th>Pattern</th>
								<th>Last Event</th>
								<th>something</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{this.state.rules.map( createRow, this )}
						</tbody>
					</Table>
					<div style={{position: "absolute", bottom: 20}}>
						<Button bsSize="xsmall" onClick={this.addRuleByForm} ><i className="fa fa-plus"></i> add rule</Button>
					</div>
				</div>
			</div>
        );
	}

});

module.exports = MailTable;
