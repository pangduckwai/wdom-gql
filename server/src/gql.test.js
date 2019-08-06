const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');

const { REGISTER, QUIT, OPEN, CLOSE, JOIN, LEAVE, START, DEPLOY } = require('./mutations');
const { MY_GAME, FELLOW, PLAYERS, GAMES } = require('./queries');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const EventDS = require('./data/event-ds');
const EventStore = require('./data/event-store');

let eventStore;
let eventDS;

let ptokens = [];
let gtokens = [];

// must be a bug.... apparently the first statement in then() will always run, afterward the flow will somehow move to catch(), so do something useless at the
// begining of then().  NOTE cannot use console.log() for some unknown reason...
let jtokens = [];

beforeAll(() => {
	console.log("Test setup...");
	eventStore = new EventStore();
	eventDS = new EventDS({ store: eventStore });
});

afterAll(() => {
	console.log("Test teardown...");
});

let createServer = (token) => {
	let obj = {
		typeDefs,
		resolvers,
		dataSources: () => ({
			eventDS: eventDS
		})
	};
	if (token) {
		return {
			context: () => ({ token: token }),
			...obj
		};
	} else {
		return obj;
	}
}

const PLAYER_NAMES = ['Rick', 'John', 'Josh', 'Nick', 'Rick', 'Paul', 'Bill', 'Fred'];
const GAME_NAMES = [{ name: "John's Game", index: 1 }, { name: "Paul's Game", index: 4 }, { name: "John's Game", index: 0 }, { name: "Some game", index: 1}];
const JOINING = [0, 1, 2, 3, 6];
describe('Preparation', () => {
	it('Create players', async () => {
		let okay = 0, fail = 0;
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		for (const name of PLAYER_NAMES) {
			await mutate({
				mutation: REGISTER,
				variables: { name: name },
			}).then(response => {
				ptokens.push(response.data.registerPlayer.event.token);
				okay ++;
			}).catch(_ => fail ++);
		}
		expect((okay === 7) && (fail === 1)).toBeTruthy();
	});

	it('Player quit', async () => {
		const server = new ApolloServer(createServer(ptokens[5]));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: QUIT }); //.then(v => console.log(JSON.stringify(v))).catch(e => console.log(JSON.stringify(e)));
		const res = await query({ query: PLAYERS });
		expect(res.data.listPlayers.length).toEqual(6);
	});

	it('Open new game', async () => {
		let okay = 0, fail = 0;
		for (const game of GAME_NAMES) {
			const server = new ApolloServer(createServer(ptokens[game.index]));
			const { mutate } = createTestClient(server);
			await mutate({
				mutation: OPEN,
				variables: { name: game.name },
			}).then(response => {
				gtokens.push(response.data.openGame.event.token);
				okay ++;
			}).catch(_ => fail ++);
		}
		expect((okay === 2) && (fail === 2)).toBeTruthy();
	});

	it('Join game', async () => {
		let okay = 0, fail = 0;
		for (const idx of JOINING) {
			const server = new ApolloServer(createServer(ptokens[idx]));
			const { mutate } = createTestClient(server);
			await mutate({
				mutation: JOIN,
				variables: { token: gtokens[1] },
			}).then(response => {
				jtokens.push(response.data.joinGame.event.token);
				okay ++;
			}).catch(_ => fail ++);
		}
		expect((okay === 4) && (fail === 1)).toBeTruthy();
	});

	it('Leave game', async () => {
		const server1 = new ApolloServer(createServer(ptokens[6]));
		const { mutate } = createTestClient(server1);
		await mutate({ mutation: LEAVE });

		const server2 = new ApolloServer(createServer(ptokens[0]));
		const { query } = createTestClient(server2);
		const res = await query({ query: FELLOW });
		expect(res.data.myFellowPlayers.length).toEqual(4);
	});

	it("Leave one's own game", async () => {
		const server = new ApolloServer(createServer(ptokens[1]));
		const { mutate } = createTestClient(server);
		await mutate({ mutation: LEAVE }).then(e =>
			expect(e.errors[0].message).toEqual("[LEAVE] Cannot leave your own game")
		);
	});

	it("Close one's own game", async () => {
		const server1 = new ApolloServer(createServer(ptokens[1]));
		const { mutate } = createTestClient(server1);
		await mutate({ mutation: CLOSE });

		const server2 = new ApolloServer(createServer(ptokens[0]));
		const { query } = createTestClient(server2);
		const res = await query({ query: GAMES });
		expect(res.data.listGames.length).toEqual(1);
	});

	it("Close other's game", async () => {
		const server = new ApolloServer(createServer(ptokens[0]));
		const { mutate } = createTestClient(server);
		await mutate({ mutation: CLOSE }).then(e =>
			expect(e.errors[0].message).toEqual("[CLOSE] Can only close your own game")
		);
	});

	it("Join game", async () => {
		const server = new ApolloServer(createServer(ptokens[1]));
		const { mutate, query } = createTestClient(server);
		await mutate({
			mutation: JOIN,
			variables: { token: gtokens[1] },
		});
		const res = await query({ query: FELLOW });
		expect(res.data.myFellowPlayers.length).toEqual(5);
	});

	it("Start game", async () => {
		const server = new ApolloServer(createServer(ptokens[4]));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: START });

		const res = await query({ query: MY_GAME });
		expect(res.data.myGame.rounds).toEqual(0);
	});
});

describe('Wrap up', () => {
	it('Players', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		await query({ query: PLAYERS }).then(v => {
			console.log("Players", v.data.listPlayers.length, JSON.stringify(v.data.listPlayers, null, 3));
			expect(v.data.listPlayers.length).toEqual(6);
		});
	});

	it('Games', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		await query({ query: GAMES }).then(v => {
			console.log("Games", v.data.listGames.length, JSON.stringify(v.data.listGames, null, 3));
			expect(v.data.listGames.length).toEqual(1);
		});
	});

	it('Active game', async () => {
		const server = new ApolloServer(createServer(ptokens[4]));
		const { query } = createTestClient(server);
		await query({ query: MY_GAME }).then(v => {
			console.log("My game", JSON.stringify(v.data.myGame, null, 3));
			expect(v.data.myGame.rounds).toEqual(0);
		});
	});
});