import React from 'react';
import './map.css';

export default class GreetingsComp extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		e.nativeEvent.preventDefault();
		this.props.action().then(r => {
			this.props.refetch();
		});
	}

	render() {
		return (
			<form id="greeting" onSubmit={this.handleSubmit}>
				<label className="title">Welcome <span className="name">{this.props.player.name}</span></label>
				<input type="submit" value="&times;" />
			</form>
		);
	}
}
