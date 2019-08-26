const { gql } = require('apollo-server-express');

const typeDefs = gql`
type Query {
	events: [Event]!
	me: Player
	myGame: Game
	myTerritories: [Territory]!
	myFellowPlayers: [Player]!
	listPlayers: [Player]!
	listGames: [Game]!
	listAvailableGames: [Game]!
	listTerritories(token: String!): [Territory]!
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
	endTurn(from: String, to: String, amount: Int): Response
	redeemCards(cards: [String]!): Response
}

type Subscription {
	broadcastEvent: Event
	broadcastGameEvent(token: String!): Event
}

type Player {
	token: String!
	name: String!
	reinforcement: Int!
	cards: [Card]!
	redeemable: Boolean
	joined: Game
	order: Int
	conquer: Boolean
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
	fortified: Boolean
	winner: Player
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

type EventData {
	name: String!
	value: String!
}

type Event {
	eventid: String!
	timestamp: String!
	event: Int!
	type: String!
	token: String!
	data: [EventData]!
}

type Response {
	successful: Boolean!
	message: String
	event: Event
}
`;

module.exports = typeDefs;