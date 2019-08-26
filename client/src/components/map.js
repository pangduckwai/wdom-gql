import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { MY_GAME } from '../queries';
import { TAKE_ACTION } from '../mutations';
import { MAP, LINK, LINE } from '../consts';
import Territory from './map-territory';
import { convert } from '../utils';
import './app.css';

export default function Map(props) {
	const [focused, setFocused] = useState("");
	const [selected, setSelected] = useState("");

	const { data, loading: loadingg, error: errorg, refetch } = useQuery(MY_GAME, {
		fetchPolicy: "no-cache",
		onCompleted(data) {
			if (data.myGame) {
				props.callback(data.myGame);
			} else {
				props.callback(null);
			}
		}
	});

	const [takeAction, { loading: loadinga, error: errora }] = useMutation(TAKE_ACTION);

	const territories = (data.myGame) ? data.myGame.territories :
		Object.keys(MAP).map((key) => {
			const t = {};
			t.name = key;
			return t;
		});

	const territoryIdx = {};
	const playerIdx = {};
	if (data.myGame) {
		for (let i = 0; i < data.myGame.territories.length; i ++) {
			territoryIdx[data.myGame.territories[i].name] = i;
		}
	}
	if (data.myFellowPlayers) {
		for (let i = 0; i < data.myFellowPlayers.length; i ++) {
			playerIdx[data.myFellowPlayers[i].name] = i + 1;
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

		if (!data.myGame || (data.myGame.rounds < 0)) return;
		const isOwned = (data.myGame.territories[territoryIdx[value]].owner.token === props.playerToken);
		if (data.myGame.turn.token !== props.playerToken) return;

		if (((data.myGame.rounds === 0) && isOwned) || (data.myGame.rounds > 0)) {
			takeAction({ variables: { name: value }}).then(r => {
				refetch();
			});
		}
	};

	if (errorg) {
		console.log(JSON.stringify(errorg));
		return <p>ERROR</p>;
	}
	if (errora) {
		console.log(JSON.stringify(errora));
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

			{(!loadingg && !loadinga) ? (
				<text className="tname" x="450" y="590">
					Territory: <tspan className="data">{(selected === "") ? focused : selected}</tspan>
				</text>
			) : (
				<text className="tname" x="450" y="590">Loading...</text>
			)}

			{(data.myGame) &&
				<>
					<polyline
						className={`player${playerIdx[props.playerName]}`}
						points="810,592 810,552 850,562 810,572" />
					<text className="tname" x="814" y="590">Player: <tspan className="data">{props.playerName}</tspan></text>
				</>
			}
		</svg>
	);
}
