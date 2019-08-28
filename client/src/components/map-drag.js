import React from 'react';

export default function DragIcon(props) {
	let clazz = (props.dragging) ? 'drag show' : 'drag hide';

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
