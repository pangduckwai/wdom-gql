import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF } from '../queries';
import { EVENTS } from '../consts';
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

	const registed = (data.me && !data.me.joined);
	const joined = (data.me && data.me.joined);

	const eventReceived = (event) => {
		switch (event) {
		case EVENTS.GAME_CLOSED:
			if (joined) {
				refetch();
				break;
			} // else go to case GAME_OPENED....
		case EVENTS.GAME_OPENED:
			setGameList(gameList + 1);
			break;
		case EVENTS.GAME_JOINED:
		case EVENTS.GAME_LEFT:
			setJoinGame(joinGame + 1);
			break;
		case EVENTS.GAME_STARTED:
			refetch();
			break;
		case EVENTS.TROOP_ADDED:
			setMapComp(mapComp + 1);
			break;
		default:
			console.log("Event", event, "received...");
			break;
		}
	};

	const mapClicked = () => {
		refetch();
	};

	if (loading) return <p>'Myself' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<>
			<Map
				refetch={refetch}
				player={data.me}
				clicked={mapClicked}
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
						player={data.me}
						key={mapComp} />
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
