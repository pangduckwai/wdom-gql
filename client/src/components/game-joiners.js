import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { JOINERS } from '../queries';
import { useSubscription } from '@apollo/react-hooks';
import { BROADCAST_JOINED } from '../subscriptions';

export default function GameJoiners(props) {
	const { data, loading, error, refetch } = useQuery(JOINERS);

	useSubscription(BROADCAST_JOINED, {
		variables: { token: props.token },
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastJoined) {
				console.log("SUBSCRIPTION!!!", JSON.stringify(subscriptionData));
				refetch();
			}
		}
	});

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	const classname = `list ${props.type}`;
	return (
		<>
			<div className="title">Joined players</div>
			<ul className={classname}>
				{data.myFellowPlayers.map((player, index) =>
					<li key={index}>{player.name}</li>
				)}
			</ul>
		</>
	);
}
