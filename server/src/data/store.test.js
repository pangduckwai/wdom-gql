const evn = require('../events');
const { redeemReinforcement } = require("../rules");
const EventStore = require("./events");
const Queries = require("./queries");
const Commands = require("./commands");

const eventStore = new EventStore();
const queries = new Queries({ store: eventStore });
const commands = new Commands({ queries: queries });

let ptokens = [];
let gtokens = [];

beforeAll(async () => {
	console.log("Test setup...");
	await queries.rebuildSnapshot();
});

afterAll(() => {
	// console.log("Games", JSON.stringify(queries.listGames()[0].territories));
	console.log("Games", queries.listGames());
	console.log("Players", queries.listPlayers());
	console.log("Players", queries.idxPlayerName);

	// console.log(JSON.stringify(queries.idxPlayerName));

	// eventStore.find({}).then(list => {
	// 	console.log("Events", list);
	// });
});

const PLAYER_NAMES = ['Rick', 'John', 'Josh', 'Nick', 'Rick', 'Paul', 'Bill', 'Fred'];
test("Register new players", async () => {
	let okay = 0, fail = 0;
	for (const name of PLAYER_NAMES) {
		await commands.registerPlayer({ name: name }).then(value => {
			ptokens.push(value.event.token);
			okay ++;
		}).catch(_ => fail ++);
	}
	expect((okay === 7) && (fail === 1)).toBeTruthy();
});

// test("Assign troops to a player", async () => {
// 	let troops = 0, index = 0, okay = 0, fail = 0;
// 	for (const p of queries.listPlayers()) {
// 		troops = redeemReinforcement(troops);
// 		await eventStore.add({ event: evn.TROOP_ASSIGNED, payload: { tokens: [ptokens[index ++], 'ABCD1234'], amount: troops }})
// 			.then(_ => okay ++).catch(_ => fail ++);
// 	}
// 	expect(troops).toEqual(25);
// });

// test("Troop deployed", async () => {
// 	let index = 0, okay = 0, fail = 0;
// 	for (const p of queries.listPlayers()) {
// 		await eventStore.add({ event: evn.TROOP_DEPLOYED, payload: { tokens: [ptokens[index ++], 'ABCD1234'], amount: 1 }})
// 			.then(_ => okay ++).catch(_ => fail ++);
// 	}
// 	expect((okay === 7) && (fail === 0)).toBeTruthy();
// });

test("Player quit", () => {
	return commands.quitPlayer({ token: ptokens[5] }).then(_ => {
		expect(queries.listPlayers().length).toEqual(6);
	});
});

const GAME_NAMES = [
	{ name: "John's Game", index: 1 }, { name: "Paul's Game", index: 4 }, { name: "John's Game", index: 0 }, { name: "Some game", index: 1}
];
test("Open new game", async () => {
	let okay = 0, fail = 0;
	for (const game of GAME_NAMES) {
		await commands.openGame({ token: ptokens[game.index], name: game.name }).then(value => {
			gtokens.push(value.event.token);
			okay ++;
		}).catch(r => fail ++);
	}
	expect((okay === 2) && (fail === 2)).toBeTruthy();
});

test("Take snapshot", () => {
	return queries.rebuildSnapshot().then(_ => {
		const p = queries.listPlayers();
		const g = queries.listGames();
		expect((p.length === 6) && (g.length === 2)).toBeTruthy();
	});
});

const JOINING = [0, 1, 2, 3, 6];
test("Join game", async () => {
	let okay = 0, fail = 0;
	for (const idx of JOINING) {
		await commands.joinGame({ player: ptokens[idx], game: gtokens[1] }).then(value => {
			okay ++;
		}).catch(error => fail ++);
	}
	expect((okay === 4) && (fail === 1)).toBeTruthy();
});

test("Leave game", () => {
	return commands.leaveGame({ token: ptokens[6] }).then(_ => {
		const p = queries.findPlayerByToken({ token: ptokens[6] });
		expect(typeof(p.joined) === "undefined").toBeTruthy();
	});
});

test("Leave one's own game", () => {
	return commands.leaveGame({ token: ptokens[1] }).catch(error => {
		expect(error.message).toEqual("[LEAVE] Cannot leave player John's own game");
	});
});

test("Close game", () => {
	return commands.closeGame({ token: ptokens[1] }).then(_ => {
		const games = queries.listGames();
		expect(games.length).toEqual(1);
	});
});

test("Close other people's game", () => {
	return commands.closeGame({ token: ptokens[0] }).catch(error => {
		expect(error.message).toEqual("[CLOSE] Can only close player Rick's own game");
	});
});

test("Join game", () => {
	return commands.joinGame({ player: ptokens[1], game: gtokens[1] }).then(_ => {
		const players = queries.listPlayersByGame({ token: gtokens[1] });
		expect(players.length).toEqual(5);
	});
});

test("Start game", () => {
	return commands.startGame({ token: ptokens[4] }).then(value => {
		expect(value.successful).toBeTruthy();
	});
});

test("Setup troops", () => {
	const p = queries.listTerritoryByPlayer({ token: ptokens[4] })
	const g = queries.findGameByToken({ token: gtokens[1] });
	return commands.deployTroops({ token: p[0].owner, territory: p[0].name }).then(value => {
		console.log("Deploy", JSON.stringify(p[0]));
		expect(value.successful).toBeTruthy();
	});
});