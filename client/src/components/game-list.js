import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { ALL_GAMES } from '../queries';
import { JOIN_GAME } from '../mutations';

export default function GameList(props) {
	const [value, setValue] = useState("");

	const { data, loading, error } = useQuery(ALL_GAMES, {
		fetchPolicy: "cache-and-network"
	});

	const [joinGame, { loading: mLoading, error: mError }] = useMutation(JOIN_GAME, {
		onCompleted(data) {
			if (data.joinGame.successful) {
				sessionStorage.setItem("gameToken", data.joinGame.event.token);
			}
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		joinGame({ variables: { token: value }}).then(r => {
			props.refresh({ player: true, game: true });
		});
	};

	if (loading || mLoading) return <p>'GameList' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	if (mError) {
		console.log(JSON.stringify(mError));
		return <p>ERROR</p>;
	}

	return (
		<>
			<div className="title mb">Available games</div>
			<form className="game-ctrl" onSubmit={handleSubmit}>
				<ul className="list" onChange={e => setValue(e.target.value)}>
					{data.listAvailableGames.map((game) =>
						(<li key={game.token}>
							<input
								type="radio"
								name="choose"
								value={game.token} />
							<label>{game.name} (host: {game.host.name})</label>
						</li>)
					)}
				</ul>
				<input type="submit" value="Join" />
			</form>
		</>
	);
}
