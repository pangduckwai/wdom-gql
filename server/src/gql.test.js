const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');

const { REGISTER, QUIT, OPEN, CLOSE, JOIN, LEAVE, START, DEPLOY } = require('./mutations');
const { PLAYERS, GAMES } = require('./queries');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const EventDS = require('./data/event-ds');
const EventStore = require('./data/event-store');

let eventStore;
let eventDS;

let ptokens = [];
let gtokens = [];

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
				console.log("OPEN okay 1", JSON.stringify(response));
				gtokens.push(response.data.openGame.event.token);
				okay ++;
				console.log("OPEN okay 2", JSON.stringify(response));
			}).catch(_ => fail ++);
		}
		console.log("Open", okay, fail);
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
				console.log("JOIN okay", JSON.stringify(response));
				okay ++;
			}).catch(e => {
				fail ++;
			});
		}
		console.log("Join", okay, fail);
		expect((okay === 4) && (fail === 1)).toBeTruthy();
	});
});

describe('Wrap up', () => {
	it('Players', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		await query({ query: PLAYERS }).then(v => {
			console.log("Players", JSON.stringify(v.data.listPlayers));
			expect(v.data.listPlayers.length).toEqual(6);
		});
	});

	it('Games', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		await query({ query: GAMES }).then(v => {
			console.log("Games", JSON.stringify(v.data.listGames));
			expect(v.data.listGames.length).toEqual(2);
		});
	});
});