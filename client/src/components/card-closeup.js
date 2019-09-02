import React from 'react';
import { mapCardType } from '../utils';

export default function CardCloseup(props) {
	return (
		<>
			{props.card &&
				<div id="closeup">
					<div className="rcard">
						<div className="card-name">{props.card}</div>
						<div className="card-type">{mapCardType(props.card)}</div>
					</div>
				</div>
			}
		</>
	);
}
