import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF, MY_GAME } from '../queries';
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
	const [gameList, setGameList] = useState(0);
	const [joinGame, setJoinGame] = useState(0);

	const { data: myself, loading: loadings, error: errors, refetch: refetchMyself } = useQuery(MYSELF, {
		fetchPolicy: "cache-and-network"
	});

	const { data: myGame, loading: loadingg, error: errorg, refetch: refetchMyGame } = useQuery(MY_GAME, {
		fetchPolicy: "no-cache"
	});

	const registed = (myself.me && !myself.me.joined);
	const joined = (myself.me && myself.me.joined);

	const refetchAll = () => {
		refetchMyGame();
		refetchMyself();
	};

	const eventReceived = (event) => {
		switch (event) {
		case EVENTS.GAME_CLOSED:
			if (joined) {
				refetchMyself();
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
			refetchAll();
			break;
		case EVENTS.TROOP_PLACED:
			refetchAll();
			break;
		case EVENTS.TROOP_ADDED:
			refetchMyGame();
			break;
		default:
			console.log("Event", event, "received...");
			break;
		}
	};

	if (loadings) return <p>'Myself' Loading...</p>;
	if (loadingg) return <p>'MyGame' Loading...</p>;

	if (errors) {
		console.log(JSON.stringify(errors));
		return <p>ERROR</p>;
	}
	if (errorg) {
		console.log(JSON.stringify(errorg));
		return <p>ERROR</p>;
	}

	return (
		<>
			<Map
				refetch={refetchMyself}
				player={myself.me}
				players={myGame.myFellowPlayers}
				game={myGame.myGame}
				clicked={refetchAll} />
			<div id="control">
				{(!myself.me || !myself.me.token) ? (
					<Register refetch={refetchMyself} />
				) : (
					<Greetings refetch={refetchAll} player={myself.me} game={myGame.myGame} />
				)}
				{registed &&
					<>
						<OpenGame refetch={refetchAll} />
						<GameList refetch={refetchAll} key={gameList} />
					</>
				}
				{joined &&
					<div className="title bb mt mb">Game <span className="name">{myGame.myGame.name}</span></div>
				}
				{(joined && (myGame.myGame.host.token === myself.me.token) && (myGame.myGame.rounds < 0)) &&
					<>
						<JoinerList key={joinGame} />
						<StartGame refetch={refetchAll} />
					</>
				}
				{(joined && (myGame.myGame.host.token !== myself.me.token) && (myGame.myGame.rounds < 0)) &&
					<>
						<JoinerList key={joinGame} />
						<div id="msg" className="mt mb">Wait for game to start...</div>
					</>
				}
				{(joined && (myGame.myGame.rounds >= 0)) &&
					<GameStatus
						refetch={refetchMyself}
						player={myself.me}
						game={myGame.myGame} />
				}
			</div>
			{registed &&
				<Subscriber player={myself.me} receiver={eventReceived} />
			}
			{joined &&
				<GameSubscriber game={myGame.myGame} receiver={eventReceived} />
			}
		</>
	);
}
