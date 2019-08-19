const express = require('express');
const session = require('cookie-session')
const helmet = require('helmet');
// const csrf = require('csurf');
const limit = require('express-rate-limit');
const cors = require('cors'); //TODO TEMP: not for production use!!!

const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const gameRules = require('./rules');
const EventDS = require('./data/event-ds')
const EventStore = require('./data/event-store');
const { mockSetup } = require('./__tests__/mock-setup'); //TEMP!!!

const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');

///////////////////
///// Express /////
const xprs = express();
xprs.set('trust proxy', 1); // trust first proxy
xprs.use(session({
		name: 'session',
		keys: ['097yohgffyr65', 'q4vqwdaasd23q4'],
		cookie: {
			secure: true,
			httpOnly: true,
			domain: 'sea9.org',
			path: '/',
			expires: new Date(Date.now() + 60 * 60 * 1000)
		}
}));
xprs.use(helmet());
// xprs.use(csrf());
// xprs.use(function( req, res, next ) {
// 	res.locals.csrftoken = req.csrfToken() ;
// 	next() ;
// });
let limiter = new limit({
	windowMs: 900000, // 900,000 == 15*60*1000 == 15 minutes
	max: 150,
	delayMs: 0 // disabled
});
xprs.use(limiter);
xprs.use(cors()); //TODO TEMP: not for production use!!!

//////////////////
///// Apollo /////
const eventStore = new EventStore();
const polo = new ApolloServer({
	context: async ({ req }) => {
		const token = (req.headers && req.headers.authorization) ? req.headers.authorization : null;
		if (token) {
			return { token: token };
		}
		return null;
	},
	typeDefs,
	resolvers,
	dataSources: () => ({
		eventDS: new EventDS({ store: eventStore, rules: gameRules })
	}),
	uploads: false
});
mockSetup({ eventDS: new EventDS({ store: eventStore, rules: gameRules })}); //TEMP!!!

polo.applyMiddleware({ app: xprs });

const schema = makeExecutableSchema({
	typeDefs,
	resolvers
});

const PORT = 4000;
const server = createServer(xprs);
server.listen(PORT, () => {
	new SubscriptionServer({
		execute, subscribe, schema
	}, {
		server: server,
		path: '/subscriptions'
	});
	console.log('🚀 WDOM-GQL listening on port', PORT);
});
