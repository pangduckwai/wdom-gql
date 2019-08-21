import React, { useState } from 'react';
// import { useQuery, useMutation } from '@apollo/react-hooks';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
// import { TAKE_ACTION } from '../mutations';
import Map from './map';
import Greetings from './greetings';
import Register from './register';
import OpenGame from './game-open';
import GameList from './game-list';
import StartGame from './game-start';
import JoinerList from './game-joiners';
import GameStatus from './game-status';
import { convert } from '../utils';
import './map.css';
// import { BROADCAST_EVENT } from '../subscriptions';

export default function App() {
	const [focused, setFocused] = useState("");
	const [selected, setSelected] = useState("");

	const { data, loading, error, refetch } = useQuery(MYSELF);

	// const [takeAction, { loading: mLoading, error: mError }] = useMutation(TAKE_ACTION);

	// useSubscription(BROADCAST_EVENT, {
	// 	onSubscriptionData: ({ _, subscriptionData }) => {
	// 		if (subscriptionData.data && subscriptionData.data.broadcastEvent) {
	// 			console.log("BROADCAST_EVENT !!!", JSON.stringify(subscriptionData));
	// 			refetch();
	// 		}
	// 	}
	// });

	const handleClear = (e) => {
		e.preventDefault();
		setSelected("");
	};

	const handleUnhover = (e) => {
		e.preventDefault();
		setFocused("");
	};

	const handleHover = (e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		if (typeof(e.target.dataset.tid) !== "undefined") {
			const value = convert(e.target.dataset.tid);
			setFocused(value);
		}
	};

	const handleClick = (e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		if (typeof(e.target.dataset.tid) !== "undefined") {
			const value = convert(e.target.dataset.tid);
			setFocused(value);
			setSelected(value);
			// takeAction({ variables: { name: value }});
			// refetch();
		}
	};

	// if (loading || mLoading) return <p>Loading...</p>;
	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	// if (mError) {
	// 	console.log(JSON.stringify(mError));
	// 	return <p>ERROR</p>;
	// }

	const registed = data.me && !data.me.joined;
	const joined = data.me && data.me.joined;
	return (
		<>
			<Map
				focused={focused}
				selected={selected}
				player={data.me}
				players={data.myFellowPlayers}
				handleClear={handleClear}
				handleUnhover={handleUnhover}
				handleClick={handleClick}
				handleHover={handleHover} />
			<div id="control">
				{(!data.me || !data.me.token) ? (
					<Register refetch={refetch} />
				) : (
					<Greetings player={data.me} refetch={refetch} />
				)}
				{registed &&
					<>
						<OpenGame refetch={refetch} />
						<GameList refetch={refetch} />
					</>
				}
				{joined &&
					<div className="title bb mt mb">Game <span className="name">{data.me.joined.name}</span></div>
				}
				{(joined && (data.me.joined.host.token === data.me.token) && (data.me.joined.rounds < 0)) &&
					<>
						<JoinerList refetch={refetch} token={data.me.joined.token} />
						<StartGame refetch={refetch} />
					</>
				}
				{(joined && (data.me.joined.host.token !== data.me.token) && (data.me.joined.rounds < 0)) &&
					<>
						<JoinerList refetch={refetch} token={data.me.joined.token} />
						<div id="msg" className="mt mb">Wait for game to start...</div>
					</>
				}
				{(joined && (data.me.joined.rounds >= 0)) &&
					<GameStatus
						refetch={refetch}
						player={data.me} />
				}
			</div>
		</>
	);
}
