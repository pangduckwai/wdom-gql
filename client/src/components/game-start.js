import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { START_GAME } from '../mutations';
import StartGameComp from './game-start-comp';

export default function StartGame(props) {
	const [startGame, { loading, error }] = useMutation(START_GAME);

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<StartGameComp
			startGame={startGame}
			refetch={props.refetch} />
	);
}
