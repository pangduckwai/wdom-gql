import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { TAKE_ACTION } from '../mutations';
import { MAP, LINK, LINE } from '../consts';
import Territory from './territory';
import { convert } from '../utils';
import './map.css';

export default function Map(props) {
	const [focused, setFocused] = useState("");
	const [selected, setSelected] = useState("");

	const [takeAction, { loading, error }] = useMutation(TAKE_ACTION);

	const territories = (props.player && props.game) ? props.game.territories :
		Object.keys(MAP).map((key) => {
			const t = {};
			t.name = key;
			return t;
		});

	const territoryIdx = {};
	const playerIdx = {};
	if (props.player && props.game) {
		for (let i = 0; i < props.game.territories.length; i ++) {
			territoryIdx[props.game.territories[i].name] = i;
		}
		for (let i = 0; i < props.players.length; i ++) {
			playerIdx[props.players[i].name] = i + 1;
		}
	}

	const handleClear = (e) => {
		e.preventDefault();
		setSelected("");
	};

	const handleUnhover = (e) => {
		e.preventDefault();
		setFocused("");
	};

	const handleHover = (e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		if (typeof(e.target.dataset.tid) !== "undefined") {
			const value = convert(e.target.dataset.tid);
			setFocused(value);
		}
	};

	const handleClick = (e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();

		if (typeof(e.target.dataset.tid) === "undefined") return;
		const value = convert(e.target.dataset.tid);
		setFocused(value);
		setSelected(value);

		if (!props.game) return;
		const isOwned = (props.game.territories[territoryIdx[value]].owner.token === props.player.token);
		if (props.game.turn.token !== props.player.token) return;

		if (props.game.rounds === 0) {
			if (isOwned) {
				takeAction({ variables: { name: value }});
				props.clicked();
			}
		} else if (props.game.rounds > 0) {
			if (isOwned) {
				console.log("Your own territory");
			} else {
				console.log("Attacking...");
			}
		}
	};

	if (loading) return <p>'TakeAction' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	const curr = (selected !== "") ? LINK[selected].connected : [];

	return (
		<svg viewBox="0 0 1225 628" preserveAspectRatio="xMidYMid meet"
			onClick={handleClear}
			onMouseOver={handleUnhover}>

			{LINE.map((points, i) =>
				<line key={i} x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]} />)}

			{territories.map((territory) =>
				(<Territory
					key={territory.name} tid={territory.name}
					player={(territory.owner) ? playerIdx[territory.owner.name] || 0 : 0}
					army={territory.troops || 0}
					sel={territory.name === selected}
					lnk={curr.includes(territory.name)}
					onClick={handleClick}
					onMouseOver={handleHover} />))}

			<text className="tname" x="450" y="590">
				Territory: <tspan className="data">{(selected === "") ? focused : selected}</tspan>
			</text>

			{(props.player && props.game) &&
				<>
					<polyline
						className={`player${playerIdx[props.player.name]}`}
						points="810,592 810,552 850,562 810,572" />
					<text className="tname" x="814" y="590">Player: <tspan className="data">{props.player.name}</tspan></text>
				</>
			}
		</svg>
	);
}
