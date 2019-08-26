import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import Greetings from './player-greetings';
import Register from './player-register';
import OpenGame from './game-open';

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

	const registed = (data.me && !data.me.joined);
	const joined = (data.me && data.me.joined);

	if (loading) return <p>'MYSELF' Loading...</p>;

	if (error) {
		return <><p>ERROR</p><p>{JSON.stringify(error)}</p></>;
	}

	return (
		<>
			{(!data.me || !data.me.token) ? (
				<Register refetch={refetch} />
			) : (
				<Greetings refetch={refetch} player={data.me} setPlayer={props.setPlayer} refresh={props.refresh} />
			)}
			{registed &&
				<OpenGame refetch={refetch} setPlayer={props.setPlayer} refresh={props.refresh} />
			}
			{joined &&
				<div className="title bb mb">Game <span className="name">{data.me.joined.name}</span></div>
			}
		</>
	);
}
