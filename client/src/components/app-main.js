import React from 'react';
import Map from './map';
import Greetings from './greetings';
import Register from './register';
import OpenGame from './game-open';
import ListGames from './game-list';
import StartGame from './game-start';
import './map.css';

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

export default class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selected: "",
			focused: ""
		};

		this.handleClear = this.handleClear.bind(this);
		this.handleUnhover = this.handleUnhover.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleHover = this.handleHover.bind(this);
	}

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

	render() {
		const registed = this.props.player && !this.props.player.joined;
		const joined = this.props.player && this.props.player.joined;
		return (
			<div className="game">
				<Map
					selected={this.state.selected}
					focused={this.state.focused}
					territories={this.props.player.joined.territories}
					handleClear={this.handleClear}
					handleUnhover={this.handleUnhover}
					handleClick={this.handleClick}
					handleHover={this.handleHover} />
				<div className="control">
					{(!this.props.player || !this.props.player.token) ? (
						<Register refetch={this.props.refetch} />
					) : (
						<Greetings player={this.props.player} refetch={this.props.refetch} />
					)}
					{registed &&
						<>
							<OpenGame refetch={this.props.refetch} />
							<div className="title bt mt">Available Games</div>
							<ListGames refetch={this.props.refetch} />
						</>
					}
					{(joined && (this.props.player.joined.host.token === this.props.player.token) && (this.props.player.joined.rounds < 0)) &&
						<>
							<StartGame refetch={this.props.refetch} />
							<ul>
								<li>TODO!!!</li>
								<li>Add subscription here...</li>
								<li>... to display latest list of players...</li>
								<li>... who joined this game.</li>
							</ul>
						</>
					}
					{(joined && (this.props.player.joined.host.token !== this.props.player.token) && (this.props.player.joined.rounds < 0)) &&
						<span>Wait for game to start...</span>
					}
					{(joined && (this.props.player.joined.rounds >= 0)) &&
						<span>Playing game...</span>
					}
				</div>
			</div>
		);
	}
}
