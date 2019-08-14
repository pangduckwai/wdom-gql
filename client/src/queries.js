import gql from 'graphql-tag';

export const MYSELF = gql`
query Myself {
    me {
		token
		name
        redeemable
		reinforcement
		conquer
		joined {
            token
			name
        }
		cards {
			name
			type
		}
	}
}`;

export const ALL_GAMES = gql`
query Games {
	listGames {
		name
		host {
			name
		}
	}
}`;
