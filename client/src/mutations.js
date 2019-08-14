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
