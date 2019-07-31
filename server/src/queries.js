const { gql } = require('apollo-server');

module.exports = Object.freeze({
	PLAYERS: gql`
	query Players {
		players {
			token
			name
			reinforcement
			joined {
				id
				name
			}
		}
	}`,
	GAMES: gql`
	query Games {
		games {
			id
			name
			host {
				token
				name
			}
			turn {
				token
				name
			}
			rounds
			cardReinforcement
		}
	}`,
	JOINED: gql`
	query Joined($id: ID!) {
		joined(id: $id) {
			token
			name
		}
	}`,
	HOSTED: gql`
	query Hosted {
		hosted {
			id
			name
			host {
				token
				name
			}
		}
	}`
});
