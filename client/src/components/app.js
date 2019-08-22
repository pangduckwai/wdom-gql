import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import Subscriber from './subscriber';
import GameSubscriber from './subscriber-game';
import Map from './map';
import Greetings from './greetings';
import Register from './register';
import OpenGame from './game-open';
import GameList from './game-list';
import StartGame from './game-start';
import JoinerList from './game-joiners';
import GameStatus from './game-status';
import './map.css';

export default function App() {
	const [mapComp, setMapComp] = useState(0);
	const [gameList, setGameList] = useState(0);
	const [joinGame, setJoinGame] = useState(0);

	const { data, loading, error, refetch } = useQuery(MYSELF, {
		fetchPolicy: "cache-and-network"
	});

	// useSubscription(BROADCAST_EVENT, {
	// 	onSubscriptionData: ({ _, subscriptionData }) => {
	// 		if (subscriptionData.data && subscriptionData.data.broadcastEvent) {
	// 			console.log("BROADCAST_EVENT !!!", JSON.stringify(subscriptionData));
	// 			refetch();
	// 		}
	// 	}
	// });

	const registed = (data.me && !data.me.joined);
	const joined = (data.me && data.me.joined);

	const eventReceived = (event) => {
		switch (event) {
		case 6:
			if (joined) {
				refetch();
				break;
			} // else go to case 5...
		case 5:
			setGameList(gameList + 1);
			break;
		case 3:
		case 4:
			setJoinGame(joinGame + 1);
			break;
		case 7:
			refetch();
			break;
		case 23:
			setMapComp(mapComp + 1); // TODO TEMP there is no event with number 23...
			break;
		default:
			console.log("Event", event, "received...");
			break;
		}
	};

	// if (loading || mLoading) return <p>Loading...</p>;
	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<>
			<Map
				refetch={refetch}
				player={data.me}
				key={mapComp} />
			<div id="control">
				{(!data.me || !data.me.token) ? (
					<Register refetch={refetch} />
				) : (
					<Greetings refetch={refetch} player={data.me} />
				)}
				{registed &&
					<>
						<OpenGame refetch={refetch} />
						<GameList refetch={refetch} key={gameList} />
					</>
				}
				{joined &&
					<div className="title bb mt mb">Game <span className="name">{data.me.joined.name}</span></div>
				}
				{(joined && (data.me.joined.host.token === data.me.token) && (data.me.joined.rounds < 0)) &&
					<>
						<JoinerList key={joinGame} />
						<StartGame refetch={refetch} />
					</>
				}
				{(joined && (data.me.joined.host.token !== data.me.token) && (data.me.joined.rounds < 0)) &&
					<>
						<JoinerList key={joinGame} />
						<div id="msg" className="mt mb">Wait for game to start...</div>
					</>
				}
				{(joined && (data.me.joined.rounds >= 0)) &&
					<GameStatus
						refetch={refetch}
						player={data.me} />
				}
			</div>
			{registed &&
				<Subscriber player={data.me} receiver={eventReceived} />
			}
			{joined &&
				<GameSubscriber game={data.me.joined} receiver={eventReceived} />
			}
		</>
	);
}
