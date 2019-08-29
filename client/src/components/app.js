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
import Game from './game';
import Cards from './cards';
import './app.css';
import './cards.css';
import './game.css';
import './map.css';

export default function App() {
	const [playerKey, setPlayerKey] = useState(Math.floor(Math.random() * 100000));
	const [gameKey, setGameKey] = useState(Math.floor(Math.random() * 100000));
	const [listKey, setListKey] = useState(Math.floor(Math.random() * 100000));
	const [joinKey, setJoinKey] = useState(Math.floor(Math.random() * 100000));

	const [playerToken, setPlayerToken] = useState(null);
	const [playerName, setPlayerName] = useState(null);
	const [playerCards, setPlayerCards] = useState(null);
	const [playerOrder, setPlayerOrder] = useState(0);
	const [reinforcement, setReinforcement] = useState(0);
	const [gameToken, setGameToken] = useState(null);
	const [gameHost, setGameHost] = useState(null);
	const [turnToken, setTurnToken] = useState(null);
	const [turnName, setTurnName] = useState(null);
	const [rounds, setRounds] = useState(-1);
	const [players, setPlayers] = useState(null);
	const [territories, setTerritories] = useState(null);

	const setPlayer = (player) => {
		if (player) {
			setPlayerToken(player.token);
			setPlayerName(player.name);
			setPlayerCards(player.cards);
			setReinforcement(player.reinforcement);
			setPlayerOrder(player.order);
		} else {
			setPlayerToken(null);
			setPlayerName(null);
			setPlayerCards(null);
			setReinforcement(0);
			setPlayerOrder(0);
		}
	};
	const setGame = (game, players) => {
		if (game) {
			setGameToken(game.token);
			setGameHost(game.host.token);
			if (game.turn) setTurnToken(game.turn.token);
			if (game.turn) setTurnName(game.turn.name);
			setRounds(game.rounds);
			if (players) setPlayers(players);
			if (game.territories) setTerritories(game.territories);
		} else {
			setGameToken(null);
			setGameHost(null);
			setTurnToken(null);
			setTurnName(null);
			setRounds(-1);
			setPlayers(null);
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
			if (gameHost === playerToken) break;
		case EVENTS.TROOP_PLACED:
		case EVENTS.TROOP_ADDED:
		case EVENTS.TERRITORY_ATTACKED:
		case EVENTS.TURN_ENDED:
			refresh({
				player: true,
				game: true
			});
			break;
		default:
			console.log("Event", event, "received....");
			break;
		}
	};


	let territoryIndex = {};
	if (territories && territories !== null) {
		territories.forEach((t, i) => {
			territoryIndex[t.name] = i;
		});
	}
	// console.log("Cards", JSON.stringify(playerCards));
	// const cards = [
	// 	{ name: "Congo", type: "Artillery" },
	// 	{ name: "Western-United-States", type: "Infantry" },
	// 	{ name: "Alberta", type: "Cavalry" },
	// 	{ name: "China", type: "Artillery" },
	// 	{ name: "India", type: "Infantry" }
	// ]; // TODO TEMP!!!!!!!!!!!!!!!!!!!!!!  cards={(playerCards.length > 0) ? playerCards : cards}
	return (
		<>
			<Map
				callback={setGame}
				playerToken={playerToken}
				playerName={playerName}
				playerOrder={playerOrder}
				gameToken={gameToken}
				turnToken={turnToken}
				rounds={rounds}
				players={(players && players !== null) ? players : []}
				territories={(territories && territories !== null) ? territories : []}
				territoryIdx={territoryIndex} />
			<div id="control">
				<Player
					key={playerKey}
					gameToken={gameToken}
					gameHost={gameHost}
					refresh={refresh}
					setPlayer={setPlayer} />
				<Game
					key={gameKey}
					playerToken={playerToken}
					refresh={refresh}
					setGame={setGame} />
				{registed &&
					<GameList
						key={listKey}
						refresh={refresh} />
				}
				{(joined && isHost && isSetup) &&
					<StartGame
						key={joinKey}
						refresh={refresh} />
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
						territories={(territories && territories !== null) ? territories : []} />
				}
			</div>
			<Cards
				refresh={refresh}
				playerToken={playerToken}
				cards={playerCards}
				territories={(territories && territories !== null) ? territories : []}
				territoryIdx={territoryIndex} />
			{registed &&
				<Subscriber receiver={eventReceived} />
			}
			{joined &&
				<GameSubscriber game={gameToken} receiver={eventReceived} />
			}
		</>
	);
}
