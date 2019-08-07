const { ApolloServer } = require('apollo-server');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const gameRules = require('./rules');
const EventDS = require('./data/event-ds')
const EventStore = require('./data/event-store');

const eventStore = new EventStore();

const server = new ApolloServer({
	context: async ({ req }) => {
		const token = (req.headers && req.headers.token) ? req.headers.token : null;
		if (token) {
			return { token: token };
		}
		return null;
	},
	typeDefs,
	resolvers,
	dataSources: () => ({
		eventDS: new EventDS({ store: eventStore, rules: gameRules })
	})
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
