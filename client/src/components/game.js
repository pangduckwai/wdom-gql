import React from 'react';
import Map from './map';
import Register from './register';

let convert = (tid) => {
	const buff = tid.split("");
	let found = true;
	for (let i = 0; i < buff.length; i ++) {
		if (found) {
			found = false;
			buff[i] = buff[i].toUpperCase();
		} else if (buff[i] === '-') {
			found = true;
		}
	}
	return buff.join("");
};

export default class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: "",
			focused: "",
			player: {},
			game: {},
			owners: []
		};
	}

	// TODO TEMP: should called after game start, not in this lifecycle method.
	// componentDidMount() {
	// 	fetch("http://localhost:54321/game/starting/12345678")
	// 		.then(res => res.json())
	// 		.then(
	// 			(result) => {
	// 				console.log(result);
	// 				this.setState({
	// 					players: result.players,
	// 					owners: result.owners
	// 				});
	// 			},
	// 			(error) => {
	// 				this.setState({
	// 					players: [],
	// 					owners: {}
	// 				});
	// 			}
	// 		);
	// }

	////////////////////////
	// Component <Game /> //
	handleClear() {
		this.setState({selected: ""});
	}

	handleUnhover() {
		this.setState({focused: ""});
	}

	/////////////////////////////
	// Component <Territory /> //
	handleHover(e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();

		if (typeof(e.target.dataset.tid) !== "undefined") {
			this.setState({
				focused: convert(e.target.dataset.tid)
			});
		}
	}

	handleClick(e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();

		if (typeof(e.target.dataset.tid) !== "undefined") {
			const value = convert(e.target.dataset.tid);
			this.setState({
				selected: value,
				focused: value
			});
		}
	}
	/////////////////////////////

	render() {
		const map = (
			<Map
				selected={this.state.selected}
				focused={this.state.focused}
				owners={this.state.owners}
				handleClear={this.handleClear.bind(this)}
				handleUnhover={this.handleUnhover.bind(this)}
				handleClick={this.handleClick.bind(this)}
				handleHover={this.handleHover.bind(this)} />
		);

		if (!this.state.player.token) {
			return (
				<div className="game">
					{map}
					<Register />
				</div>
			);
		} else if (!this.state.game.token) {
			return (
				<div className="game">
					{map}
					<div className="control">
						Join a game / Create a new game
					</div>
				</div>
			);
		} else {
			return (
				<div className="game">
					{map}
					<div className="control">
						Play game
					</div>
				</div>
			);
		}
	}
}
