import React, { useState } from 'react';
import { EVENTS } from '../consts';
import Subscriber from './subscriber';
import GameSubscriber from './subscriber-game';
import Map from './map';
import GameList from './game-list';
import StartGame from './game-start';
import JoinerList from './game-joiners';
import GameStatus from './game-status';
import Player from './player';
import './app.css';

export default function App() {
	const [playerKey, setPlayerKey] = useState(Math.floor(Math.random() * 100000));
	const [gameKey, setGameKey] = useState(Math.floor(Math.random() * 100000));
	const [listKey, setListKey] = useState(Math.floor(Math.random() * 100000));
	const [joinKey, setJoinKey] = useState(Math.floor(Math.random() * 100000));

	const [playerToken, setPlayerToken] = useState(null);
	const [playerName, setPlayerName] = useState(null);
	const [playerOrder, setPlayerOrder] = useState(null);
	const [reinforcement, setReinforcement] = useState(0);
	const [gameToken, setGameToken] = useState(null);
	const [gameHost, setGameHost] = useState(null);
	const [turnToken, setTurnToken] = useState(null);
	const [turnName, setTurnName] = useState(null);
	const [rounds, setRounds] = useState(-1);
	const [territories, setTerritories] = useState(null);

	const setPlayer = (player) => {
		if (player) {
			setPlayerToken(player.token);
			setPlayerName(player.name);
			setReinforcement(player.reinforcement);
			setPlayerOrder(player.order);
		} else {
			setPlayerToken(null);
			setPlayerName(null);
			setReinforcement(0);
		}
	};
	const setGame = (game) => {
		if (game) {
			setGameToken(game.token);
			setGameHost(game.host.token);
			if (game.turn) setTurnToken(game.turn.token);
			if (game.turn) setTurnName(game.turn.name);
			setRounds(game.rounds);
			if (game.territories) setTerritories(game.territories);
		} else {
			setGameToken(null);
			setGameHost(null);
			setTurnToken(null);
			setTurnName(null);
			setRounds(-1);
			setTerritories(null);
		}
	};

	const registed = (playerToken && !gameToken);
	const joined = (playerToken && gameToken);
	const isHost = (gameHost === playerToken);
	const isSetup = (rounds < 0);

	const refresh = (flags) => {
		if (flags.player) setPlayerKey(playerKey + 1);
		if (flags.game) setGameKey(gameKey + 1);
		if (flags.list) setListKey(listKey + 1);
		if (flags.joined) setJoinKey(joinKey + 1);
	};

	const eventReceived = (event) => {
		switch (event) {
		case EVENTS.GAME_CLOSED:
			let flag = {
				player: true,
				game: true
			};
		case EVENTS.GAME_OPENED:
			if (!flag) flag = {};
			flag.list = true;
			refresh(flag);
			break;
		case EVENTS.GAME_JOINED:
		case EVENTS.GAME_LEFT:
			refresh({ joined: true });
			break;
		case EVENTS.GAME_STARTED:
			let parm = {};
			if (gameHost === playerToken) parm.joined = true;
		case EVENTS.TROOP_PLACED:
			if (!parm) parm = {};
			parm.player = true;
			parm.game = true;
			refresh(parm);
			break;
		case EVENTS.TROOP_ADDED:
		case EVENTS.TERRITORY_ATTACKED:
			let args = {
				player: true,
				game: true
			};
			refresh(args);
			break;
		default:
			console.log("Event", event, "received...");
			break;
		}
	};

	return (
		<>
			<Map
				key={gameKey}
				callback={setGame}
				playerToken={playerToken}
				playerName={playerName}
				playerOrder={playerOrder} />
			<div id="control">
				<Player
					key={playerKey}
					refresh={refresh}
					setPlayer={setPlayer} />
				{registed &&
					<GameList
						key={listKey}
						refresh={refresh} />
				}
				{(joined && isHost && isSetup) &&
					<StartGame
						key={joinKey} />
				}
				{(joined && !isHost && isSetup) &&
					<>
						<JoinerList key={joinKey} />
						<div id="msg" className="mt mb">Wait for game to start...</div>
					</>
				}
				{(joined && !isSetup) &&
					<GameStatus
						refresh={refresh}
						playerToken={playerToken}
						reinforcement={reinforcement}
						turnToken={turnToken}
						turnName={turnName}
						rounds={rounds}
						territories={territories} />
				}
			</div>
			{registed &&
				<Subscriber receiver={eventReceived} />
			}
			{joined &&
				<GameSubscriber game={gameToken} receiver={eventReceived} />
			}
		</>
	);
}
