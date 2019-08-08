const { ApolloServer } = require('apollo-server');
const { createTestClient } = require('apollo-server-testing');
const typeDefs = require('../schema');
const resolvers = require('../resolvers');
const EventDS = require('../data/event-ds');
const EventStore = require('../data/event-store');
const gameRules = require('../rules');

const { REGISTER, QUIT_PLAYER, OPEN_GAME, CLOSE_GAME, JOIN_GAME, LEAVE_GAME, START_GAME, TAKE_ACTION, START_TURN } = require('../mutations');
const { MYSELF, MY_GAME, FELLOW_PLAYERS, ALL_PLAYERS, ALL_GAMES, MY_HOLDING } = require('../queries');
const { mockShuffleCards, mockDoBattle } = require('../_mock/mock-rules');

let eventStore;
let eventDS;

let ptokens = {};
let gtokens = [];

// must be a bug.... apparently the first statement in then() will always run, afterward the flow will somehow move to catch(), so do something useless at the
// begining of then().  NOTE cannot use console.log() for some unknown reason...
let jtokens = [];

beforeAll(() => {
	console.log("Test setup...");
	gameRules.shuffleCards = mockShuffleCards;
	gameRules.doBattle = mockDoBattle;
	eventStore = new EventStore();
	eventDS = new EventDS({ store: eventStore, rules: gameRules });
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

describe('Test rules', () => {
	it('Continent Reinforcement - All', () => {
		const territories = gameRules.buildTerritory();
		const reinforcement = gameRules.continentReinforcement(territories);
		expect(reinforcement).toEqual(24);
	});

	it('Continent Reinforcement - Africa', () => {
		const territories = gameRules.buildTerritory().filter(t => t.continent === 'Africa');
		const reinforcement = gameRules.continentReinforcement(territories);
		expect(reinforcement).toEqual(3);
	});

	it('Continent Reinforcement - Asia', () => {
		const territories = gameRules.buildTerritory().filter(t => t.continent === 'Asia');
		const reinforcement = gameRules.continentReinforcement(territories);
		expect(reinforcement).toEqual(7);
	});

	it('Continent Reinforcement - Australia', () => {
		const territories = gameRules.buildTerritory().filter(t => t.continent === 'Australia');
		const reinforcement = gameRules.continentReinforcement(territories);
		expect(reinforcement).toEqual(2);
	});

	it('Continent Reinforcement - Europe', () => {
		const territories = gameRules.buildTerritory().filter(t => t.continent === 'Europe');
		const reinforcement = gameRules.continentReinforcement(territories);
		expect(reinforcement).toEqual(5);
	});

	it('Continent Reinforcement - North-America', () => {
		const territories = gameRules.buildTerritory().filter(t => t.continent === 'North-America');
		const reinforcement = gameRules.continentReinforcement(territories);
		expect(reinforcement).toEqual(5);
	});

	it('Continent Reinforcement - South-America', () => {
		const territories = gameRules.buildTerritory().filter(t => t.continent === 'South-America');
		const reinforcement = gameRules.continentReinforcement(territories);
		expect(reinforcement).toEqual(2);
	});

	// it('Roll dice', () => {
	// 	gameRules.doBattle({attacker: 1, defender: 0});
	// 	gameRules.doBattle({attacker: 2, defender: 1});
	// 	gameRules.doBattle({attacker: 3, defender: 2});
	// 	gameRules.doBattle({attacker: 4, defender: 3});
	// 	gameRules.doBattle({attacker: 5, defender: 4});

	// 	// gameRules.doBattle({attacker: 10, defender: 7});
	// 	// gameRules.doBattle({attacker: 1, defender: 7});
	// 	// gameRules.doBattle({attacker: 10, defender: 0});
	// 	// gameRules.doBattle({attacker: 2, defender: 7});
	// 	// gameRules.doBattle({attacker: 10, defender: 1});
	// 	// gameRules.doBattle({attacker: 3, defender: 7});
	// 	// gameRules.doBattle({attacker: 10, defender: 2});
	// 	// gameRules.doBattle({attacker: 5, defender: 7});
	// 	// gameRules.doBattle({attacker: 10, defender: 3});
	// })
});

const PLAYER_NAMES = ['Rick', 'John', 'Josh', 'Nick', 'Rick', 'Paul', 'Bill', 'Fred', 'Jack'];
const GAME_NAMES = [{ name: "John's Game", index: 'John' }, { name: "Paul's Game", index: 'Paul' }, { name: "John's Game", index: 'Rick' }, { name: "Some game", index: 'John'}];
const JOINING = ['Rick', 'John', 'Josh', 'Nick', 'Bill', 'Fred', 'Jack'];
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
				if (response.data.registerPlayer) {
					ptokens[name] = response.data.registerPlayer.event.token;
					okay ++;
				} else {
					if (response.errors[0].message === "[REGISTER] Player 'Rick' already exists") fail ++;
				}
			});
		}
		expect((okay === 8) && (fail === 1)).toBeTruthy();
	});

	it('Open new game', async () => {
		let okay = 0, fail = 0;
		for (const game of GAME_NAMES) {
			const server = new ApolloServer(createServer(ptokens[game.index]));
			const { mutate } = createTestClient(server);
			await mutate({
				mutation: OPEN_GAME,
				variables: { name: game.name },
			}).then(response => {
				if (response.data.openGame) {
					gtokens.push(response.data.openGame.event.token);
					okay ++;
				} else {
					if ((response.errors[0].message === "[OPEN] Game 'John's Game' already exists") ||
						(response.errors[0].message === "[OPEN] You are already in the game 'John's Game'"))
						fail ++;
				}
			});
		}
		expect((okay === 2) && (fail === 2)).toBeTruthy();
	});

	it('Join game', async () => {
		let okay = 0, fail = 0;
		for (const idx of JOINING) {
			const server = new ApolloServer(createServer(ptokens[idx]));
			const { mutate } = createTestClient(server);
			await mutate({
				mutation: JOIN_GAME,
				variables: { token: gtokens[1] },
			}).then(response => {
				if (response.data.joinGame) {
					jtokens.push(response.data.joinGame.event.token);
					okay ++;
				} else {
					if ((response.errors[0].message === "[JOIN] Game 'Paul's Game' is full already") ||
						(response.errors[0].message === "[JOIN] You are already in the game 'John's Game'"))
						fail ++;
				}
			});
		}
		expect((okay === 5) && (fail === 2)).toBeTruthy();
	});

	it('Player quit', async () => {
		const server = new ApolloServer(createServer(ptokens['Bill']));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: QUIT_PLAYER }); //.then(v => console.log(JSON.stringify(v))).catch(e => console.log(JSON.stringify(e)));
		const res = await query({ query: ALL_PLAYERS });
		expect(res.data.listPlayers.length).toEqual(7);
	});

	it('Player quit', async () => {
		const server = new ApolloServer(createServer(ptokens['Jack']));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: QUIT_PLAYER });
		const res = await query({ query: ALL_PLAYERS });
		expect(res.data.listPlayers.length).toEqual(6);
	});

	it('Leave game', async () => {
		const server1 = new ApolloServer(createServer(ptokens['Fred']));
		const { mutate } = createTestClient(server1);
		await mutate({ mutation: LEAVE_GAME });

		const server2 = new ApolloServer(createServer(ptokens['Rick']));
		const { query } = createTestClient(server2);
		const res = await query({ query: FELLOW_PLAYERS });
		expect(res.data.myFellowPlayers.length).toEqual(4);
	});

	it('Start game', async () => {
		const server = new ApolloServer(createServer(ptokens['John']));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: START_GAME }).then(response => expect(response.errors[0].message).toEqual("[START] Minimum number of players is 3"));
	});

	it("Leave one's own game", async () => {
		const server = new ApolloServer(createServer(ptokens['John']));
		const { mutate } = createTestClient(server);
		await mutate({ mutation: LEAVE_GAME }).then(e =>
			expect(e.errors[0].message).toEqual("[LEAVE] Cannot leave your own game")
		);
	});

	it("Close one's own game", async () => {
		const server1 = new ApolloServer(createServer(ptokens['John']));
		const { mutate } = createTestClient(server1);
		await mutate({ mutation: CLOSE_GAME });

		const server2 = new ApolloServer(createServer());
		const { query } = createTestClient(server2);
		const res = await query({ query: ALL_GAMES });
		expect(res.data.listGames.length).toEqual(1);
	});

	it("Close other's game", async () => {
		const server = new ApolloServer(createServer(ptokens['Rick']));
		const { mutate } = createTestClient(server);
		await mutate({ mutation: CLOSE_GAME }).then(e =>
			expect(e.errors[0].message).toEqual("[CLOSE] Can only close your own game")
		);
	});

	it('Join game', async () => {
		const server = new ApolloServer(createServer(ptokens['John']));
		const { mutate, query } = createTestClient(server);
		await mutate({
			mutation: JOIN_GAME,
			variables: { token: gtokens[1] },
		});
		const res = await query({ query: FELLOW_PLAYERS });
		expect(res.data.myFellowPlayers.length).toEqual(5);
	});

	it('Start game', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: START_GAME });

		const res = await query({ query: MY_GAME });
		expect(res.data.myGame.rounds).toEqual(0);
	});

	it('List initial territories', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { query } = createTestClient(server);
		await query({ query: MY_HOLDING }).then(v => {
			expect(v.data.myTerritories.length).toEqual(8);
		});
	});

	it('Finishing setup', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { query } = createTestClient(server);
		const res1 = await query({ query: FELLOW_PLAYERS });
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
				mutation: TAKE_ACTION,
				variables: { name: plys[players[idx].name].holdings[plys[players[idx].name].index].name },
			});

			const myg = await eventDS.findGameByToken({ token: gtokens[1] });
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

