const { gql } = require('apollo-server');

module.exports = Object.freeze({
	MYSELF: gql`
	query Myself {
		me {
			token
			name
			reinforcement
			cards {
				name
				type
			}
			joined {
				name
			}
		}
	}`,
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
			current {
				name
			}
			cards {
				name
				type
			}
			territories {
				name
				owner {
					name
				}
				troops
				connected {
					name
				}
			}
		}
	}`,
	MY_HOLDING: gql`
	query MyHolding {
		myTerritories {
			name
			owner {
				name
			}
			troops
		}
	}`,
	FELLOW_PLAYERS: gql`
	query Fellow {
		myFellowPlayers {
			name
			joined {
				name
			}
		}
	}`,
	ALL_PLAYERS: gql`
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
	ALL_GAMES: gql`
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
});
