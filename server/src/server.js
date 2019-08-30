const express = require('express');
const session = require('cookie-session')
const helmet = require('helmet');
// const csrf = require('csurf');
const limit = require('express-rate-limit');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const gameRules = require('./rules');
const EventDS = require('./data/event-ds')
const EventStore = require('./data/event-store');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { mockSetup } = require('./__tests__/mock-setup'); //TEMP!!!

///////////////////
///// Express /////
const xprs = express();

//TODO TEMP!!!
xprs.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
//TODO TEMP!!!

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
	windowMs: 300000, // 900,000 == 15*60*1000 == 15 minutes; 300,000 == 5*60*1000 == 5 minutes
	max: 3000,
	delayMs: 0 // disabled
});
xprs.use(limiter);

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

xprs.get('/export', (req, res) => {
	eventStore.export();
	res.send({"Exporting...": "...Done"});
});

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
	console.log(`🚀 WDOM-GQL listening on port ${PORT}....`);
});
