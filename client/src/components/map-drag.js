import React from 'react';
import './app.css';

export default function DragIcon(props) {
	let clazz = (props.dragging) ? 'drag show' : 'drag hide';

	// TODO: use path to draw a soldier...
	return (
		<g className={clazz}>
			<polyline
				points="-20,-17 0,17 20,-17 -20,-17"
				transform={`translate(${props.xpos}, ${props.ypos})`} />
		</g>
	);
}
