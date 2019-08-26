import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { END_TURN } from '../mutations';

export default function GameStatus(props) {
	const [endTurn, { loading, error }] = useMutation(END_TURN);

	const handleSubmit = (e) => {
		e.preventDefault();
		endTurn().then(r => {
			props.refresh({ game: true });
		});
	};

	if (loading) return <p>'EndTurn' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	const isTurn = (props.turnToken === props.playerToken);

	return (
		<>
			<div id="status">
				{(props.rounds <= 0) ? (
					<div>Round: <span className="name">Preparation</span></div>
				) : (
					<div>Round: <span className="name">{Math.floor((props.rounds - 1) / 5) + 1}</span></div>
				)}
				{isTurn ? (
					<>
						<div>Turn: <span className="name">Your turn</span></div>
						<div>Troops: <span className="name">{props.reinforcement}</span></div>
					</>
				) : (
					<div>Turn: <span className="name">{props.turnName}</span></div>
				)}
			</div>
			<div className="mt">Territories:</div>
			<form className="game-ctrl" onSubmit={handleSubmit}>
				<ul className="list">
					{props.territories
						.filter(t => t.owner.token === props.playerToken)
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
							(<li key={idx}>
								<span>{('00' + (idx + 1)).slice(-2)}.</span> <label className="name">{t.name}</label>
							</li>)
						)}
				</ul>
				{isTurn &&
					<input type="submit" value="End turn" />
				}
			</form>
		</>
	);
}
