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
			current {
				name
			}
			territories {
				name
				owner {
					name
				}
				troops
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
});
