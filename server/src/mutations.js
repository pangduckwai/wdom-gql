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
	QUIT: gql`
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
	OPEN: gql`
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
    CLOSE: gql`
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
    }
    `,
	JOIN: gql`
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
	LEAVE: gql`
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
	START: gql`
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
	DEPLOY: gql`
	mutation Deploy {
		deployTroops {
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
