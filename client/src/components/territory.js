import React from 'react';
import { MAP } from './constants';
import './map.css';

export default function Territory(props) {
	const local = MAP[props.tid];
	let clazz = 'c';
	if (props.sel) clazz = 'c s';
	if (props.lnk) clazz = 'c l';

	return (
		<g className={clazz} id={props.tid}
			onClick={props.onClick}
			onMouseOver={props.onMouseOver}>

			<path
				className={`${local.continent} ${local.cindex}`}
				d={local.svgPath}/>
			<text className={"tarmy"} x={local.loc[0]} y={local.loc[1]}>
				{props.army}
			</text>
			<polyline
				className={`player${props.player}`} points="0,0 0,-20 20,-15 0,-10"
				transform={`translate(${local.loc[2]}, ${local.loc[3]})`} />
		</g>
	);
}
