import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { ALL_GAMES } from '../queries';
import { useSubscription } from '@apollo/react-hooks';
import { BROADCAST_OPENED } from '../subscriptions';
import JoinGame from './game-join';

export default function GameList(props) {
	const { data, loading, error, refetch } = useQuery(ALL_GAMES, {
		fetchPolicy: "cache-and-network"
	});

	useSubscription(BROADCAST_OPENED, {
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastOpened) {
				console.log("BROADCAST_OPENED !!!", JSON.stringify(subscriptionData));
				refetch();
			}
		}
	});

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<JoinGame
			games={data.listGames}
			refetch={props.refetch} />
	);
}
