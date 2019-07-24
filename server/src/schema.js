const { gql } = require('apollo-server');

const typeDefs = gql`
type Query {
	players: [Player]!
	player(token: String!): Player
	me: Player
	# games(
	# 	pageSize: Int
	# 	after: String
	# ): GameConnection!
	games: [Game]!
	game(id: ID!): Game
	gameByHost(token: String!): Game
}

# type GameConnection {
# 	cursor: String!
# 	hasMore: Boolean!
# 	games: [Game]!
# }

type Mutation {
	register(name: String!): Player
	leave(token: String!): Player
	create(name: String!): Game
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

# type Continent {
#	name: String!
#	reinforcement: Int!
# }
`;

module.exports = typeDefs;

/*
mutation Reg {
	register(name: "Paul") {
		name
		token
	}
}

query Myself {
	me {
		name
		token
		joined {
			name
		}
	}
}

query Players {
  players {
    name
    token
    joined {
      name
    }
  }
}

query Player {
	player(token: "kFSAgDddROFgB1dfoixpOV0dlC2ldqZ3cnppA7DyZF8=") {
		name
		joined {
			name
		}
	}
}

mutation NewGame {
  create(name: "My Game") {
    id
    name
    host {
      name
    }
  }
}

query Games {
  games {
    id
    name
    host {
      name
    }
  }
}
*/