import React from 'react';

export default function Cards(props) {
	const cards = (props.cards && (props.cards.length > 0)) ? props.cards : [
		{ name: "Congo", type: "Artillery" }, { name: "Western-United-States", type: "Infantry" }, { name: "Alberta", type: "Infantry" },
		{ name: "Congo", type: "Artillery" }, { name: "Congo", type: "Artillery" }
	];

	return (
		<div id="cards">
			{props.playerToken &&
				<ul>
					{cards.map(c =>
						(<li>
							<div className="card">
								<div>{c.name}</div>
								<div>{c.type}</div>
							</div>
						</li>)
					)}
				</ul>
			}
		</div>
	);
}
