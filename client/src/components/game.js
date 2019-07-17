import React from 'react';
import Territory from './territory';
import { MAP, LINK, LINE } from './constants';
import 'whatwg-fetch';

export default class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			round: 0,
			selected: "",
			focused: "",
			players: [],
			owners: []
		};
	}

	// TODO TEMP: should called after game start, not in this lifecycle method.
	componentDidMount() {
		fetch("http://localhost:54321/game/starting/12345678")
			.then(res => res.json())
			.then(
				(result) => {
					console.log(result);
					this.setState({
						players: result.players,
						owners: result.owners
					});
				},
				(error) => {
					this.setState({
						players: [],
						owners: {}
					});
				}
			);
	}

	handleHover(value, e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();

		this.setState({
			focused: value
		});
	}

	handleClick(value, e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();

		this.setState({
			selected: value,
			focused: value
		});
	}

	handleClear() {
		this.setState({selected: ""});
	}

	handleUnhover() {
		this.setState({focused: ""});
	}

	render() {
		const curr = (this.state.selected !== "") ? LINK[this.state.selected].connected : [];

		return (
			<svg className="app-game fillv map-game" viewBox="0 0 1227 628"
				onClick={this.handleClear.bind(this)}
				onMouseOver={this.handleUnhover.bind(this)}>

				{LINE.map((points, i) =>
					<line key={i} x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]} />)}

				{Object.keys(MAP).map((key) =>
					(<Territory
						key={key} tid={key}
						player={(this.state.owners[key] != null) ? this.state.owners[key] : 0}
						army={(this.state.owners[key] != null) ? 1 : 0}
						sel={key === this.state.selected}
						lnk={curr.includes(key)}
						onClick={this.handleClick.bind(this, key)}
						onMouseOver={this.handleHover.bind(this, key)} />))}

				<text className="tname" x="560" y="590">
					{(this.state.selected === "") ? this.state.focused : this.state.selected}
				</text>
			</svg>
		);
	}
}
