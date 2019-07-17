const { gql } = require('apollo-server');

const typeDefs = gql`
type Query {
	me(token: String!): Player
	# games(
	# 	pageSize: Int
	# 	after: String
	# ): GameConnection!
	# game(id: ID!): Game
}

# type GameConnection {
# 	cursor: String!
# 	hasMore: Boolean!
# 	games: [Game]!
# }

type Mutation {
	join(name: String!): Player
	leave(token: String!): Player
}

type Player {
	token: String!
	name: String!
	seq: Int
#	joint: Game
}

# type Game {
# 	id: ID!
# 	name: String!
# 	host: Player!
# 	rounts: Int!
# 	cardReinforcement: Int!
# 	territories: Territory
# }

# type Territory {
# 	id: String!
# 	continent: Continent!
# 	owner: Player
# 	army: Int!
# }

# type Continent {
#	id: String!
#	reinforcement: Int!
# }
`;

module.exports = typeDefs;