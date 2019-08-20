import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { JOINERS } from '../queries';
import { useSubscription } from '@apollo/react-hooks';
import { BROADCAST_PREPARE } from '../subscriptions';

export default function JoinerList(props) {
	const { data, loading, error, refetch } = useQuery(JOINERS);

	useSubscription(BROADCAST_PREPARE, {
		variables: { token: props.token },
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastPrepare) {
				console.log("BROADCAST_PREPARE !!!", props.token, JSON.stringify(subscriptionData));
				refetch();
				if (subscriptionData.data.broadcastPrepare.event === 7) {
					props.refetch(); //Game started
				}
			}
		}
	});

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<>
			<div className="title">Joined players</div>
			<ul className="list">
				{data.myFellowPlayers.map((player, index) =>
					<li key={index}>- <span className="name">{player.name}</span></li>
				)}
			</ul>
		</>
	);
}
