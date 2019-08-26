import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { START_GAME } from '../mutations';
import JoinerList from './game-joiners';

export default function StartGame() {
	const [startGame, { loading, error }] = useMutation(START_GAME);

	const handleSubmit = (e) => {
		e.preventDefault();
		startGame();
	};

	if (loading) return <p>'StartGame' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<form className="game-ctrl" onSubmit={handleSubmit}>
			<JoinerList />
			<input type="submit" value="Start Game" />
		</form>
	);
}
