import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { TAKE_ACTION } from '../mutations';
import { MAP, LINK, LINE } from '../consts';
import Territory from './map-territory';
import DragIcon from './map-drag';
import { convert, getMousePosition, getArrowHead } from '../utils';

export default function Map(props) {
	const [selected, setSelected] = useState("");
	const [focused, setFocused] = useState("");
	const [mouseDown, setMouseDown] = useState(false);
	const [dragged, setDragged] = useState("");
	const [xpos, setXPos] = useState(0);
	const [ypos, setYPos] = useState(0);

	const [takeAction, { loading, error }] = useMutation(TAKE_ACTION);

	useEffect(() => {
		if (props.selected) {
			setSelected(props.selected);
			props.setSelected(null);
		}
	});

	const playerIdx = {};
	props.players.forEach(p => {
		playerIdx[p.name] = p.order;
	});

	const handleClear = (e) => {
		e.preventDefault();
		setSelected("");
		props.setCardHover(null);
	};

	const handleUnhover = (e) => {
		e.preventDefault();
		setFocused("");
	};

	const disableSelect = (e) => {
		e.preventDefault();
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

		if (props.territories[props.territoryIdx[value]].owner.token === props.playerToken) {
			setFocused(value);
			setSelected(value); //can only select your own territory
		} else if (props.rounds === 0) {
			return; //can do nothing to other's territories during setup phase.
		}
		takeAction({ variables: { name: value }});
		props.clicked();
	};

	const handleHover = (e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		if (typeof(e.target.dataset.tid) !== "undefined") {
			const value = convert(e.target.dataset.tid);
			setFocused(value);
		}
	};

	let aw = 2;
	let ah = 6;
	const handleMouseDown = (e) => {
		e.preventDefault();

		if (typeof(e.target.dataset.tid) === "undefined") return;
		const dragIcon0 = document.getElementById("drag-icon-0");
		const dragIcon1 = document.getElementById("drag-icon-1");
		const dragIcon2 = document.getElementById("drag-icon-2");
		const { xpos: x, ypos: y } = getMousePosition(e.target, e.clientX, e.clientY);
		dragIcon0.setAttributeNS(null, "x1", x);
		dragIcon0.setAttributeNS(null, "y1", y);
		dragIcon0.setAttributeNS(null, "x2", x);
		dragIcon0.setAttributeNS(null, "y2", y);
		dragIcon1.setAttributeNS(null, "x1", x);
		dragIcon1.setAttributeNS(null, "y1", y);
		dragIcon1.setAttributeNS(null, "x2", x);
		dragIcon1.setAttributeNS(null, "y2", y);
		dragIcon2.setAttributeNS(null, "x1", x);
		dragIcon2.setAttributeNS(null, "y1", y);
		dragIcon2.setAttributeNS(null, "x2", x);
		dragIcon2.setAttributeNS(null, "y2", y);
		setXPos(x);
		setYPos(y);

		setMouseDown(true);
		setDragged(convert(e.target.dataset.tid));
		aw = 1;
		ah = 5;
	};

	const handleMouseMove = (e) => {
		if (mouseDown) {
			const dragIcon0 = document.getElementById("drag-icon-0");
			const dragIcon1 = document.getElementById("drag-icon-1");
			const dragIcon2 = document.getElementById("drag-icon-2");
			const { xpos: x, ypos: y } = getMousePosition(e.target, e.clientX, e.clientY);
			const [{ p, q }, { r, s }] = getArrowHead({ a: xpos, b: ypos }, { c: x, d: y}, ah, aw);
			dragIcon0.setAttributeNS(null, "x2", x);
			dragIcon0.setAttributeNS(null, "y2", y);
			dragIcon1.setAttributeNS(null, "x1", x);
			dragIcon1.setAttributeNS(null, "y1", y);
			dragIcon1.setAttributeNS(null, "x2", p);
			dragIcon1.setAttributeNS(null, "y2", q);
			dragIcon2.setAttributeNS(null, "x1", x);
			dragIcon2.setAttributeNS(null, "y1", y);
			dragIcon2.setAttributeNS(null, "x2", r);
			dragIcon2.setAttributeNS(null, "y2", s);
			if (aw < 12) aw += 2;
			if (ah < 16) ah += 2;
		}
	};

	const handleMouseUp = (e) => {
		e.preventDefault();

		setMouseDown(false);
		if (!focused || (focused === null) || (focused === "")) {
			console.log("Drag to nothing");
			return;
		}
		if (!dragged || (dragged === null) || (dragged === "")) {
			console.log("Drag from nothing");
			return;
		}
		if (dragged === focused) {
			console.log("Drag cancelled");
			return;
		}

		if (LINK[dragged].connected.filter(c => c === focused).length <= 0) {
			console.log(dragged, "not connected to", focused);
			return;
		}

		if (!props.gameToken || (props.rounds <= 0)) {
			console.log("Dragged from", dragged, "to", focused);
			setSelected(focused);
			return;
		}

		if (props.turnToken !== props.playerToken) return;

		console.log("Fortifying from", dragged, "to", focused);
		if ((props.territories[props.territoryIdx[dragged]].owner.token === props.playerToken) &&
			(props.territories[props.territoryIdx[focused]].owner.token === props.playerToken)) {
			setSelected(focused);
			props.fortify(dragged, focused, props.territories[props.territoryIdx[dragged]].troops - 1);
		}
	};

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	const curr = (selected !== "") ? LINK[selected].connected : [];
	const order = (props.playerOrder) ? props.playerOrder : 0;

	const w = (props.viewPortSize) ? props.viewPortSize.width - 20 : 1225;
	const h = (props.viewPortSize) ? props.viewPortSize.height - 20 : 628;

	return (
		<svg className="map" preserveAspectRatio="xMidYMin meet" viewBox="0 0 1225 628" width={w} height={h}
			onMouseDown={disableSelect}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onClick={handleClear}
			onMouseOver={handleUnhover}>

			{LINE.map((points, i) =>
				<line key={i} x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]} />)}

			{Object.keys(MAP).map(key => {
				const idx = props.territoryIdx[key];
				const territory = (typeof(idx) !== "undefined") && (idx >= 0) && (props.territories.length > 0) ? props.territories[idx] : {};
				return (<Territory
					key={key} tid={key}
					player={(territory.owner) ? playerIdx[territory.owner.name] || 0 : 0}
					army={territory.troops || 0}
					sel={territory.name === selected}
					lnk={curr.includes(territory.name)}
					onMouseDown={handleMouseDown}
					onClick={handleClick}
					onMouseOver={handleHover} />);
			})}

			{!loading ? (
				<text className="tname" x="350" y="600">
					Territory: <tspan className="data">{(selected === "") ? focused : selected}</tspan>
				</text>
			) : (
				<text className="tname" x="350" y="600">Loading...</text>
			)}

			{(props.playerToken) &&
				<>
					<polyline
						className={`player${order}`}
						points="0,0 0,-40 40,-30 0,-20"
						transform="translate(364,580)" />
					<text className="tname" x="368" y="578">Player: <tspan className="data">{props.playerName}</tspan></text>
				</>
			}

			<DragIcon dragging={mouseDown} />
		</svg>
	);
}
