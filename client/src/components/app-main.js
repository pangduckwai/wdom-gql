import React from 'react';
import Map from './map';
import Greetings from './greetings';
import Register from './register';
import OpenGame from './game-open';
import ListGames from './game-list';
import StartGame from './game-start';
import GameJoiners from './game-joiners';
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

	// componentDidMount() {
	// 	// const { data: eventBroadcasted, loading } = useSubscription(BROADCAST_EVENT);
	// 	this.props.subscribe({
	// 		document: BROADCAST_EVENT
	// 	});
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

	render() {
		const registed = this.props.player && !this.props.player.joined;
		const joined = this.props.player && this.props.player.joined;
		return (
			<div className="game">
				<Map
					selected={this.state.selected}
					focused={this.state.focused}
					player={this.props.player}
					players={this.props.players}
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
							<ListGames refetch={this.props.refetch} />
						</>
					}
					{joined &&
						<div className="title bb mt mb">Game <span className="name">{this.props.player.joined.name}</span></div>
					}
					{(joined && (this.props.player.joined.host.token === this.props.player.token) && (this.props.player.joined.rounds < 0)) &&
						<>
							<GameJoiners refetch={this.props.refetch} token={this.props.player.joined.token} />
							<StartGame refetch={this.props.refetch} />
						</>
					}
					{(joined && (this.props.player.joined.host.token !== this.props.player.token) && (this.props.player.joined.rounds < 0)) &&
						<>
							<GameJoiners refetch={this.props.refetch} token={this.props.player.joined.token} />
							<div className="msg mt mb">Wait for game to start...</div>
						</>
					}
					{(joined && (this.props.player.joined.rounds >= 0)) &&
						<span>Playing game...</span>
					}
				</div>
			</div>
		);
	}
}
