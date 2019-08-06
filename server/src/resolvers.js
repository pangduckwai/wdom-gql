const evn = require('./events');
const { minPlayersPerGame, maxPlayersPerGame, shuffleCards, initialTroops } = require('./rules');
const { UserInputError } = require('apollo-server');

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
			if (p)
				return dataSources.eventDS.listTerritoriesByPlayer({ token: p.token });
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
			if (p) {
				throw new UserInputError(`[REGISTER] Player '${name}' already exists`);
			} else {
				const q = await dataSources.eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: name }});
				if (q.successful) {
					await dataSources.eventDS.updateSnapshot();
					return q;
				} else
					throw new UserInputError(q.message);
			}
		},
		quitPlayer: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) {
				const q = await dataSources.eventDS.add({ event: evn.PLAYER_QUITTED, payload: { tokens: [p.token] }});
				if (q.successful) {
					await dataSources.eventDS.updateSnapshot();
					return q;
				} else
					throw new UserInputError(q.message);
			} else
				throw new UserInputError("[QUIT] You are not a registered player yet");
		},
		openGame: async (_, { name }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) {
				if (p.joined) {
					const j = dataSources.eventDS.findGameByToken({ token: p.joined });
					if (j) throw new UserInputError(`[OPEN] You are already in the game '${j.name}'`);
				}
			} else
				throw new UserInputError("[OPEN] You are not a registered player yet");

			const g = dataSources.eventDS.findGameByName({ name });
			if (g) throw new UserInputError(`[OPEN] Game '${name}' already exists`);
	
			const h = await dataSources.eventDS.add({ event: evn.GAME_OPENED, payload: { name: name, tokens: [ p.token ] }});
			if (h.successful) {
				const q = await dataSources.eventDS.add({ event: evn.GAME_JOINED, payload: { tokens: [p.token, h.event.token] }});
				if (q.successful) {
					await dataSources.eventDS.updateSnapshot();
					return h;
				} else
					throw new UserInputError(q.message);
			} else
				throw new UserInputError(h.message);
		},
		closeGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) {
				if (p.joined) {
					const g = dataSources.eventDS.findGameByToken({ token: p.joined });
					if (g) {
						if (g.host === p.token) {
							const k = await dataSources.eventDS.add({ event: evn.GAME_CLOSED, payload: { tokens: [p.token, g.token] }});
							if (k.successful) {
								const q = await dataSources.eventDS.add({ event: evn.GAME_LEFT, payload: { tokens: [p.token, g.token] }});
								if (q.successful) {
									await dataSources.eventDS.updateSnapshot();
									return k;
								} else
									throw new UserInputError(q.message);
							} else
								throw new UserInputError(k.message);
						} else
							throw new UserInputError("[CLOSE] Can only close your own game");
					} else
						throw new UserInputError(`[CLOSE] Game '${p.joined}' not found`);
				} else
					throw new UserInputError("[CLOSE] You are not in any game");
			} else
				throw new UserInputError("[CLOSE] You are not a registered player yet");
		},
		joinGame: async (_, { token }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) {
				if (p.joined) {
					const j = dataSources.eventDS.findGameByToken({ token: p.joined });
					if (j)
						throw new UserInputError(`[JOIN] You are already in the game '${j.name}'`);
				} else {
					const g = dataSources.eventDS.findGameByToken({ token: token });
					if (g) {
						if (g.rounds >= 0) throw new UserInputError(`[JOIN] Game '${g.name}' already started`);

						const players = dataSources.eventDS.listPlayersByGame({ token: token });
						if (players.length >= maxPlayersPerGame())
							throw new UserInputError(`[JOIN] Game '${g.name}' is full already`);

						const k = await dataSources.eventDS.add({ event: evn.GAME_JOINED, payload: { tokens: [p.token, token] }});
						if (k.successful) {
							await dataSources.eventDS.updateSnapshot();
							return k;
						} else
							throw new UserInputError(k.message);
					} else
						throw new UserInputError(`[JOIN] Game '${token}' not found`);
				}
			} else
				throw new UserInputError("[JOIN] You are not a registered player yet");
		},
		leaveGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) {
				if (p.joined) {
					const g = dataSources.eventDS.findGameByToken({ token: p.joined });
					if (g) {
						if (g.host !== p.token) {
							const k = await dataSources.eventDS.add({ event: evn.GAME_LEFT, payload: { tokens: [p.token, g.token] }});
							if (k.successful) {
								await dataSources.eventDS.updateSnapshot();
								return k;
							} else
								throw new UserInputError(k.message);
						} else
							throw new UserInputError("[LEAVE] Cannot leave your own game");
					} else
						throw new UserInputError(`[LEAVE] Game '${p.joined}' not found`);
				} else
					throw new UserInputError("[LEAVE] Your are not in any game");
			} else
				throw new UserInputError("[LEAVE] You are not a registered player yet");
		},
		startGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) {
				if (p.joined) {
					const g = dataSources.eventDS.findGameByToken({ token: p.joined });
					if (g) {
						if (g.host === p.token) {
							const players = dataSources.eventDS.listPlayersByGame({ token: p.joined });
							if (players.length >= minPlayersPerGame()) {
								const k = await dataSources.eventDS.add({ event: evn.GAME_STARTED, payload: { tokens: [p.token, g.token] }});
								if (k) {
									if (k.successful) {
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
											if (!m || !m.successful)
												throw new UserInputError(m.message);
										}

										const troops = initialTroops(players.length);
										for (const player of players) {
											const n = await dataSources.eventDS.add({
												event: evn.TROOP_ASSIGNED,
												payload: { amount: (troops - hold[player.token]), tokens: [player.token, g.token] }
											});
											if (!n || !n.successful)
												throw new UserInputError(n.message);
										}

										await dataSources.eventDS.updateSnapshot();
									}
									return k;
								}
							} else
								throw new UserInputError(`[START] Minimum number of players is ${minPlayersPerGame()}`);
						} else
							throw new UserInputError("[START] Can only start your own game");
					} else
						throw new UserInputError(`[START] Game '${p.joined}' not found`);
				} else
					throw new UserInputError("[START] You are not in any game");
			} else
				throw new UserInputError("[START] You are not a registered player yet");
		},
		deployTroops: async (_, { name }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (p) {
				if (p.joined) {
					const g = dataSources.eventDS.findGameByToken({ token: p.joined });
					if (g) {
						if (g.turn === p.token) {
							if (p.reinforcement > 0) {
								if (g.territories[g.t_index[name]].owner === p.token) {
									const k = await dataSources.eventDS.add({
										event: evn.TROOP_ADDED,
										payload: { name: name, amount: 1, tokens: [p.token, g.token] }
									});
									if (k.successful) {
										const m = await dataSources.eventDS.add({
											event: evn.TROOP_DEPLOYED,
											payload: { amount: 1, tokens: [p.token, g.token] }
										});

										if (m.successful) {
											// TODO!!! Move this to a proper place to control game flow
											if (g.rounds === 0) {
												const n = await dataSources.eventDS.add({
													event: evn.TURN_TAKEN,
													payload: { tokens: [p.token, g.token] }
												});
												if (!n || !n.successful)
													throw new UserInputError(n.message);
											}
										} else
											throw new UserInputError(m.message);

										await dataSources.eventDS.updateSnapshot();
										return k;
									} else
										throw new UserInputError(k.message);
								} else
									throw new UserInputError(`[DEPLOY] Territory '${g.territories[g.t_index[name]].name}' is not owned by you`);
							} else
								throw new UserInputError("[DEPLOY] Your have no more reinforcement to deploy");
						} else
							throw new UserInputError("[DEPLOY] Now is not your turn");
					} else
						throw new UserInputError(`[DEPLOY] Game '${p.joined}' not found`);
				} else
					throw new UserInputError("[DEPLOY] Your are not in any game");
			} else
				throw new UserInputError("[DEPLOY] You are not a registered player yet");
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
		}
	},
	Territory: {
		owner: (territory, _, { dataSources }) => {
			if ((typeof(territory.owner) !== "undefined") && (territory.owner !== null)) {
				return dataSources.eventDS.findPlayerByToken({ token: territory.owner });
			}
			return null;
		}
	}
};