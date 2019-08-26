import React from 'react';
import { MAP } from '../consts';
import './app.css';

export default function Territory(props) {
	const local = MAP[props.tid];
	let clazz = 'c';
	if (props.sel) clazz = 'c s';
	if (props.lnk) clazz = 'c l';

	const tid = props.tid.toLowerCase();
	return (
		<g className={clazz} id={props.tid}
			onClick={props.onClick}
			onMouseOver={props.onMouseOver}>

			<path
				data-tid={tid}
				className={`${local.continent} ${local.cindex}`}
				d={local.svgPath}/>
			<text draggable data-tid={tid} className={"tarmy"} x={local.loc[0]} y={local.loc[1]}>
				{props.army}
			</text>
			<polyline
				data-tid={tid}
				className={`player${props.player}`}
				points="0,0 0,-20 20,-15 0,-10"
				transform={`translate(${local.loc[2]}, ${local.loc[3]})`} />
		</g>
	);
}
