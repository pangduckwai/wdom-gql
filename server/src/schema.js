const { gql } = require('apollo-server');

const typeDefs = gql`
type Query {
	me: Player
	players: [Player]!
	player(token: String!): Player
	playersInGame(id: ID!): [Player]!
	games: [Game]!
	game(id: ID!): Game
	gameByHost: Game
}

type Mutation {
	# Someone register to the game server from a browser.
	register(name: String!): Player
	# Player denoted by 'token' leave the game server.
	leave(token: String!): Player
	# The current player (with token in http header) create a game.
	start(name: String!): Game
	# End a game hosted by the current player (with token in http header).
	end: [Player]!
	# The current player (with token in http header) join a game.
	join(id: ID!): Player
	# The current player (with token in http header) quit a game.
	quit: Player

	# Test 1 - conquer
	#test1(territory: String!): Game
}

type Player {
	token: String!
	name: String!
	joined: Game
}

type Game {
	id: ID!
	name: String!
	host: Player!
	rounds: Int!
	cardReinforcement: Int!
	territories: [Territory]!
}

type Territory {
	name: String!
	continent: String!
	owner: Player
	army: Int!
}
`;

module.exports = typeDefs;