describe('Play game', () => {
	it('Start turn', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { mutate, query } = createTestClient(server);
		await mutate({ mutation: START_TURN });
		await query({ query: MYSELF }).then(v => {
			expect(v.data.me.reinforcement).toEqual(5);
		});
	});

	it('Deploy reinforcement', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { mutate, query } = createTestClient(server);
		const res1 = await query({ query: MYSELF });
		const self = res1.data.me;
		const count = self.reinforcement;
		for (let i = 0; i < count; i ++) {
			await mutate({
				mutation: TAKE_ACTION,
				variables: { name: 'Venezuela' },
			});
		}

		const res2 = await query({ query: MY_HOLDING });
		const res3 = await query({ query: MYSELF });
		expect((res2.data.myTerritories.filter(t => t.name === 'Venezuela')[0].troops === 8) && (res3.data.me.reinforcement === 0)).toBeTruthy();
	});

	it('Attack', async () => {
		const server = new ApolloServer(createServer(ptokens['Paul']));
		const { mutate, query } = createTestClient(server);
		await mutate({
			mutation: TAKE_ACTION,
			variables: { name: 'Venezuela' },
		});
		await mutate({
			mutation: TAKE_ACTION,
			variables: { name: 'Mexico' },
		});
		await mutate({
			mutation: TAKE_ACTION,
			variables: { name: 'Mexico' },
		});
		await query({ query: MY_HOLDING }).then(v => {
			expect(v.data.myTerritories.length).toEqual(9);
		});
	});
});

describe('Wrap up', () => {
	it('Players', async () => {
		const server = new ApolloServer(createServer());
		const { query } = createTestClient(server);
		await query({ query: ALL_PLAYERS }).then(v => {
			console.log("Players", v.data.listPlayers.length, JSON.stringify(v.data.listPlayers, null, 3));
			expect(v.data.listPlayers.length).toEqual(6);
		});
	});

	// it('Games', async () => {
	// 	const server = new ApolloServer(createServer());
	// 	const { query } = createTestClient(server);
	// 	await query({ query: ALL_GAMES }).then(v => {
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