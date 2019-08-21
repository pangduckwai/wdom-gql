import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink, concat, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloProvider } from '@apollo/react-hooks';
import { getMainDefinition } from 'apollo-utilities';
import App from './components/app';

const cache = new InMemoryCache();

const authHttp = new ApolloLink((operation, forward) => {
	operation.setContext({
		headers: {
			authorization: sessionStorage.getItem('token') || null
		}
	});
	return forward(operation);
});
const linkHttp = concat(authHttp, new HttpLink({
	uri: 'http://localhost:4000/graphql'
}));

const linkWs = new WebSocketLink({
	uri: 'ws://localhost:4000/subscriptions',
	options: { reconnect: true }
});

const client = new ApolloClient({
	cache,
	link: split(
		({ query }) => {
			const definition = getMainDefinition(query);
			return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
		},
		linkWs,
		linkHttp
	)
});

ReactDOM.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root')
);
