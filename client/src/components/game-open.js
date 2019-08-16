import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { OPEN_GAME } from '../mutations';
import OpenGameComp from './game-open-comp';

export default function OpenGame(props) {
	const [openGame, { loading, error }] = useMutation(OPEN_GAME, {
		onCompleted(data) {
			if (data.openGame.successful) {
				localStorage.setItem("gameToken", data.openGame.event.token);
			}
		}
	});

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<OpenGameComp
			openGame={openGame}
			refetch={props.refetch} />
	);
}
