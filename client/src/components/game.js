import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MY_GAME } from '../queries';
import OpenGame from './game-open';

export default function Game(props) {
	const { data, loading, error, refetch } = useQuery(MY_GAME, {
		fetchPolicy: "cache-and-network",
		onCompleted(data) {
			if (data.myGame) {
				props.setGame(data.myGame, data.myFellowPlayers);
			} else {
				props.setGame(null, null);
			}
		}
	});

	if (error) {
		return <><p>ERROR</p><p>{JSON.stringify(error)}</p></>;
	}
	if (loading) return <div className="title bb mb">Loading...</div>;

	if (!props.playerToken) return <span>&nbsp;</span>;

	return (
		<>
			{!(data.myGame) ? (
				<OpenGame refetch={refetch} refresh={props.refresh} />
			) : (
				<div className="title bb mb">Game <span className="name">{data.myGame.name}</span></div>
			)}
		</>
	);
}
