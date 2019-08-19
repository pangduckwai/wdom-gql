import gql from 'graphql-tag';

export const BROADCAST_REGISTERED = gql`
subscription onBroadcastRegistered {
	broadcastRegistered {
		eventid
		timestamp
		event
		type
		token
	}
}`;

export const BROADCAST_OPENED = gql`
subscription onBroadcastOpened {
	broadcastOpened {
		eventid
		timestamp
		event
		type
		token
	}
}`;

export const BROADCAST_JOINED = gql`
subscription onBroadcastJoined($token: String!) {
	broadcastJoined(token: $token) {
		eventid
		timestamp
		event
		type
		token
	}
}`;
