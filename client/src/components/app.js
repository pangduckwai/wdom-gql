import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { MYSELF, MY_GAME } from '../queries';
import { EVENTS, MAX_CARD_PER_PLAYER } from '../consts';
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
import Redeemed from './card-redeemed';
import CardCloseup from './card-closeup';
import Message from './game-msgbox';
import './app.css';
import './cards.css';
import './game.css';
import './map.css';

export default function App() {
	const [viewPortSize, setViewPortSize] = useState(null);
	const [listKey, setListKey] = useState(Math.floor(Math.random() * 100000));
	const [joinKey, setJoinKey] = useState(Math.floor(Math.random() * 100000));
	const [message, setMessage] = useState(null);
	const [playerToken, setPlayerToken] = useState(null);
	const [playerName, setPlayerName] = useState(null);
	const [playerCards, setPlayerCards] = useState(null);
	const [playerOrder, setPlayerOrder] = useState(0);
	const [reinforcement, setReinforcement] = useState(0);
	const [gameToken, setGameToken] = useState(null);
	const [gameHost, setGameHost] = useState(null);
	const [gameName, setGameName] = useState(null);
	const [turnToken, setTurnToken] = useState(null);
	const [turnName, setTurnName] = useState(null);
	const [rounds, setRounds] = useState(-1);
	const [players, setPlayers] = useState(null);
	const [territories, setTerritories] = useState(null);
	const [redeemed, setRedeemed] = useState(null);
	const [selected, setSelected] = useState(null);
	const [cardHover, setCardHover] = useState(null);

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
			setGameName(game.name);
			if (game.turn) setTurnToken(game.turn.token);
			if (game.turn) setTurnName(game.turn.name);
			setRounds(game.rounds);
			if (players) setPlayers(players);
			if (game.territories) setTerritories(game.territories);
		} else {
			setGameToken(null);
			setGameHost(null);
			setGameName(null);
			setTurnToken(null);
			setTurnName(null);
			setRounds(-1);
			setPlayers(null);
			setTerritories(null);
		}
	};

	useEffect(() => {
		function onResized() {
			setViewPortSize({ width: window.innerWidth, height: window.innerHeight });
		}
		onResized();
		window.addEventListener('resize', onResized);
		return () => window.removeEventListener('resize', onResized);
	}, []);

	const { refetch: refetchMe } = useQuery(MYSELF, {
		fetchPolicy: "cache-and-network",
		onCompleted(data) {
			if (data.me) {
				setPlayer(data.me);
			} else {
				setPlayer(null);
			}
		}
	});
	const { refetch: refetchGame } = useQuery(MY_GAME, {
		fetchPolicy: "cache-and-network",
		onCompleted(data) {
			if (data.myGame) {
				setGame(data.myGame, data.myFellowPlayers);
			} else {
				setGame(null, null);
			}
		}
	});

	const registed = (playerToken && !gameToken);
	const joined = (playerToken && gameToken);
	const isHost = (gameHost === playerToken);
	const isSetup = (rounds < 0);

	const refresh = (flags) => {
		if (flags.player) refetchMe();
		if (flags.game) refetchGame();
		if (flags.list) setListKey(listKey + 1);
		if (flags.joined) setJoinKey(joinKey + 1);
	};

	const clearRedeemed = () => {
		setRedeemed(null);
	};

	const clearMessage = () => {
		setMessage(null);
	};

	const mapClicked = () => {
		if (playerCards.length >= MAX_CARD_PER_PLAYER) {
			clearRedeemed();
			setMessage("Please redeem cards before proceed.");
		}
	};

	const eventReceived = (e) => {
		switch (e.event) {
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
			refresh({
				player: true,
				game: true
			});
			break;
		case EVENTS.TURN_ENDED:
			refresh({
				player: true,
				game: true
			});
			clearRedeemed();
			break;
		case EVENTS.CARDS_REDEEMED:
			const f0 = e.data.filter(d => d.name === "playerToken");
			if (!players || (players === null) || (f0.length <= 0) || (f0[0].value === playerToken)) break;

			const rd = players.filter(p => p.token === f0[0].value);
			if (rd.length <= 0) break;

			const f1 = e.data.filter(d => d.name === "card1");
			const f2 = e.data.filter(d => d.name === "card2");
			const f3 = e.data.filter(d => d.name === "card3");
			if (f1.length > 0 && f2.length > 0 && f3.length > 0) {
				setRedeemed({
					player: rd[0].name,
					card1: f1[0].value,
					card2: f2[0].value,
					card3: f3[0].value
				});
			}
			break;
		case EVENTS.TERRITORY_CONQUERED:
			refresh({
				player: true,
				game: true
			});
			const f4 = e.data.filter(d => d.name === "playerToken");
			if ((f4.length <= 0) || (f4[0].value !== playerToken)) break;

			const f5 = e.data.filter(d => d.name === "toTerritory");
			if (f5.length > 0) {
				setSelected(f5[0].value);
				console.log("WIN!!!", f5[0].value);
			}
			break;
		case EVENTS.PLAYER_DEFEATED:
			const f6 = e.data.filter(d => d.name === "playerToken");
			if ((f6.length <= 0) || (f6[0].value === playerToken)) break; //Don't need to announce who just got defeated by you...

			const f7 = e.data.filter(d => d.name === "defenderToken");
			if (f7.length <= 0) break;

			clearRedeemed();
			if (f7[0].value === playerToken) {
				setMessage("You are defeated");
			} else {
				const loser = players.filter(p => p.token === f7[0].value);
				if (loser.length > 0) {
					setMessage(`${loser[0].name} defeated`);
				}
			}
			break;
		case EVENTS.GAME_WON:
			const f8 = e.data.filter(d => d.name === "playerToken");
			if ((f8.length <= 0) || (f8[0].value !== playerToken)) break;

			setMessage("You won the game!");
			break;
		default:
			console.log("Event", e.event, "received....");
			break;
		}
	};

	let territoryIndex = {};
	if (territories && territories !== null) {
		territories.forEach((t, i) => {
			territoryIndex[t.name] = i;
		});
	}

	return (
		<>
			<Map
				viewPortSize={viewPortSize}
				callback={setGame}
				playerToken={playerToken}
				playerName={playerName}
				playerOrder={playerOrder}
				gameToken={gameToken}
				turnToken={turnToken}
				rounds={rounds}
				players={(players && players !== null) ? players : []}
				territories={(territories && territories !== null) ? territories : []}
				territoryIdx={territoryIndex}
				selected={selected}
				setSelected={setSelected}
				setCardHover={setCardHover}
				clicked={mapClicked}
				 />
			<div id="control">
				<Player
					playerToken={playerToken}
					playerName={playerName}
					gameToken={gameToken}
					gameHost={gameHost}
					refetch={refetchMe} />
				<Game
					playerToken={playerToken}
					gameToken={gameToken}
					gameName={gameName}
					refetch={refetchGame} />
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
				territoryIdx={territoryIndex}
				onMouseOver={setCardHover} />
			<CardCloseup
				card={cardHover} />
			<Redeemed
				redeemed={redeemed}
				clear={clearRedeemed} />
			<Message
				message={message}
				clear={clearMessage} />
			{registed &&
				<Subscriber receiver={eventReceived} />
			}
			{joined &&
				<GameSubscriber game={gameToken} receiver={eventReceived} />
			}
		</>
	);
}
