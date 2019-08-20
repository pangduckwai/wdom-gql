import React from 'react';
import { useSubscription } from '@apollo/react-hooks';
import { BROADCAST_PROGRESS } from '../subscriptions';

export default function GameStatus(props) {
	useSubscription(BROADCAST_PROGRESS, {
		variables: { token: props.token },
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastProgress) {
				console.log("BROADCAST_PROGRESS !!!", props.token, JSON.stringify(subscriptionData));
				props.refetch();
			}
		}
	});

	return (
		<>
			<div className="list">
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
				{props.player.joined.territories.filter(t => t.owner.token === props.player.token).map((t, idx) =>
					<li key={idx} className="ml"><span className="name">{t.name}</span></li>
				)}
			</ul>
		</>
	);
}
