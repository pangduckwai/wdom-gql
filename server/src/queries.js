const { gql } = require('apollo-server');

module.exports = Object.freeze({
	PLAYERS: gql`
	query Players {
		listPlayers {
			token
			name
			reinforcement
			joined {
				token
                name
                host {
                    name
                }
			}
		}
	}`,
	FELLOW: gql`
	query Fellow {
		myFellowPlayers {
			name
			joined {
				name
			}
		}
	}`,
	GAMES: gql`
	query Games {
		listGames {
			token
			name
			host {
				name
			}
			turn {
				name
			}
			rounds
			redeemed
		}
	}`
	// JOINED: gql`
	// query Joined($id: ID!) {
	// 	joined(id: $id) {
	// 		token
	// 		name
	// 	}
	// }`,
	// HOSTED: gql`
	// query Hosted {
	// 	hosted {
	// 		id
	// 		name
	// 		host {
	// 			token
	// 			name
	// 		}
	// 	}
	// }`
});
