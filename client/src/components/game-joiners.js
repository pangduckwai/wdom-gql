import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { JOINERS } from '../queries';

export default function JoinerList() {
	const { data, loading, error } = useQuery(JOINERS, {
		fetchPolicy: "no-cache"
	});

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}
	if (loading) return <div className="title">Loading...</div>;
	return (
		<>
			<div className="title">Joined players</div>
			<ul className="list">
				{data.myFellowPlayers.map((player, index) =>
					<li key={index}>- <span className="name">{player.name}</span></li>
				)}
			</ul>
		</>
	);
}
