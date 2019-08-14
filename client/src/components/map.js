import React from 'react';
import { MAP, LINK, LINE } from '../constants';
import Territory from './territory';
import './map.css';

export default function Map(props) {
	const curr = (props.selected !== "") ? LINK[props.selected].connected : [];

	return (
		<svg viewBox="0 0 1225 628" preserveAspectRatio="xMidYMid meet"
			onClick={props.handleClear}
			onMouseOver={props.handleUnhover}>

			{LINE.map((points, i) =>
				<line key={i} x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]} />)}

			{Object.keys(MAP).map((key) =>
				(<Territory
					key={key} tid={key}
					player={(props.owners[key] != null) ? props.owners[key] : 0}
					army={(props.owners[key] != null) ? 1 : 0}
					sel={key === props.selected}
					lnk={curr.includes(key)}
					onClick={props.handleClick}
					onMouseOver={props.handleHover} />))}

			<text className="tname" x="560" y="590">
				{(props.selected === "") ? props.focused : props.selected}
			</text>
		</svg>
	);
}
