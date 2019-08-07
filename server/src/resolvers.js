const evn = require('./events');
const { UserInputError } = require('apollo-server');
const { MIN_PLAYER_PER_GAME, MAX_PLAYER_PER_GAME, initialTroops, basicReinforcement, continentReinforcement, shuffleCards } = require('./rules');

module.exports = {
	Query: {
		me: (_, __, { dataSources }) => dataSources.eventDS.me(),
		myGame: (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p && (typeof(p.joined) !== "undefined") && (p.joined !== null))
				return dataSources.eventDS.findGameByToken({ token: p.joined });
			return null;
		},
		myTerritories: (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) return dataSources.eventDS.listTerritoriesByPlayer({ token: p.token });
			return [];
		},
		myFellowPlayers: (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p && (typeof(p.joined) !== "undefined") && (p.joined !== null))
				return dataSources.eventDS.listPlayersByGame({ token: p.joined });
			return [];
		},
		listPlayers: (_, __, { dataSources }) => dataSources.eventDS.listPlayers(),
		listGames: (_, __, { dataSources }) => dataSources.eventDS.listGames()
	},
	Mutation: {
		registerPlayer: async (_, { name }, { dataSources }) => {
			const p = dataSources.eventDS.findPlayerByName({ name });
			if (p) throw new UserInputError(`[REGISTER] Player '${name}' already exists`);

			const q = await dataSources.eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: name }});
			if (!q.successful) throw new UserInputError(q.message);

			await dataSources.eventDS.updateSnapshot();
			return q;
		},
		quitPlayer: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[QUIT] You are not a registered player yet");

			const q = await dataSources.eventDS.add({ event: evn.PLAYER_QUITTED, payload: { tokens: [p.token] }});
			if (!q.successful) throw new UserInputError(q.message);

			await dataSources.eventDS.updateSnapshot();
			return q;
		},
		openGame: async (_, { name }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[OPEN] You are not a registered player yet");
			if (p.joined) {
				const j = dataSources.eventDS.findGameByToken({ token: p.joined });
				if (j) throw new UserInputError(`[OPEN] You are already in the game '${j.name}'`);
			}

			const g = dataSources.eventDS.findGameByName({ name });
			if (g) throw new UserInputError(`[OPEN] Game '${name}' already exists`);

			const h = await dataSources.eventDS.add({ event: evn.GAME_OPENED, payload: { name: name, tokens: [ p.token ] }});
			if (!h.successful) throw new UserInputError(h.message);

			const q = await dataSources.eventDS.add({ event: evn.GAME_JOINED, payload: { tokens: [p.token, h.event.token] }});
			if (!q.successful) throw new UserInputError(q.message);

			await dataSources.eventDS.updateSnapshot();
			return h;
		},
		closeGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[CLOSE] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[CLOSE] You are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[CLOSE] Game '${p.joined}' not found`);
			if (g.host !== p.token) throw new UserInputError("[CLOSE] Can only close your own game");

			const k = await dataSources.eventDS.add({ event: evn.GAME_CLOSED, payload: { tokens: [p.token, g.token] }});
			if (!k.successful) throw new UserInputError(k.message);

			const q = await dataSources.eventDS.add({ event: evn.GAME_LEFT, payload: { tokens: [p.token, g.token] }});
			if (!q.successful) throw new UserInputError(q.message);

			await dataSources.eventDS.updateSnapshot();
			return k;
		},
		joinGame: async (_, { token }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[JOIN] You are not a registered player yet");
			if (p.joined) {
				const j = dataSources.eventDS.findGameByToken({ token: p.joined });
				if (j) throw new UserInputError(`[JOIN] You are already in the game '${j.name}'`);
			}

			const g = dataSources.eventDS.findGameByToken({ token: token });
			if (!g) throw new UserInputError(`[JOIN] Game '${token}' not found`);
			if (g.rounds >= 0) throw new UserInputError(`[JOIN] Game '${g.name}' already started`);

			const players = dataSources.eventDS.listPlayersByGame({ token: token });
			if (players.length >= MAX_PLAYER_PER_GAME)
				throw new UserInputError(`[JOIN] Game '${g.name}' is full already`);

			const k = await dataSources.eventDS.add({ event: evn.GAME_JOINED, payload: { tokens: [p.token, token] }});
			if (!k.successful) throw new UserInputError(k.message);

			await dataSources.eventDS.updateSnapshot();
			return k;
		},
		leaveGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[LEAVE] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[LEAVE] Your are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[LEAVE] Game '${p.joined}' not found`);
			if (g.host === p.token) throw new UserInputError("[LEAVE] Cannot leave your own game");

			const k = await dataSources.eventDS.add({ event: evn.GAME_LEFT, payload: { tokens: [p.token, g.token] }});
			if (!k.successful) throw new UserInputError(k.message);

			await dataSources.eventDS.updateSnapshot();
			return k;
		},
		startGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[START] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[START] You are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[START] Game '${p.joined}' not found`);
			if (g.host !== p.token) throw new UserInputError("[START] Can only start your own game");

			const players = dataSources.eventDS.listPlayersByGame({ token: p.joined });
			if (players.length < MIN_PLAYER_PER_GAME)
				throw new UserInputError(`[START] Minimum number of players is ${MIN_PLAYER_PER_GAME}`);

			const k = await dataSources.eventDS.add({ event: evn.GAME_STARTED, payload: { tokens: [p.token, g.token] }});
			if (!k.successful) throw new UserInputError(k);

			const deck = shuffleCards(players.map(q => q.token));
			const hold = {};
			for (const c of Object.keys(deck)) {
				if (!hold[deck[c]]) {
					hold[deck[c]] = 1;
				} else {
					hold[deck[c]] = hold[deck[c]] + 1;
				}

				const m = await dataSources.eventDS.add({
					event: evn.TERRITORY_ASSIGNED,
					payload: { name: c, tokens: [deck[c], g.token] }
				});
				if (!m.successful) throw new UserInputError(m.message);
			}

			const troops = initialTroops(players.length);
			for (const player of players) {
				const n = await dataSources.eventDS.add({
					event: evn.TROOP_ASSIGNED,
					payload: { amount: (troops - hold[player.token]), tokens: [player.token, g.token] }
				});
				if (!n.successful) throw new UserInputError(n.message);
			}

			const cards = shuffleCards(); // Need to do it here because need to record each card in a event, otherwise cannot replay
			for (const card of cards) {
				const d = await dataSources.eventDS.add({
					event: evn.CARD_RETURNED,
					payload: { name: card.name, tokens: [p.token, g.token] }
				});
				if (!d.successful) throw new UserInputError(d.message);
			}

			await dataSources.eventDS.updateSnapshot();
			return k;
		},
		takeAction: async (_, { name }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[ACTION] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[ACTION] Your are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[ACTION] Game '${p.joined}' not found`);
			if (g.rounds < 0) throw new UserInputError("[ACTION] The game is not started yet");
			if (g.turn !== p.token) throw new UserInputError("[ACTION] Now is not your turn yet");

			const owned = (g.territories[g.t_index[name]].owner === p.token);
			if (owned) {
				const c = await dataSources.eventDS.add({
					event: evn.TERRITORY_SELECTED,
					payload: { name: name, tokens: [p.token, g.token] }
				});
				if (!c.successful) throw new UserInputError(c.message);
			}

			if (g.rounds === 0) { // Setup phase
				if (owned && (p.reinforcement > 0)) {
					const a = await dataSources.eventDS.add({
						event: evn.TROOP_ADDED,
						payload: { name: name, amount: 1, tokens: [p.token, g.token] }
					});
					if (!a.successful) throw new UserInputError(a.message);

					const d = await dataSources.eventDS.add({
						event: evn.TROOP_DEPLOYED,
						payload: { amount: 1, tokens: [p.token, g.token] }
					});
					if (!d.successful) throw new UserInputError(d.message);
					await dataSources.eventDS.updateSnapshot();

					const plys = dataSources.eventDS.listPlayersByGame({ token: g.token }).filter(p => p.reinforcement > 0);
					if (plys.length > 0) {
						const n = await dataSources.eventDS.add({
							event: evn.TURN_TAKEN,
							payload: { tokens: [p.token, g.token] }
						});
						if (!n.successful) throw new UserInputError(n.message);
					} else {
						const s = await dataSources.eventDS.add({
							event: evn.SETUP_FINISHED,
							payload: { tokens: [p.token, g.token] }
						});
						if (!s.successful) throw new UserInputError(s.message);
					}

					await dataSources.eventDS.updateSnapshot();
					return a;
				}
			} else { // rounds > 0, playing phase
				if (p.reinforcement > 0) {
					// Reinforcement stage
					if (owned) {
						const a = await dataSources.eventDS.add({
							event: evn.TROOP_ADDED,
							payload: { name: name, amount: 1, tokens: [p.token, g.token] }
						});
						if (!a.successful) throw new UserInputError(a.message);
	
						const d = await dataSources.eventDS.add({
							event: evn.TROOP_DEPLOYED,
							payload: { amount: 1, tokens: [p.token, g.token] }
						});
						if (!d.successful) throw new UserInputError(d.message);
						await dataSources.eventDS.updateSnapshot();
					}
				} else {
					// Combat stage (moved to this stage automatically)
					if (!owned) {
						if (g.territories[g.t_index[name]].connected.filter(conn => conn.name === g.current.name).length > 0) {
							//Connected, can attack
							const k = await dataSources.eventDS.add({
								event: evn.TERRITORY_ATTACKED,
								payload: { tokens: [p.token, g.token, g.current.name, name] }
							});
							if (!k.successful) throw new UserInputError(k.message);
							await dataSources.eventDS.updateSnapshot();
						}
					}
				}
			}
		},
		startTurn: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[TURN] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[TURN] You are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[TURN] Game '${p.joined}' not found`);
			if (g.rounds <= 0) throw new UserInputError("[TURN] The game is not ready yet");
			if (g.turn !== p.token) throw new UserInputError("[TURN] Now is not your turn yet");

			const holdings = dataSources.eventDS.listTerritoriesByPlayer({ token: p.token });
			const reinforcement =
				basicReinforcement(holdings) +
				continentReinforcement(holdings); //TODO - Plus troops from trading in cards
			const s = await dataSources.eventDS.add({
				event: evn.TROOP_ASSIGNED,
				payload: { amount: reinforcement, tokens: [p.token, g.token] }
			});
			if (!s.successful) throw new UserInputError(s.message);

			await dataSources.eventDS.updateSnapshot();
			return s;
		}
	},
	Player: {
		joined: (player, _, { dataSources }) => {
			if ((typeof(player.joined) !== "undefined") && (player.joined !== null)) {
				return dataSources.eventDS.findGameByToken({ token: player.joined });
			}
			return null;
		}
	},
	Game: {
		host: (game, _, { dataSources }) => {
			return dataSources.eventDS.findPlayerByToken({ token: game.host });
		},
		turn: (game, _, { dataSources }) => {
			if ((typeof(game.turn) !== "undefined") && (game.turn !== null)) {
				return dataSources.eventDS.findPlayerByToken({ token: game.turn });
			}
			return null;
		},
		current: (game, _, __) => {
			if ((typeof(game.current) !== "undefined") && (game.current !== null)) {
				return game.territories[game.t_index[game.current]];
			}
			return null;
		}
	},
	Territory: {
		owner: (territory, _, { dataSources }) => {
			if ((typeof(territory.owner) !== "undefined") && (territory.owner !== null)) {
				return dataSources.eventDS.findPlayerByToken({ token: territory.owner });
			}
			return null;
		}
	},
	Card: {
		type: (card, _, __) => {
			switch (card.type) {
				case "A":
					return "Artillery";
				case "C":
					return "Cavalry";
				case "I":
					return "Infantry";
				default:
					return "Wildcard";
			}
		}
	}
};