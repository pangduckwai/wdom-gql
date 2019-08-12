const { gql } = require('apollo-server');

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
				name
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
				name
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
				name
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
				name
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
				name
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
				name
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
				name
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
				name
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
				name
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
				name
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
				name
				token
			}
		}
	}`
});
