import React from 'react';
import Map from './map';
import Register from './register';
import OpenGame from './open-game';
import './map.css';
import ListGames from './list-games';

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
			game: {},
			owners: []
		};

		this.handleClear = this.handleClear.bind(this);
		this.handleUnhover = this.handleUnhover.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleHover = this.handleHover.bind(this);
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
	// Component <Territory /> //
	// handleRegister() {
	// 	console.log("Hello");
	// 	this.props.refetch();
	// 	console.log("there");
	// }
	/////////////////////////////

	render() {
		const map = (
			<Map
				selected={this.state.selected}
				focused={this.state.focused}
				owners={this.state.owners}
				handleClear={this.handleClear}
				handleUnhover={this.handleUnhover}
				handleClick={this.handleClick}
				handleHover={this.handleHover} />
		);

		if (!this.props.player || !this.props.player.token) {
			return (
				<div className="game">
					{map}
					<div className="control">
						<div className="title">Register as a player</div>
						<Register
							refetch={this.props.refetch} />
					</div>
				</div>
			);
		} else if (!this.state.game.token) {
			return (
				<div className="game">
					{map}
					<div className="control">
						<div className="title">Welcome <span className="label">{this.props.player.name}</span></div>
						<OpenGame
							refetch={this.props.refetch} />
						<div className="title bt mt">Available Games</div>
						<ListGames
							refetch={this.props.refetch} />
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
