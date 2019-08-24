import React from 'react';

export default function GameStatus(props) {
	return (
		<>
			<div className="status">
				{(props.game.rounds <= 0) ? (
					<div>Round: <span className="name">Preparation</span></div>
				) : (
					<div>Round: <span className="name">{Math.floor((props.game.rounds - 1) / 5) + 1}</span></div>
				)}
				{(props.game.turn.token === props.player.token) ? (
					<>
						<div>Turn: <span className="name">Your turn</span></div>
						<div>Troops: <span className="name">{props.player.reinforcement}</span></div>
					</>
				) : (
					<div>Turn: <span className="name">{props.game.turn.name}</span></div>
				)}
			</div>
			<div className="mt">Territories:</div>
			<ul className="list">
				{props.game.territories
					.filter(t => t.owner.token === props.player.token)
					.sort((a, b) => {
						if (a.name < b.name) {
							return -1;
						} else if (a.name > b.name) {
							return 1;
						} else {
							return 0;
						}
					})
					.map((t, idx) =>
						(<li key={idx} className="ml">
							<span>{('00' + (idx + 1)).slice(-2)}.</span> <label className="name">{t.name}</label>
						</li>)
					)}
			</ul>
		</>
	);
}
