const { ApolloServer } = require('apollo-server-express');
const { createTestClient } = require('apollo-server-testing');
const os = require('os');
const path = require('path');
const typeDefs = require('../schema');
const resolvers = require('../resolvers');
const EventDS = require('../data/event-ds');
const EventStore = require('../data/event-store');
const gameRules = require('../rules');
const consts = require('../consts');
const { readln } = require('../utils');

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
	// eventStore.export();
});

let createServer = (session) => {
	let obj = {
		typeDefs,
		resolvers,
		dataSources: () => ({
			eventDS: eventDS
		})
	};
	if (session) {
		return {
			context: () => ({ sessionid: session }),
			...obj
		};
	} else {
		return obj;
	}
}

describe('Test game play', () => {
	it('Use events from file as test script', done => {
		const tokenMap = {};

		function process(line, index) {
			return new Promise(async (resolve, reject) => {
				let mut, res, names, games, ptkns;//, gtkns;
				const e = JSON.parse(line);
				switch (e.event) {
					case consts.PLAYER_REGISTERED:
						mut = createTestClient(new ApolloServer(createServer())).mutate;
						names = e.data.filter(d => (d.name === "playerName"));
						if (names.length !== 1) break;

						res = await mut({
							mutation: REGISTER,
							variables: { name: names[0].value },
						});
						if (res.data.registerPlayer && res.data.registerPlayer.successful) {
							tokenMap[e.token] = res.data.registerPlayer.event.eventid;
							resolve(res);
						} else {
							console.log(index, "ERROR", JSON.stringify(res));
							reject(res);
						}
						break;
					case consts.GAME_OPENED:
						ptkns = e.data.filter(d => (d.name === "playerToken"));
						games = e.data.filter(d => (d.name === "gameName"));
						if ((ptkns.length !== 1) && (games.length !== 1)) break;
						mut = createTestClient(new ApolloServer(createServer(tokenMap[ptkns[0].value]))).mutate;

						res = await mut({
							mutation: OPEN_GAME,
							variables: { name: games[0].value },
						});
						if (res.data.openGame && res.data.openGame.successful) {
							tokenMap[e.token] = res.data.openGame.event.token;
							resolve(res);
						} else {
							console.log(index, "ERROR", JSON.stringify(res));
							reject(res);
						}
						break;
					default:
						console.log(index, line);
						resolve(line);
						break;
				}
			});
		}

		function finished(value) {
			expect(value).toBe(19);
			done();
		}

		expect(readln({
			path: path.join(os.tmpdir(), 'wdom_read', 'wdom-export.txt'),
			encoding: 'utf-8',
			readSize: 65536,
			process,
			finished
		}));
	}, 30000);
});
