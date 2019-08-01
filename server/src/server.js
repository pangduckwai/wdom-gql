const { ApolloServer } = require('apollo-server');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const PlayerDS = require('./data/player')
const GameDS = require('./data/game');

const PlayerStore = require('./data/in-memory/players');
const GameStore = require('./data/in-memory/games');

const playerStore = new PlayerStore();
const gameStore = new GameStore();

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
