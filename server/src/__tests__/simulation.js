const { ApolloServer } = require('apollo-server-express');
const { createTestClient } = require('apollo-server-testing');
const typeDefs = require('../schema');
const resolvers = require('../resolvers');
const EventDS = require('../data/event-ds');
const EventStore = require('../data/event-store');
const gameRules = require('../rules');

const {
	REGISTER, QUIT_PLAYER, OPEN_GAME, CLOSE_GAME, JOIN_GAME, LEAVE_GAME, START_GAME, TAKE_ACTION, END_TURN, REDEEM_CARD
} = require('./mock-mutations');
const { MYSELF, MY_GAME, FELLOW_PLAYERS, ALL_PLAYERS, ALL_GAMES, MY_TERRITORIES, PLAYER_TERRITORIES } = require('./mock-queries');
const { mockShuffleCards, mockDoBattle, mockInitTroops, mockInitPlayer } = require('./mock-rules');
const testScripts = require('./mock-scripts');

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
	gameRules.initialTroops = mockInitTroops;
	gameRules.chooseFirstPlayer = mockInitPlayer;
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
	it('Continent Reinforcement - Africa', () => {
		expect(gameRules.continentReinforcement(gameRules.buildTerritory().filter(t => t.continent === 'Africa'))).toEqual(3);
		expect(gameRules.continentReinforcement(gameRules.buildTerritory().filter(t => t.continent === 'Asia'))).toEqual(7);
		expect(gameRules.continentReinforcement(gameRules.buildTerritory().filter(t => t.continent === 'Australia'))).toEqual(2);
		expect(gameRules.continentReinforcement(gameRules.buildTerritory().filter(t => t.continent === 'Europe'))).toEqual(5);
		expect(gameRules.continentReinforcement(gameRules.buildTerritory().filter(t => t.continent === 'North-America'))).toEqual(5);
		expect(gameRules.continentReinforcement(gameRules.buildTerritory().filter(t => t.continent === 'South-America'))).toEqual(2);
	});

	// it('Roll dice', () => {
	// 	gameRules.doBattle({attacker: 1, defender: 0});
	// 	gameRules.doBattle({attacker: 2, defender: 1});
	// 	gameRules.doBattle({attacker: 3, defender: 2});
	// 	gameRules.doBattle({attacker: 4, defender: 3});
	// 	gameRules.doBattle({attacker: 5, defender: 4});
	// })
});

describe('Preparation', () => {
	it('Create players', async () => {
		let okay = 0, fail = 0;
		const server = new ApolloServer(createServer());
		const { mutate } = createTestClient(server);
		for (const name of testScripts.SETUP_PLAYERS) {
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
		for (const game of testScripts.SETUP_GAMES) {
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
		for (const idx of testScripts.SETUP_JOIN) {
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

	it('Finishing setup', async () => {
		let current = 'Paul';
		let count = 0;
		while (count < 200) {
			const server = new ApolloServer(createServer(ptokens[current]));
			const { mutate, query } = createTestClient(server);

			await mutate({
				mutation: TAKE_ACTION,
				variables: { name: testScripts.SETUP_TROOPS[current].majors[testScripts.SETUP_TROOPS[current].index] }
			});
			testScripts.SETUP_TROOPS[current].index ++;
			if (testScripts.SETUP_TROOPS[current].index >= testScripts.SETUP_TROOPS[current].majors.length)
				testScripts.SETUP_TROOPS[current].index = 0;

			const response = await query({ query: MY_GAME });
			const game = response.data.myGame;
			if (game.rounds > 0) break;
			current = game.turn.name;

			count ++;
		}
		expect(count).toEqual(82);
	});
});

describe("Test Gameplay", () => {
	let current = 'Paul';
	it('Game script', async () => {
		for (let script of testScripts.GAME_SCRIPT) {
			expect(current).toEqual(script.p);

			const server = new ApolloServer(createServer(ptokens[current]));
			const { mutate, query } = createTestClient(server);

			// await mutate({ mutation: START_TURN });

			if (script.c) {
				for (const set of script.c) {
					await mutate({
						mutation: REDEEM_CARD,
						variables: { cards: set },
					});
				}
			}

			const res1 = await query({ query: MYSELF });
			const received = res1.data.me.reinforcement;
			// expect(res1.data.me.reinforcement).toEqual(script.r.xpt);

			let total = 0;
			for (const reinforce of script.r.lst) {
				for (let count = 0; count < reinforce.amt; count ++) {
					await mutate({ mutation: TAKE_ACTION, variables: { name: reinforce.name }});
					total ++;
				}
			}
			const res2 = await query({ query: MYSELF });
			expect(res2.data.me.reinforcement).toEqual(0);
			expect(received).toEqual(total);

			for (const attack of script.a.lst) {
				for (let count = 0; count < ((attack.repeat) ? attack.repeat : 1); count ++) {
					if (attack.from) await mutate({ mutation: TAKE_ACTION, variables: { name: attack.from }});
					await mutate({ mutation: TAKE_ACTION, variables: { name: attack.to }});
				}
			}
			await query({ query: MY_TERRITORIES }).then(v => {
				expect(v.data.myTerritories.length).toEqual(script.a.xpt);
			});

			if (script.f) {
				await mutate({
					mutation: END_TURN,
					variables: { from: script.f.from, to: script.f.to, amount: script.f.amt },
				});
			} else {
				await mutate({ mutation: END_TURN });
			}
			await query({ query: MY_GAME }).then(v => {
				current = v.data.myGame.turn.name;
				let value = -1;
				const rst = v.data.myGame.territories.filter(t => t.name === v.data.myGame.current.name);
				if (rst.length > 0) value = rst[0].troops
				expect(value).toEqual(script.x);
			});
		}
	});
});

describe('Wrap up', () => {
	// it('Players', async () => {
	// 	const server = new ApolloServer(createServer());
	// 	const { query } = createTestClient(server);
	// 	await query({ query: ALL_PLAYERS }).then(v => {
	// 		console.log("Players", v.data.listPlayers.length, JSON.stringify(v.data.listPlayers, null, 3));
	// 		expect(v.data.listPlayers.length).toEqual(6);
	// 	});
	// });

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

		const res = await query({ query: FELLOW_PLAYERS });
		const players = res.data.myFellowPlayers;
		for (const player of players) {
			const resp = await query({ query: PLAYER_TERRITORIES, variables: { token: ptokens[player.name] } });
			const holdings = resp.data.listTerritories;
			console.log("Players", JSON.stringify(player, null, 3), holdings.length, JSON.stringify(holdings, null, 3));
		}

		await query({ query: ALL_GAMES }).then(v => {
			const round = Math.floor((v.data.listGames[0].rounds - 1) / 5) + 1; //TODO get 'real' player numbers instead
			console.log("Round", round, JSON.stringify(v.data.listGames[0], null, 3));
			expect(v.data.listGames.length).toEqual(1);
		});
	});
});