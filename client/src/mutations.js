import gql from 'graphql-tag';

export const REGISTER = gql`
mutation Register($name: String!) {
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

export const QUIT_PLAYER = gql`
mutation Quit {
	quitPlayer {
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

export const JOIN_GAME = gql`
mutation Join($token: String!) {
	joinGame(token: $token) {
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

export const LEAVE_GAME = gql`
mutation Leave {
	leaveGame {
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

export const CLOSE_GAME = gql`
mutation Close {
	closeGame {
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

export const START_GAME = gql`
mutation Start {
	startGame {
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
