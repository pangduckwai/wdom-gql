const { gql } = require('apollo-server');

const typeDefs = gql`
type Query {
	me(token: String!): Player
	# games(
	# 	pageSize: Int
	# 	after: String
	# ): GameConnection!
	game(id: ID!): Game
	gameByHost(host: Player!): Game
}

# type GameConnection {
# 	cursor: String!
# 	hasMore: Boolean!
# 	games: [Game]!
# }

type Mutation {
	register(name: String!): Player
	leave(token: String!): Player
}

type Player {
	token: String!
	name: String!
	joined: Game
}

type Game {
	id: ID!
	name: String!
	host: String!
	rounds: Int!
	cardReinforcement: Int!
	continents: [Continent]!
	territories: [Territory]!
}

type Territory {
	name: String!
	continent: String!
	owner: Player
	army: Int!
}

type Continent {
	name: String!
	reinforcement: Int!
}
`;

module.exports = typeDefs;