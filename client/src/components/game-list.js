import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { ALL_GAMES } from '../queries';
import { JOIN_GAME } from '../mutations';
// import { useSubscription } from '@apollo/react-hooks';
// import { BROADCAST_OPENED } from '../subscriptions';
// import JoinGame from './game-join';

export default function GameList(props) {
	const [value, setValue] = useState("");

	// const { data, loading, error, refetch } = useQuery(ALL_GAMES, {
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

	// useSubscription(BROADCAST_OPENED, {
	// 	onSubscriptionData: ({ _, subscriptionData }) => {
	// 		if (subscriptionData.data && subscriptionData.data.broadcastOpened) {
	// 			console.log("BROADCAST_OPENED !!!", JSON.stringify(subscriptionData));
	// 			refetch();
	// 		}
	// 	}
	// });

	const handleSubmit = (e) => {
		e.preventDefault();
		joinGame({ variables: { token: value }}).then(r => {
			props.refetch();
		});
	};

	if (loading || mLoading) return <p>Loading...</p>;

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
			<div className="title bt mt mb">Available games</div>
			<form className="game-ctrl" onSubmit={handleSubmit}>
				<ul className="list" onChange={e => setValue(e.target.value)}>
					{data.listGames.map((game) =>
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
