import React from 'react';
import Card from './card';

export default function CardCloseup(props) {
	return (
		<>
			{props.card &&
				<div id="closeup">
					<Card card={props.card} />
				</div>
			}
		</>
	);
}
