import gql from 'graphql-tag';

export const BROADCAST_EVENT = gql`
subscription onBroadcastEvent {
	broadcastEvent {
		eventid
		timestamp
		event
		token
	}
}`;

export const BROADCAST_GAME_EVENT = gql`
subscription onBroadcastGameEvent($token: String!) {
	broadcastGameEvent(token: $token) {
		eventid
		timestamp
		event
		token
		data {
			name
			value
		}
	}
}`;
