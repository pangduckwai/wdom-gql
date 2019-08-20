import React from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import { TAKE_ACTION } from '../mutations';
import { BROADCAST_EVENT } from '../subscriptions';
import Main from './app-main';

export default function App() {
	const { data: self, loading: sloading, error: serror, refetch } = useQuery(MYSELF);

	const [takeAction, { loading: aloading, error: aerror }] = useMutation(TAKE_ACTION);

	useSubscription(BROADCAST_EVENT, {
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastEvent) {
				console.log("BROADCAST_EVENT !!!", JSON.stringify(subscriptionData));
				refetch();
			}
		}
	});

	if (sloading || aloading) return <p>Loading...</p>;

	if (serror) {
		console.log(JSON.stringify(serror));
		return <p>ERROR</p>;
	}

	if (aerror) {
		console.log(JSON.stringify(aerror));
		return <p>ERROR</p>;
	}

	return (
		<Main
			refetch={refetch}
			action={takeAction}
			player={self.me}
			players={self.myFellowPlayers} />
	);
}
