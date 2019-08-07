const { gql } = require('apollo-server');

const typeDefs = gql`
type Query {
	me: Player
	myGame: Game
	myTerritories: [Territory]!
	myFellowPlayers: [Player]!
	listPlayers: [Player]!
	listGames: [Game]!
}

type Mutation {
	registerPlayer(name: String!): Response
	quitPlayer: Response
	openGame(name: String!): Response
	closeGame: Response
	joinGame(token: String!): Response
	leaveGame: Response
	startGame: Response
	takeAction(name: String!): Response
	startTurn: Response
}

type Player {
	token: String!
	name: String!
	reinforcement: Int!
	cards: [Card]!
	joined: Game
}

type Game {
	token: String!
	name: String!
	host: Player!
	turn: Player
	rounds: Int!
	redeemed: Int!
	current: Territory
	cards: [Card]!
	territories: [Territory]!
}

type Territory {
	name: String!
	continent: String!
	owner: Player
	troops: Int!
	connected: [Territory]!
}

type Card {
	name: String!
	type: String!
}

type Event {
	eventid: String!
	timestamp: String!
	event: Int!
	type: String!
	name: String
	amount: Int
	tokens: [String]
	token: String!
}

type Response {
	successful: Boolean!
	message: String
	event: Event
}
`;

module.exports = typeDefs;