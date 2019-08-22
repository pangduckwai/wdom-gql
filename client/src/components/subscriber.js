import React from 'react';
import { useSubscription } from '@apollo/react-hooks';
import { BROADCAST_EVENT } from '../subscriptions';

export default function Subscriber(props) {
	useSubscription(BROADCAST_EVENT, {
		shouldResubscribe: false,
		onSubscriptionData: ({ _, subscriptionData }) => {
			if (subscriptionData.data && subscriptionData.data.broadcastEvent) {
				console.log(props.player.name, ":O", JSON.stringify(subscriptionData.data.broadcastEvent));
				props.receiver(subscriptionData.data.broadcastEvent.event);
			}
		}
	});

	return <span>&nbsp;</span>;
}
