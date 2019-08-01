const evn = require('../constants');

const EventStore = require("./events");
const Queries = require("./queries");

const eventStore = new EventStore();
const queries = new Queries({ store: eventStore });

let p1, p2;
let g1;

afterAll(() => {
	// console.log(p1, g1);
	eventStore.find({}).then(list => {
		console.log(list);
	});
	console.log(queries.listPlayers());
});

test("Register new player 'Rick'", () => {
	return eventStore.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Rick' } }).then(response => {
		p1 = response.event.token;
		expect(response.successful).toBeTruthy();
	});
});

test("Register new player 'Nick'", () => {
	return eventStore.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Nick' } }).then(response => {
		p2 = response.event.token;
		expect(response.successful).toBeTruthy();
	});
});

test("Open new game 'Rick's Game'", () => {
	return eventStore.add({ event: evn.GAME_OPENED, payload: { name: "Rick's Game", tokens: [p1] } }).then(response => {
		g1 = response.event.token;
		expect(response.successful).toBeTruthy();
	});
});

test("Nick join Rick's Game", () => {
	return eventStore.add({ event: evn.GAME_JOINED, payload: { tokens: [p2, g1] } }).then(response => {
		g1 = response.event.token;
		expect(response.successful).toBeTruthy();
	});
});

test("List events of a game", () => {
	return eventStore.find({ token: g1 }).then(response => {
		expect(response.length).toEqual(2);
	});
});

test("Take snapshot", () => {
	return queries.snapshot().then(_ => {
		const snap = queries.listPlayers();
		expect(snap.length).toEqual(2);
	});
});