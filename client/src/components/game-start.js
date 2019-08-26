import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { START_GAME } from '../mutations';
import JoinerList from './game-joiners';

export default function StartGame(props) {
	const [render, setRender] = useState(true);

	const [startGame, { loading, error }] = useMutation(START_GAME);

	const handleSubmit = (e) => {
		e.preventDefault();
		setRender(false);
		startGame().then(r => {
			props.refresh({
				player: true,
				game: true
			});
		});
	};

	if (loading) return <p>'StartGame' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<form className="game-ctrl" onSubmit={handleSubmit}>
			{render &&
				<JoinerList />
			}
			<input type="submit" value="Start Game" />
		</form>
	);
}
