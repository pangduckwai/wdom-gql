import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { ALL_GAMES } from '../queries';
import ListGamesComp from './list-game-comp';

export default function ListGames(props) {
	const { data, loading, error } = useQuery(ALL_GAMES);
	if (loading) return <p>Loading...</p>;
	if (error) return <p>ERROR</p>;
	return (
		<ListGamesComp
			games={data.listGames}
			refetch={props.refetch} />
	);
}
