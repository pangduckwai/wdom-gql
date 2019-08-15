import React from 'react';
import './map.css';

export default class ListGamesComp extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			value: ""
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
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

	handleSelect(e) {
		this.setState({ value: e.target.value });
	}

	render() {
		//TODO TEMP!!!!!!!!!!1
		if (this.props.games.length < 5) {
			this.props.games.push({
				key: "A123456789001",
				token: "A123456789001",
				name: "Dummy Game 1",
				host: { name: "Dummy1" }
			});
			this.props.games.push({
				key: "A123456789002",
				token: "A123456789002",
				name: "Dummy Game 2",
				host: { name: "Dummy2" }
			});
			this.props.games.push({
				key: "A123456789003",
				token: "A123456789003",
				name: "Dummy Game 3",
				host: { name: "Dummy3" }
			});
			this.props.games.push({
				key: "A123456789004",
				token: "A123456789004",
				name: "Dummy Game 4",
				host: { name: "Dummy4" }
			});
		}

		return (
			<form onSubmit={this.handleSubmit}>
				<ul className="list" onChange={this.handleSelect}>
					{this.props.games.map((game) =>
						(<li key={game.token}>
							<input
								type="radio"
								name="choose"
								value={game.token} />
							{game.name} (host: {game.host.name})
						</li>)
					)}
				</ul>
				<input type="submit" value="Join" />
			</form>
		);
	}
}
