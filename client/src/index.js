import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloLink, concat } from 'apollo-link';
import { ApolloProvider } from '@apollo/react-hooks';
import App from './components/app';

const cache = new InMemoryCache();

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' });

const authMiddleware = new ApolloLink((operation, forward) => {
	operation.setContext({
		headers: {
			authorization: localStorage.getItem('token') || null
		}
	});

	return forward(operation);
});

const client = new ApolloClient({
	cache,
	link: concat(authMiddleware, httpLink)
});

ReactDOM.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root')
);
