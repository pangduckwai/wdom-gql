import React from 'react';
import { MAP, LINK, LINE } from '../constants';
import Territory from './territory';
import './map.css';

export default function Map(props) {
	const curr = (props.selected !== "") ? LINK[props.selected].connected : [];

	const territories = (props.player && props.player.joined) ? props.player.joined.territories :
		Object.keys(MAP).map((key) => {
			const t = {};
			t.name = key;
			return t;
		});

	const playerIdx = {};
	for (let i = 0; i < props.players.length; i ++) {
		playerIdx[props.players[i].name] = i + 1;
	}

	return (
		<svg viewBox="0 0 1225 628" preserveAspectRatio="xMidYMid meet"
			onClick={props.handleClear}
			onMouseOver={props.handleUnhover}>

			{LINE.map((points, i) =>
				<line key={i} x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]} />)}

			{territories.map((territory) =>
				(<Territory
					key={territory.name} tid={territory.name}
					player={(territory.owner) ? playerIdx[territory.owner.name] || 0 : 0}
					army={territory.troops || 0}
					sel={territory.name === props.selected}
					lnk={curr.includes(territory.name)}
					onClick={props.handleClick}
					onMouseOver={props.handleHover} />))}

			<text className="tname" x="450" y="590">
				Territory: {(props.selected === "") ? props.focused : props.selected}
			</text>

			{(props.player && props.player.joined) &&
				<>
					<polyline
						className={`player${playerIdx[props.player.name]}`}
						points="870,588 870,548 910,558 870,568" />
					<text className="tname" x="814" y="590">Player: {props.player.name}</text>
				</>
			}
		</svg>
	);
}
