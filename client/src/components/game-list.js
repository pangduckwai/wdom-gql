import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { ALL_GAMES } from '../queries';
import JoinGame from './game-join';

export default function ListGames(props) {
	const { data, loading, error } = useQuery(ALL_GAMES);

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<JoinGame
			games={data.listGames}
			refetch={props.refetch} />
	);
}
