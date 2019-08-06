const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');

const { REGISTER, QUIT, OPEN, CLOSE, JOIN, LEAVE, START, ACTION } = require('./mutations');
const { MY_GAME, FELLOW, PLAYERS, GAMES, MY_HOLDING } = require('./queries');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const EventDS = require('./data/event-ds');
const EventStore = require('./data/event-store');

let eventStore;
let eventDS;

let ptokens = {};
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
const GAME_NAMES = [{ name: "John's Game", index: 'John' }, { name: "Paul's Game", index: 'Paul' }, { name: "John's Game", index: 'Rick' }, { name: "Some game", index: 'John'}];
const JOINING = ['Rick', 'John', 'Josh', 'Nick', 'Fred'];
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
				ptokens[name] = response.data.registerPlayer.event.token;
				okay ++;
			}).catch(_ => fail ++);
		}
		expect((okay === 7) && (fail === 1)).toBeTruthy();
	});

	it('Player quit', async () => {
		const server = new ApolloServer(createServer(ptokens['Bill']));
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
		const server1 = new ApolloServer(createServer(ptokens['Fred']));
		const { mutate } = createTestClient(server1);
		await mutate({ mutation: LEAVE });

		const server2 = new ApolloServer(createServer(ptokens['Rick']));
		const { query } = createTestClient(server2);
		const res = await query({ query: FELLOW });
		expect(res.data.myFellowPlayers.length).toEqual(4);
	});

	it("Leave one's own game", async () => {
		const server = new ApolloServer(createServer(ptokens['John']));
		const { mutate } = createTestClient(server);
		await mutate({ mutation: LEAVE }).then(e =>
			expect(e.errors[0].message).toEqual("[LEAVE] Cannot leave your own game")
		);
	});

	it("Close one's own game", async () => {
		const server1 = new ApolloServer(createServer(ptokens['John']));
		const { mutate } = createTestClient(server1);
		await mutate({ mutation: CLOSE });

		const server2 = new ApolloServer(createServer());
		const { query } = createTestClient(server2);
		const res = await query({ query: GAMES });
		expect(res.data.listGames.length).toEqual(1);
	});

	it("Close other's game", async () => {
		const server = new ApolloServer(createServer(ptokens['Rick']));
		const { mutate } = createTestClient(server);
		await mutate({ mutation: CLOSE }).then(e =>
			expect(e.errors[0].message).toEqual("[CLOSE] Can only close your own game")
		);
	});

	it('Join game', async () => {
		const server = new ApolloServer(createServer(ptokens['John']));
		const { mutate, query } = createTestClient(server);
		await mutate({
			mutation: JOIN,
			variables: { token: gtokens[1] },
		});
		const res = await query({ query: FELLOW });
		expect(res.data.myFellowPlayers.length).toEqual(5);
	});

	it('Start game', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: START });

		const res = await query({ query: MY_GAME });
		expect(res.data.myGame.rounds).toEqual(0);
	});

	it('List initial territories', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { query } = createTestClient(server);
		const res = await query({ query: MY_HOLDING }).then(v => {
			expect(v.data.myTerritories.length).toEqual(8);
		});
	});

	it('Finishing setup', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { query } = createTestClient(server);
		const res1 = await query({ query: FELLOW });
		const players = res1.data.myFellowPlayers;
		const res2 = await query({ query: MY_GAME });
		const game = res2.data.myGame;
		let idx = 0;
		for (let i = 0; i < players.length; i ++) {
			if (players[i].name === game.host.name) {
				idx = i;
				break;
			}
		}

		let plys = {};
		let count = 0;
		while (count < 200) {
			const svr = new ApolloServer(createServer(ptokens[players[idx].name]));
			const { mutate, query } = createTestClient(svr);

			if (!plys[players[idx].name]) {
				plys[players[idx].name] = {};
				plys[players[idx].name]['index'] = 0;
				const res = await query({ query: MY_HOLDING });
				plys[players[idx].name]['holdings'] = res.data.myTerritories;
			}

			await mutate({
				mutation: ACTION,
				variables: { name: plys[players[idx].name].holdings[plys[players[idx].name].index].name },
			});//.then(response => {
			// 	console.log(JSON.stringify(response));
			// });
			// }).catch(error => console.log(JSON.stringify(error)));

			const myg = await eventDS.findGameByToken({ token: gtokens[1] }); //query({ query: MY_GAME });
			if (myg.rounds > 0) break;

			plys[players[idx].name].index ++;
			if (plys[players[idx].name].index >= plys[players[idx].name].holdings.length) plys[players[idx].name].index = 0;

			idx ++;
			if (idx >= players.length) idx = 0;

			count ++;
		}

		expect(count).toEqual(84);
	});
});

describe('Wrap up', () => {
	// it('Players', async () => {
	// 	const server = new ApolloServer(createServer());
	// 	const { query } = createTestClient(server);
	// 	await query({ query: PLAYERS }).then(v => {
	// 		console.log("Players", v.data.listPlayers.length, JSON.stringify(v.data.listPlayers, null, 3));
	// 		expect(v.data.listPlayers.length).toEqual(6);
	// 	});
	// });

	// it('Games', async () => {
	// 	const server = new ApolloServer(createServer());
	// 	const { query } = createTestClient(server);
	// 	await query({ query: GAMES }).then(v => {
	// 		console.log("Games", v.data.listGames.length, JSON.stringify(v.data.listGames, null, 3));
	// 		expect(v.data.listGames.length).toEqual(1);
	// 	});
	// });

	it('Active game', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { query } = createTestClient(server);
		await query({ query: MY_GAME }).then(v => {
			console.log("My game", JSON.stringify(v.data.myGame, null, 3));
			expect(v.data.myGame.rounds).toEqual(1);
		});
	});
});