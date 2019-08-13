import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider } from '@apollo/react-hooks';
// import Game from './components/game';
import PlayerList from './components/temp-plist';

const cache = new InMemoryCache();
const link = new HttpLink({
	uri: 'http://localhost:4000/'
});

const client = new ApolloClient({
	cache,
	link
});

ReactDOM.render(
	<ApolloProvider client={client}>
		<PlayerList />
	</ApolloProvider>,
	document.getElementById('root')
);
