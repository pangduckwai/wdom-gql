import gql from 'graphql-tag';

export const MYSELF = gql`
query Myself {
    me {
		token
		name
        redeemable
		reinforcement
		conquer
		cards {
			name
			type
		}
		joined {
            token
			name
			host {
				token
				name
			}
			turn {
				token
			}
			rounds
			territories {
				name
				owner {
					name
				}
				troops
			}
		}
	}
	myFellowPlayers {
		name
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
	listGames {
		token
		name
		host {
			name
		}
	}
}`;
