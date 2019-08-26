import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import Greetings from './player-greetings';
import Register from './player-register';

export default function Player(props) {
	const { data, loading, error, refetch } = useQuery(MYSELF, {
		fetchPolicy: "cache-and-network",
		onCompleted(data) {
			if (data.me) {
				props.setPlayer(data.me);
			} else {
				props.setPlayer(null);
			}
		}
	});

	if (error) {
		return <><p>ERROR</p><p>{JSON.stringify(error)}</p></>;
	}
	if (loading) return <div id="greeting">Loading...</div>;
	return (
		<>
			{(!data.me || !data.me.token) ? (
				<Register refetch={refetch} />
			) : (
				<Greetings
					refetch={refetch}
					player={data.me}
					gameToken={props.gameToken}
					gameHost={props.gameHost}
					setPlayer={props.setPlayer}
					refresh={props.refresh} />
			)}
		</>
	);
}
