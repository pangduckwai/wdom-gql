import gql from 'graphql-tag';

export const MYSELF = gql`
query Myself {
    me {
		token
		name
        redeemable
		reinforcement
		conquer
		order
		cards {
			name
			type
		}
	}
}`;

export const MY_GAME = gql`
query MyGame {
	myGame {
		token
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
		redeemed
		current {
			name
			owner {
				token
				name
			}
			troops
		}
		cards {
			name
			type
		}
		fortified
		territories {
			name
			owner {
				token
				name
			}
			troops
		}
		winner {
			token
			name
		}
	}
	myFellowPlayers {
		name
		order
	}
}`;

export const JOINERS = gql`
query Joiners {
	myFellowPlayers {
		name
	}
}`;

export const ALL_GAMES = gql`
query Games {
	listAvailableGames {
		token
		name
		host {
			name
		}
	}
}`;
