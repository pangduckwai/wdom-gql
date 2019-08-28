import React from 'react';

export default function Cards(props) {
	const cards = (props.cards && (props.cards.length > 0)) ? props.cards : [
		{ name: "Congo", type: "Artillery" }, { name: "Alberta", type: "Infantry" }
	];

	return (
		<div id="cards">
			{props.playerToken &&
				<ul>
					{cards.map(c =>
						(<li>{c.name} {c.type}</li>)
					)}
				</ul>
			}
		</div>
	);
}
