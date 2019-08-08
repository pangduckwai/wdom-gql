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
	mutation Turn {
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
	}`
});
