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
	await queries.snapshot();
});

afterAll(() => {
	// console.log("Games", queries.listGames());
	console.log("Players", queries.listPlayers());

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
		}).catch(r => {
			console.log(r.message);
			fail ++;
		});
	}
	expect((okay === 2) && (fail === 2)).toBeTruthy();
});

test("Take snapshot", () => {
	return queries.snapshot().then(_ => {
		const p = queries.listPlayers();
		const g = queries.listGames();
		expect((p.length === 6) && (g.length === 2)).toBeTruthy();
	});
});

test("Join game", () => {
	return commands.joinGame({ player: ptokens[0], game: gtokens[1] }).then(r => {
		expect(r.successful).toBeTruthy();
	});
});
