import gql from 'graphql-tag';

export const REGISTER = gql`
mutation Register($name: String!) {
	registerPlayer(name: $name) {
		successful
		message
		event {
			timestamp
			event
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
			token
		}
	}
}`;

export const TAKE_ACTION = gql`
mutation Action($name: String!) {
	takeAction(name: $name) {
		successful
		message
		event {
			timestamp
			event
			token
		}
	}
}`;

export const END_TURN = gql`
mutation EndTurn($from: String, $to: String, $amount: Int) {
	endTurn(from: $from, to: $to, amount: $amount) {
		successful
		message
		event {
			timestamp
			event
			token
		}
	}
}`;

export const REDEEM_CARDS = gql`
mutation RedeemCards($cards: [String]!) {
	redeemCards(cards: $cards) {
		successful
		message
		event {
			timestamp
			event
			token
		}
	}
}`;
