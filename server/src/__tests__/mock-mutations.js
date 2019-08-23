const { gql } = require('apollo-server-express');

module.exports = Object.freeze({
REGISTER: gql`
mutation Register($name: String!) {
	registerPlayer(name: $name) {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
QUIT_PLAYER: gql`
mutation Quit {
	quitPlayer {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
OPEN_GAME: gql`
mutation Open($name: String!) {
	openGame(name: $name) {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
CLOSE_GAME: gql`
mutation Close {
	closeGame {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
JOIN_GAME: gql`
mutation Join($token: String!) {
	joinGame(token: $token) {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
LEAVE_GAME: gql`
mutation Leave {
	leaveGame {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
START_GAME: gql`
mutation Start {
	startGame {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
TAKE_ACTION: gql`
mutation Action($name: String!) {
	takeAction(name: $name) {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
START_TURN: gql`
mutation StartTurn {
	startTurn {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
END_TURN: gql`
mutation EndTurn($from: String, $to: String, $amount: Int) {
	endTurn(from: $from, to: $to, amount: $amount) {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`,
REDEEM_CARD: gql`
mutation RedeemCards($cards: [String]!) {
	redeemCards(cards: $cards) {
		successful
		message
		event {
			timestamp
			event
			type
			token
		}
	}
}`
});
