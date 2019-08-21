import React from 'react';
// import { useSubscription } from '@apollo/react-hooks';
// import { BROADCAST_PROGRESS } from '../subscriptions';

export default function GameStatus(props) {
	// useSubscription(BROADCAST_PROGRESS, {
	// 	variables: { token: props.player.joined.token },
	// 	onSubscriptionData: ({ _, subscriptionData }) => {
	// 		if (subscriptionData.data && subscriptionData.data.broadcastProgress) {
	// 			console.log("BROADCAST_PROGRESS !!!", props.player.joined.token, JSON.stringify(subscriptionData));
	// 			props.refetch();
	// 		}
	// 	}
	// });

	return (
		<>
			<div className="status">
				{(props.player.joined.rounds <= 0) ? (
					<div>Round: <span className="name">Preparation</span></div>
				) : (
					<div>Round: <span className="name">{Math.floor((props.player.joined.rounds - 1) / 5) + 1}</span></div>
				)}
				{(props.player.joined.turn.token === props.player.token) ? (
					<>
						<div>Turn: <span className="name">Your turn</span></div>
						<div>Troops: <span className="name">{props.player.reinforcement}</span></div>
					</>
				) : (
					<div>Turn: <span className="name">{props.player.joined.turn.name}</span></div>
				)}
			</div>
			<div className="mt">Territories:</div>
			<ul className="list">
				{props.player.joined.territories
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
