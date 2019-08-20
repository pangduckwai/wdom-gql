import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import Main from './app-main';
import { useSubscription } from '@apollo/react-hooks';
import { BROADCAST_EVENT } from '../subscriptions';

export default function App() {
	const { data: self, loading, error, refetch } = useQuery(MYSELF);

	useSubscription(BROADCAST_EVENT, {
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastEvent) {
				console.log("BROADCAST_EVENT !!!", JSON.stringify(subscriptionData));
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
		<Main
			refetch={refetch}
			player={self.me}
			players={self.myFellowPlayers} />
	);
}
