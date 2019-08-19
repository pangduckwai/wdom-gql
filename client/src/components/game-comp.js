import React from 'react';
import './map.css';

export default class GamesComp extends React.Component {
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
		this.props.joinGame({ variables: { token: this.state.value }}).then(r => {
			this.props.refetch();
		});
	}

	handleSelect(e) {
		this.setState({ value: e.target.value });
	}

	render() {
		return (
			<>
				<div className="title bt mt mb">Available Games</div>
				<form className="game-ctrl" onSubmit={this.handleSubmit}>
					<ul className="list" onChange={this.handleSelect}>
						{this.props.games.map((game) =>
							(<li key={game.token}>
								<input
									type="radio"
									name="choose"
									value={game.token} />
								<label>{game.name} (host: {game.host.name})</label>
							</li>)
						)}
					</ul>
					<input type="submit" value="Join" />
				</form>
			</>
		);
	}
}
