import React from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import { TAKE_ACTION } from '../mutations';
// import { BROADCAST_EVENT } from '../subscriptions';
import Main from './app-main';

export default function App() {
	const { data, loading, error, refetch } = useQuery(MYSELF);

	const [takeAction, { loading: mLoading, error: mError }] = useMutation(TAKE_ACTION);

	// useSubscription(BROADCAST_EVENT, {
	// 	onSubscriptionData: ({ _, subscriptionData }) => {
	// 		if (subscriptionData.data && subscriptionData.data.broadcastEvent) {
	// 			console.log("BROADCAST_EVENT !!!", JSON.stringify(subscriptionData));
	// 			refetch();
	// 		}
	// 	}
	// });

	if (loading || mLoading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	if (mError) {
		console.log(JSON.stringify(mError));
		return <p>ERROR</p>;
	}

	return (
		<Main
			refetch={refetch}
			action={takeAction}
			player={data.me}
			players={data.myFellowPlayers} />
	);
}
