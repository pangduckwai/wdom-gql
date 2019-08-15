import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import Game from './game';

export default function App() {
	const { data, loading, error, refetch } = useQuery(MYSELF);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>ERROR</p>;

	if (!data.me) {
		return (
			<Game
				refetch={refetch} />
		);
	} else {
		return (
			<Game
				refetch={refetch}
				player={data.me} />
		);
	}
}
