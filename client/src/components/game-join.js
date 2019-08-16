import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { JOIN_GAME } from '../mutations';
import GamesComp from './game-comp';

export default function JoinGame(props) {
	const [joinGame, { loading, error }] = useMutation(JOIN_GAME, {
		onCompleted(data) {
			if (data.joinGame.successful) {
				localStorage.setItem("gameToken", data.joinGame.event.token);
			}
		}
	});

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<GamesComp
			games={props.games}
			joinGame={joinGame}
			refetch={props.refetch} />
	);
}
