import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { TAKE_ACTION } from '../mutations';
import { MAP, LINK, LINE } from '../consts';
import Territory from './map-territory';
import DragIcon from './map-drag';
import { convert, getMousePosition } from '../utils';
import './app.css';

export default function Map(props) {
	const [selected, setSelected] = useState("");
	const [focused, setFocused] = useState("");
	const [dragged, setDragged] = useState("");
	const [mouseDown, setMouseDown] = useState(false);
	const [xpos, setXPos] = useState(0);
	const [ypos, setYPos] = useState(0);

	const [takeAction, { loading, error }] = useMutation(TAKE_ACTION);

	const territories = (props.gameToken) ? props.territories :
		Object.keys(MAP).map((key) => {
			const t = {};
			t.name = key;
			return t;
		});

	const territoryIdx = {};
	const playerIdx = {};
	if (props.gameToken) {
		for (let i = 0; i < props.territories.length; i ++) {
			territoryIdx[props.territories[i].name] = i;
		}
	}
	if (props.players) {
		for (let i = 0; i < props.players.length; i ++) {
			playerIdx[props.players[i].name] = props.players[i].order;
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

		if (!props.gameToken || (props.rounds < 0)) {
			setFocused(value);
			setSelected(value);
			return;
		}

		if (props.turnToken !== props.playerToken) return;

		if (props.territories[territoryIdx[value]].owner.token === props.playerToken) {
			setFocused(value);
			setSelected(value); //can only select your own territory
		} else if (props.rounds === 0) {
			return; //can do nothing to other's territories during setup phase
		}
		takeAction({ variables: { name: value }});
	};

	const handleMouseDown = (e) => {
		e.preventDefault();
		setMouseDown(true);
		setDragged(focused);
		const { xpos: x, ypos: y } = getMousePosition(e.target, e.clientX, e.clientY);
		setXPos(x);
		setYPos(y);
	};
	const handleMouseMove = (e) => {
		if (mouseDown) {
			e.preventDefault();
			const { xpos: x, ypos: y } = getMousePosition(e.target, e.clientX, e.clientY);
			setXPos(x);
			setYPos(y);
		}
	};
	const handleMouseUp = (e) => {
		setMouseDown(false);
		if (dragged !== focused) {
			console.log("Drag from", dragged, "to", focused);
		} else {
			console.log("Drag cancelled");
		}
	};

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	const curr = (selected !== "") ? LINK[selected].connected : [];
	const order = (props.playerOrder) ? props.playerOrder : 0;

	return (
		<svg viewBox="0 0 1225 628" preserveAspectRatio="xMidYMid meet"
			onClick={handleClear}
			onMouseOver={handleUnhover}
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}>

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
					onMouseOver={handleHover}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp} />))}

			{!loading ? (
				<text className="tname" x="380" y="600">
					Territory: <tspan className="data">{(selected === "") ? focused : selected}</tspan>
				</text>
			) : (
				<text className="tname" x="380" y="600">Loading...</text>
			)}

			{(props.playerToken) &&
				<>
					<polyline
						className={`player${order}`}
						points="0,0 0,-40 40,-30 0,-20"
						transform="translate(394,580)" />
					<text className="tname" x="398" y="578">Player: <tspan className="data">{props.playerName}</tspan></text>
				</>
			}

			<DragIcon
				dragging={mouseDown}
				xpos={xpos}
				ypos={ypos} />
		</svg>
	);
}
