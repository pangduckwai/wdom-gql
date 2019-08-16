import React from 'react';
import { LINK, LINE } from '../constants';
import Territory from './territory';
import './map.css';

export default function Map(props) {
	const curr = (props.selected !== "") ? LINK[props.selected].connected : [];

	const TEMP = {
		John : 1,
		Josh : 2,
		Nick : 3,
		Paul : 4,
		Bill : 5
	};

	console.log(JSON.stringify(props.territories));
	return (
		<svg viewBox="0 0 1225 628" preserveAspectRatio="xMidYMid meet"
			onClick={props.handleClear}
			onMouseOver={props.handleUnhover}>

			{LINE.map((points, i) =>
				<line key={i} x1={points[0]} y1={points[1]} x2={points[2]} y2={points[3]} />)}

			{props.territories.map((territory) =>
				(<Territory
					key={territory.name} tid={territory.name}
					player={TEMP[territory.owner.name] || 0}
					army={territory.troops || 0}
					sel={territory.name === props.selected}
					lnk={curr.includes(territory.name)}
					onClick={props.handleClick}
					onMouseOver={props.handleHover} />))}

			<text className="tname" x="560" y="590">
				{(props.selected === "") ? props.focused : props.selected}
			</text>
		</svg>
	);
}
