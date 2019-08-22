import React from 'react';
import { useSubscription } from '@apollo/react-hooks';
import { BROADCAST_GAME_EVENT } from '../subscriptions';

export default function GameSubscriber(props) {
	useSubscription(BROADCAST_GAME_EVENT, {
		variables: { token: props.game.token },
		shouldResubscribe: false,
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastGameEvent) {
				console.log(props.game.name, ":p", JSON.stringify(subscriptionData.data.broadcastGameEvent));
				props.receiver(subscriptionData.data.broadcastGameEvent.event);
			}
		}
	});

	return <span>&nbsp;</span>;
}
