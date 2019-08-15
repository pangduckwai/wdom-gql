import React from 'react';
import './map.css';

export default class ListGamesComp extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: ""
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		// this.handleSelect = this.handleSelect.bind(this);
	}

	handleChange(e) {
		this.setState({ value: e.target.value });
	}

	handleSubmit(e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		e.nativeEvent.preventDefault();
		// this.props.openGame({ variables: { name: this.state.name }}).then(r => {
		// 	this.props.refetch();
		// });
		console.log("Selected", this.state.value);
	}
	// handleSelect(e) {
	// 	console.log(e.target.value);
	// }

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<select value={this.state.value} onChange={this.handleChange}>
					{this.props.games.map((game) =>
						(<option key={game.token} value={game.token}>
							{game.name}
						</option>)
					)}
				</select>
				<input type="submit" value="Join" />
			</form>
		);
	}
}
