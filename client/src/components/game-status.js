import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MY_GAME } from '../queries';

export default function GameStatus(props) {
	const { data, loading, error } = useQuery(MY_GAME, {
		fetchPolicy: "no-cache"
	});

	if (loading) return <p>'MyGame Status' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<>
			<div className="status">
				{(data.myGame.rounds <= 0) ? (
					<div>Round: <span className="name">Preparation</span></div>
				) : (
					<div>Round: <span className="name">{Math.floor((data.myGame.rounds - 1) / 5) + 1}</span></div>
				)}
				{(data.myGame.turn.token === props.player.token) ? (
					<>
						<div>Turn: <span className="name">Your turn</span></div>
						<div>Troops: <span className="name">{props.player.reinforcement}</span></div>
					</>
				) : (
					<div>Turn: <span className="name">{data.myGame.turn.name}</span></div>
				)}
			</div>
			<div className="mt">Territories:</div>
			<ul className="list">
				{data.myGame.territories
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
