const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');

const typeDefs = require('../schema');
const resolvers = require('../resolvers');
const PlayerDS = require('../data/player');
const GameDS = require('../data/game');
const { REGISTER, LEAVE, START, END, JOIN, QUIT, BEGIN, NEXT } = require('../mutations');
const { PLAYERS, GAMES, JOINED, HOSTED } = require('../queries');

const PlayerStore = require('../data/in-memory/players');
const GameStore = require('../data/in-memory/games');

let playerStore;
let gameStore;
let playerDS;
let gameDS;

let tokens = [];
let ids = [];

beforeAll(() => {
	console.log("Test setup...");
	playerStore = new PlayerStore();
	gameStore = new GameStore();
	playerDS = new PlayerDS({ store: playerStore });
	gameDS = new GameDS({ store: gameStore });
});

afterAll(() => {
	console.log("Test teardown...");
	// console.log(JSON.stringify(tokens));
	// console.log(JSON.stringify(ids));
});

let createServer = (player) => {
	let obj = {
		typeDefs,
		resolvers,
		dataSources: () => ({
			playerDS: playerDS,
			gameDS: gameDS
		})
	};
	if (player) {
		return {
			context: () => ({ player: player }),
			...obj
		};
	} else {
		return obj;
	}
}

describe('Prepare players', () => {
	it('Create player 1', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: 'Rick' },
		});
		tokens.push(res.data.register);
		expect(res.data.register.name).toEqual('Rick');
	});

	it('Create player 2', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: 'John' },
		});
		tokens.push(res.data.register);
		expect(res.data.register.name).toEqual('John');
	});

	it('Create player 3', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: 'Josh' },
		});
		tokens.push(res.data.register);
		expect(res.data.register.name).toEqual('Josh');
	});

	it('Create player 4', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: 'Nick' },
		});
		tokens.push(res.data.register);
		expect(res.data.register.name).toEqual('Nick');
	});

	it('Create player 5', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: 'Paul' },
		});
		tokens.push(res.data.register);
		expect(res.data.register.name).toEqual('Paul');
	});

	it('Create player 6', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: "Bill" },
		});
		tokens.push(res.data.register);
		expect(res.data.register.name).toEqual("Bill");
	});

	it('Create player 7', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: "Fred" },
		});
		tokens.push(res.data.register);
		expect(res.data.register.name).toEqual("Fred");
	});

	it('Create player failed', async () => {
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: REGISTER,
			variables: { name: 'John' },
		});
		expect(res.errors[0].message).toEqual("Player 'John' already exists");
	});
});

describe('Prepare games', () => {
	it('Create game 1', async () => {
		const server = new ApolloServer(createServer(tokens[1]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: START,
			variables: { name: "John's Game" },
		});
		ids.push(res.data.start);
		expect(res.data.start.rounds).toEqual(-1);
	});

	it('Create game 2', async () => {
		const server = new ApolloServer(createServer(tokens[4]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: START,
			variables: { name: "Paul's Game" },
		});
		ids.push(res.data.start);
		expect(res.data.start.host.name).toEqual("Paul");
	});
});

describe('Join games', () => {
	it('Rick join game', async () => {
		const server = new ApolloServer(createServer(tokens[0]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: JOIN,
			variables: { id: ids[1].id },
		});
		expect(res.data.join.joined.name).toEqual("Paul's Game");
	});

	it('Josh join game', async () => {
		const server = new ApolloServer(createServer(tokens[2]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: JOIN,
			variables: { id: ids[1].id },
		});
		expect(res.data.join.joined.name).toEqual("Paul's Game");
	});

	it('Nick join game', async () => {
		const server = new ApolloServer(createServer(tokens[3]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: JOIN,
			variables: { id: ids[1].id },
		});
		expect(res.data.join.joined.name).toEqual("Paul's Game");
	});

	it('Bill join game', async () => {
		const server = new ApolloServer(createServer(tokens[5]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: JOIN,
			variables: { id: ids[1].id },
		});
		expect(res.data.join.joined.name).toEqual("Paul's Game");
	});
});

