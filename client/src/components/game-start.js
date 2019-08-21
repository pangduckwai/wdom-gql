import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { START_GAME } from '../mutations';

export default function StartGame(props) {
	const [startGame, { loading, error }] = useMutation(START_GAME);

	const handleSubmit = (e) => {
		e.preventDefault();
		startGame().then(r => {
			props.refetch();
		});
	};

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<form className="game-ctrl" onSubmit={handleSubmit}>
			<input type="submit" value="Start Game" />
		</form>
	);
}
