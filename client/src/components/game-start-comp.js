import React from 'react';
import './map.css';

export default class StartGameComp extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: ""
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		e.nativeEvent.preventDefault();
		this.props.startGame().then(r => {
			this.props.refetch();
		});
	}

	render() {
		return (
			<form className="game-ctrl" onSubmit={this.handleSubmit}>
				<input type="submit" value="Start Game" />
			</form>
		);
	}
}