describe('List players and games', () => {
	it('List all players', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		const res = await query({ query: PLAYERS });
		expect(res.data.players.length).toEqual(7);
	});

	it("List players in John's game", async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		const res = await query({
			query: JOINED,
			variables: { id: ids[0].id },
		});
		expect(res.data.joined.length).toEqual(1);
	});

	it("List players in Paul's game", async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		const res = await query({
			query: JOINED,
			variables: { id: ids[1].id },
		});
		expect(res.data.joined.length).toEqual(5);
	});

	it("Find game hosted by John", async () => {
		const server = new ApolloServer(createServer(tokens[1]));
		const { query } = createTestClient(server);
		const res = await query({ query: HOSTED });
		expect(res.data.hosted.host.name).toEqual("John");
	});

	it("Find game hosted by Paul", async () => {
		const server = new ApolloServer(createServer(tokens[4]));
		const { query } = createTestClient(server);
		const res = await query({ query: HOSTED });
		expect(res.data.hosted.host.name).toEqual("Paul");
	});

	it("Rick not hosting any game", async () => {
		const server = new ApolloServer(createServer(tokens[0]));
		const { query } = createTestClient(server);
		const res = await query({ query: HOSTED });
		expect(res.data.hosted).toBeNull();
	});
});

describe('Starting a game', () => {
	it('Try to begin a not-ready game', async () => {
		const server = new ApolloServer(createServer(tokens[1]));
		const { mutate } = createTestClient(server);
		const res = await mutate({ mutation: BEGIN });
		expect(res.data.begin).toBeNull();
	});

	it('End a game', async () => {
		const server = new ApolloServer(createServer(tokens[1]));
		const { mutate } = createTestClient(server);
		const res = await mutate({ mutation: END });
		expect(res.data.end[0].name).toEqual("John");
	});

	it('John join game', async () => {
		const server = new ApolloServer(createServer(tokens[1]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: JOIN,
			variables: { id: ids[1].id },
		});
		expect(res.data.join.joined.name).toEqual("Paul's Game");
	});

	it('Bill quit game', async () => {
		const server = new ApolloServer(createServer(tokens[5]));
		const { mutate } = createTestClient(server);
		const res = await mutate({ mutation: QUIT });
		expect(res.data.quit.name).toEqual("Bill");
	});

	it('Begin a game', async () => {
		const server = new ApolloServer(createServer(tokens[4]));
		const { mutate } = createTestClient(server);
		const res = await mutate({ mutation: BEGIN });
		expect(res.data.begin.rounds).toEqual(0);
	});

	it('List all players', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		const res = await query({ query: PLAYERS });
		expect(res.data.players[1].reinforcement + res.data.players[2].reinforcement).toEqual(33);
	});

	it('Fred tried to join game', async () => {
		const server = new ApolloServer(createServer(tokens[6]));
		const { mutate } = createTestClient(server);
		const res = await mutate({
			mutation: JOIN,
			variables: { id: ids[1].id },
		});
		expect(res.data.join).toBeNull();
	});

	it('Bill leave game server', async () => {
		const server = new ApolloServer(createServer(tokens[5]));
		const { mutate } = createTestClient(server);
		const res = await mutate({ mutation: LEAVE });
		expect(res.data.leave.name).toEqual("Bill");
	});

	it('List all players', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		const res = await query({ query: PLAYERS });
		expect(res.data.players.length).toEqual(6);
	});

	it('List all games', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		const res = await query({ query: GAMES });
		expect(res.data.games[0].host.token === res.data.games[0].turn.token).toBeTruthy();
	});
});

describe('Playing a game', () => {
	it("Next player's turn", async () => {
		const server = new ApolloServer(createServer(tokens[4]));
		const { mutate } = createTestClient(server);
		const res = await mutate({ mutation: NEXT });
		console.log(JSON.stringify(res));
		expect(res.data.next.turn.name).toEqual("Rick");
	});

});