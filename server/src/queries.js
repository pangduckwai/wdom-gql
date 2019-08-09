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
			conquer
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
			fortified
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
			winner {
				name
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
			name
			reinforcement
			cards {
				name
				type
			}
			conquer
		}
	}`,
	ALL_GAMES: gql`
	query Games {
		listGames {
			name
			host {
				name
			}
			turn {
				name
			}
			rounds
			redeemed
			fortified
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
			winner {
				name
			}
		}
	}`
});
