const { ApolloServer } = require('apollo-server');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const PlayerDS = require('./data/player')
const GameDS = require('./data/game');

const PlayerStore = require('./data/in-memory/players');
const GameStore = require('./data/in-memory/games');

const playerStore = new PlayerStore();
const gameStore = new GameStore();

//TODO TEMP!!!!!!!!!!!
let testPrepare = async (players, games) => {
	let p1 = await players.create({ name: "Rick" });
	let p2 = await players.create({ name: "John" });
	let p3 = await players.create({ name: "Josh" });
	let p4 = await players.create({ name: "Nick" });
	let p5 = await players.create({ name: "Paul" });
	let p6 = await players.create({ name: "Bill" });
	// let p7 = await players.create({ name: "Fred" });

	let g2, g5;
	if (p2) {
		g2 = await games.create({ name: "John's Game", token: p2.token });
		if (g2) await players.update({ token: p2.token, id: g2.id });
	}
	if (p5) {
		g5 = await games.create({ name: "Paul's Game", token: p5.token });
		if (g5) await players.update({ token: p5.token, id: g5.id });
	}

	if (p1) await players.update({ token: p1.token, id: g5.id });
	if (p3) await players.update({ token: p3.token, id: g5.id });
	if (p4) await players.update({ token: p4.token, id: g5.id });
	if (p6) await players.update({ token: p6.token, id: g5.id });
	// if (p7) await players.update({ token: p7.token, id: g2.id });

	console.log("🚀  Test data prepared !!!!!");
};
testPrepare(playerStore, gameStore);
//TODO TEMP!!!!!!!!!!!

const server = new ApolloServer({
	context: async ({ req }) => {
		const token = (req.headers && req.headers.token) ? req.headers.token : null;
		let ret = { player: {} };
		if (token) {
			try {
				const player = await playerStore.find({ token: token });
				const p = player ? player : {};
				ret = { player: p };
				return ret;
			} catch (e) {}
		}
		return null;
	},
	typeDefs,
	resolvers,
	dataSources: () => ({
		playerDS: new PlayerDS({ store: playerStore }),
		gameDS: new GameDS({ store: gameStore })
	})
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
