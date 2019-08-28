import React from 'react';
import './app.css';

export default function DragIcon(props) {
	let clazz = (props.dragging) ? 'drag show' : 'drag hide';

	// const handleHover = (e) => {
	// 	console.log("No-op");
	// };

	// TODO: use path to draw a soldier...  transform={`translate(${props.xpos}, ${props.ypos})`}
	// return (
	// 	<polyline id="drag-icon"
	// 		className={clazz}
	// 		points="-20,-17 0,17 20,-17 -20,-17" />
	// );
	return (
		<>
			<line id="drag-icon-0" className={clazz}
				pointerEvents="none"
				x1="1" y1="1" x2="2" y2="2" strokeDasharray="20" />
			<line id="drag-icon-1" className={clazz}
				pointerEvents="none"
				x1="1" y1="1" x2="2" y2="2" />
			<line id="drag-icon-2" className={clazz}
				pointerEvents="none"
				x1="1" y1="1" x2="2" y2="2" />
		</>
	);
}
