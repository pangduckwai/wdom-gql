import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { ALL_GAMES } from '../queries';

export default function Games() {
	const { data, loading, error } = useQuery(ALL_GAMES);
	if (loading) return <p>Loading...</p>;
	if (error) return <p>ERROR</p>;
	return (
		<div>
			<h3>Games to join</h3>
			<ul>
				{data.listGames.map(g => (
					<li key={g.token}>{g.name}&nbsp;&nbsp;({g.host.name})</li>
				))}
			</ul>
		</div>
	);
}
