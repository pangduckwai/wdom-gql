import gql from 'graphql-tag';

export const REGISTER = gql`
mutation register($name: String!) {
	registerPlayer(name: $name) {
		successful
		message
		event {
			timestamp
			event
			type
			name
			token
		}
	}
}`;

export const OPEN_GAME = gql`
mutation Open($name: String!) {
	openGame(name: $name) {
		successful
		message
		event {
			timestamp
			event
			type
			name
			token
		}
	}
}`;
