const { ApolloServer } = require('apollo-server');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const PlayerDS = require('./data/player')

const playerStore = require('./data/in-memory/players');
const gameStore = require('./data/in-memory/games');

const server = new ApolloServer({
	context: async ({ req }) => {
		const token = (req.headers && req.headers.token) ? req.headers.token : null;
		const player = await playerStore.find({ token: token });
		return { player: player ? player : null };
	},
	typeDefs,
	resolvers,
	dataSources: () => ({
		playerDS: new PlayerDS({ playerStore }),
		gameDS: new GameDS({ gameStore })
	})
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});