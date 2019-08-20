import gql from 'graphql-tag';

export const BROADCAST_EVENT = gql`
subscription onBroadcastEvent {
	broadcastEvent {
		eventid
		timestamp
		event
		type
		token
	}
}`;

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

export const BROADCAST_PREPARE = gql`
subscription onBroadcastPrepare($token: String!) {
	broadcastPrepare(token: $token) {
		eventid
		timestamp
		event
		type
		token
	}
}`;

export const BROADCAST_PROGRESS = gql`
subscription onBroadcastProgress($token: String!) {
	broadcastProgress(token: $token) {
		eventid
		timestamp
		event
		type
		token
	}
}`;
