const { ApolloServer } = require('apollo-server');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const PlayerDS = require('./data/player')

const store = require('./data/in-memory/players');

const server = new ApolloServer({
	typeDefs,
	resolvers,
	dataSources: () => ({
		playerDS: new PlayerDS({ store })
	})
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});