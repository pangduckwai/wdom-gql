import React from 'react';
import { MAP, CARD } from '../consts';

export default function Card(props) {
	const t = MAP[props.card];
	const p = (t) ? t.card : "";

	return (
		<>
			{t ? (
				<div className="lcard">
					<div className="card-name">{props.card}</div>
					<svg className="card-type" preserveAspectRatio="xMidYMin meet" viewBox="0 0 512 512">
						<path d={CARD[p]}/>
					</svg>
				</div>
			) : (
				<div className="lcard">
					<svg className="card-wild1" preserveAspectRatio="xMidYMin meet" viewBox="0 0 512 512">
						<path d={CARD['C']}/>
					</svg>
					<svg className="card-wild2" preserveAspectRatio="xMidYMin meet" viewBox="0 0 512 512">
						<path d={CARD['I']}/>
					</svg>
					<svg className="card-wild3" preserveAspectRatio="xMidYMin meet" viewBox="0 0 512 512">
						<path d={CARD['A']}/>
					</svg>
				</div>
			)}
		</>
	);
}
