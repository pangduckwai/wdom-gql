const { gql } = require('apollo-server');

module.exports = Object.freeze({
	MY_GAME: gql`
	query MyGame {
		myGame {
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
			territories {
				name
				owner {
					name
				}
				troops
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
