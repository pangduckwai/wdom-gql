const { UserInputError } = require('apollo-server-express');
const { PubSub, withFilter } = require('graphql-subscriptions');
const consts = require('./consts');

const pubsub = new PubSub();

module.exports = {
	Query: {
		events: async (_, __, { dataSources }) => {
			const { ___, eventList } = await dataSources.eventDS.events();
			return eventList;
		},
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
		listGames: (_, __, { dataSources }) => dataSources.eventDS.listGames(),
		listTerritories: (_, { token }, { dataSources }) => dataSources.eventDS.listTerritoriesByPlayer({ token })
	},
	Mutation: {
		registerPlayer: async (_, { name }, { dataSources }) => {
			const p = dataSources.eventDS.findPlayerByName({ name });
			if (p) throw new UserInputError(`[REGISTER] Player '${name}' already exists`);

			const q = await dataSources.eventDS.add({ event: consts.PLAYER_REGISTERED, payload: [{ name: "playerName", value: name }]});
			if (!q.successful) throw new UserInputError(q.message);

			await dataSources.eventDS.updateSnapshot();
			return q;
		},
		quitPlayer: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[QUIT] You are not a registered player yet");

			const q = await dataSources.eventDS.add({ event: consts.PLAYER_QUITTED, payload: [{ name: "playerToken", value: p.token }]});
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

			const h = await dataSources.eventDS.add({ event: consts.GAME_OPENED, payload: [
				{ name: "playerToken", value: p.token }, { name: "gameName", value: name }
			]});
			if (!h.successful) throw new UserInputError(h.message);

			const q = await dataSources.eventDS.add({ event: consts.GAME_JOINED, payload: [
				{ name: "playerToken", value: p.token }, { name: "gameToken", value: h.event.token }
			]});
			if (!q.successful) throw new UserInputError(q.message);

			await dataSources.eventDS.updateSnapshot();
			pubsub.publish(consts.BROADCAST_EVENT.topic, { broadcastEvent: h.event });
			return h;
		},
		closeGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[CLOSE] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[CLOSE] You are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[CLOSE] Game '${p.joined}' not found`);
			if (g.host !== p.token) throw new UserInputError("[CLOSE] Can only close your own game");

			const k = await dataSources.eventDS.add({ event: consts.GAME_CLOSED, payload: [
				{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }
			]});
			if (!k.successful) throw new UserInputError(k.message);

			const q = await dataSources.eventDS.add({ event: consts.GAME_LEFT, payload: [
				{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }
			]});
			if (!q.successful) throw new UserInputError(q.message);

			await dataSources.eventDS.updateSnapshot();
			pubsub.publish(consts.BROADCAST_EVENT.topic, { broadcastEvent: k.event });
			pubsub.publish(consts.BROADCAST_GAME_EVENT.topic, { broadcastGameEvent: k.event, token: g.token });
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
			if (players.length >= dataSources.eventDS.gameRules.MAX_PLAYER_PER_GAME)
				throw new UserInputError(`[JOIN] Game '${g.name}' is full already`);

			const k = await dataSources.eventDS.add({ event: consts.GAME_JOINED, payload: [
				{ name: "playerToken", value: p.token }, { name: "gameToken", value: token }
			]});
			if (!k.successful) throw new UserInputError(k.message);

			await dataSources.eventDS.updateSnapshot();
			pubsub.publish(consts.BROADCAST_GAME_EVENT.topic, { broadcastGameEvent: k.event, token: token });
			return k;
		},
		leaveGame: async (_, __, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[LEAVE] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[LEAVE] Your are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[LEAVE] Game '${p.joined}' not found`);
			if (g.host === p.token) throw new UserInputError("[LEAVE] Cannot leave your own game");

			const k = await dataSources.eventDS.add({ event: consts.GAME_LEFT, payload: [
				{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }
			]});
			if (!k.successful) throw new UserInputError(k.message);

			await dataSources.eventDS.updateSnapshot();
			pubsub.publish(consts.BROADCAST_GAME_EVENT.topic, { broadcastGameEvent: k.event, token: g.token });
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
			if (players.length < dataSources.eventDS.gameRules.MIN_PLAYER_PER_GAME)
				throw new UserInputError(`[START] Minimum number of players is ${dataSources.eventDS.gameRules.MIN_PLAYER_PER_GAME}`);

			const k = await dataSources.eventDS.add({ event: consts.GAME_STARTED, payload: [
				{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }
			]});
			if (!k.successful) throw new UserInputError(k);

			// Since shuffleCards is random, need to call it here so the event stream records exactly what happened
			const deck = dataSources.eventDS.gameRules.shuffleCards(players.map(q => q.token));
			const hold = {};
			for (const c of Object.keys(deck)) {
				if (!hold[deck[c]]) {
					hold[deck[c]] = 1;
				} else {
					hold[deck[c]] = hold[deck[c]] + 1;
				}

				const m = await dataSources.eventDS.add({
					event: consts.TERRITORY_ASSIGNED, payload: [
						{ name: "playerToken", value: deck[c] }, { name: "gameToken", value: g.token }, { name: "territoryName", value: c }
					]});
				if (!m.successful) throw new UserInputError(m.message);
			}

			const cards = dataSources.eventDS.gameRules.shuffleCards(); // Need to do it here because need to record each card in a event, otherwise cannot replay
			for (const card of cards) {
				const d = await dataSources.eventDS.add({
					event: consts.CARD_RETURNED, payload: [
						{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }, { name: "territoryName", value: card.name }
					]});
				if (!d.successful) throw new UserInputError(d.message);
			}

			await dataSources.eventDS.updateSnapshot();
			pubsub.publish(consts.BROADCAST_GAME_EVENT.topic, { broadcastGameEvent: k.event, token: g.token });
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
			let c;
			if (owned) {
				c = await dataSources.eventDS.add({
					event: consts.TERRITORY_SELECTED, payload: [
					{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }, { name: "territoryName", value: name }
				]});
				if (!c.successful) throw new UserInputError(c.message);
			}

			if (g.rounds === 0) { // Setup phase
				let setupFinished = false;
				if (owned && (p.reinforcement > 0)) {
					if (p.reinforcement === 1) {
						// If this player's reinforcement > 1, then there is no way setup will finish by this action
						// Check this to avoid calling snapshot in the middle of this action
						const plys = dataSources.eventDS.listPlayersByGame({ token: g.token })
							.filter(ply => (ply.token !== p.token) && (ply.reinforcement > 0));
						if (plys.length <= 0) setupFinished = true;
					}

					const a = await dataSources.eventDS.add({
						event: consts.TROOP_PLACED, payload: [
							{ name: "playerToken", value: p.token },
							{ name: "gameToken", value: g.token },
							{ name: "territoryName", value: name }
						]});
					if (!a.successful) throw new UserInputError(a.message);

					const d = await dataSources.eventDS.add({
						event: consts.TROOP_DEPLOYED, payload: [
							{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }, { name: "amount", value: "1" }
						]});
					if (!d.successful) throw new UserInputError(d.message);

					if (!setupFinished) {
						const n = await dataSources.eventDS.add({
							event: consts.NEXT_PLAYER,
							payload: [{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }]
						});
						if (!n.successful) throw new UserInputError(n.message);
					} else {
						const s = await dataSources.eventDS.add({
							event: consts.SETUP_FINISHED,
							payload: [{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }]
						});
						if (!s.successful) throw new UserInputError(s.message);
					}

					await dataSources.eventDS.updateSnapshot();
					pubsub.publish(consts.BROADCAST_GAME_EVENT.topic, { broadcastGameEvent: a.event, token: g.token });
					return a;
				}
			} else {
				if (p.reinforcement > 0) {
					// Reinforcement stage
					if (owned && (p.cards.length < 5)) {
						const a = await dataSources.eventDS.add({
							event: consts.TROOP_ADDED, payload: [
								{ name: "playerToken", value: p.token },
								{ name: "gameToken", value: g.token },
								{ name: "territoryName", value: name }
							]});
						if (!a.successful) throw new UserInputError(a.message);

						const d = await dataSources.eventDS.add({
							event: consts.TROOP_DEPLOYED, payload: [
								{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }, { name: "amount", value: "1" }
							]});
						if (!d.successful) throw new UserInputError(d.message);

						await dataSources.eventDS.updateSnapshot();
						pubsub.publish(consts.BROADCAST_GAME_EVENT.topic, { broadcastGameEvent: a.event, token: g.token });
						return a;
					}
				} else {
					// Combat stage (moved to this stage automatically)
					if (!owned && (p.cards.length < 5)) { // If click on owned territory at this stage, only means changing the attack-from territory to the newly clicked one
						if (g.territories[g.t_index[name]].connected.filter(conn => conn.name === g.current).length > 0) {
							//Connected, can attack
							const fm = g.territories[g.t_index[g.current]];
							const to = g.territories[g.t_index[name]];
							if ((fm.troops >= 2) && (to.troops >= 1)) {
								const casualties = dataSources.eventDS.gameRules.doBattle({ attacker: fm.troops, defender: to.troops });

								const k = await dataSources.eventDS.add({
									event: consts.TERRITORY_ATTACKED, payload: [
										{ name: "playerToken", value: p.token },
										{ name: "gameToken", value: g.token },
										{ name: "fromTerritory", value: g.current },
										{ name: "toTerritory", value: name },
										{ name: "attackerLoss", value: ''+casualties.attacker },
										{ name: "defenderLoss", value: ''+casualties.defender }
									]});
								if (!k.successful) throw new UserInputError(k.message);

								if (casualties.defender >= to.troops) {
									const u = await dataSources.eventDS.add({
										event: consts.TERRITORY_CONQUERED, payload: [
											{ name: "playerToken", value: p.token },
											{ name: "gameToken", value: g.token },
											{ name: "fromTerritory", value: g.current },
											{ name: "toTerritory", value: name }
										]});
									if (!u.successful) throw new UserInputError(u.message);

									//Only trigger this when a territory changed hand
									const q = dataSources.eventDS.findPlayerByToken({ token: to.owner });
									if (!q) throw new UserInputError(`[ACTION] Player '${to.owner}' not found`);

									const t = await dataSources.eventDS.add({
										event: consts.PLAYER_ATTACKED, payload: [
											{ name: "playerToken", value: p.token },
											{ name: "gameToken", value: g.token },
											{ name: "defenderToken", value: q.token }
										]});
									if (!t.successful) throw new UserInputError(t.message);
								}
								await dataSources.eventDS.updateSnapshot();
								pubsub.publish(consts.BROADCAST_GAME_EVENT.topic, { broadcastGameEvent: k.event, token: g.token });
								return k;
							} //otherwise not enough troop to attack, ignore the action
						}
					} else {
						await dataSources.eventDS.updateSnapshot();
						return c;
					}
				}
			}
		},
		endTurn: async (_, { from, to, amount }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[TURN] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[TURN] You are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[TURN] Game '${p.joined}' not found`);
			if (g.rounds <= 0) throw new UserInputError("[TURN] The game is not ready yet");
			if (g.turn !== p.token) throw new UserInputError("[TURN] Now is not your turn yet");

			// Note: in the case of fortifying, when 'endTurn' is called it already pass user confirmation to fortify
			if (from && to && (amount > 0)) {
				if ((g.territories[g.t_index[from]].owner === p.token) &&
					(g.territories[g.t_index[to]].owner === p.token)) {
					let value = amount;
					if (amount >= g.territories[g.t_index[from]].troops) value = g.territories[g.t_index[from]].troops - 1;

					const f = await dataSources.eventDS.add({
						event: consts.FORTIFIED, payload: [
							{ name: "playerToken", value: p.token },
							{ name: "gameToken", value: g.token },
							{ name: "fromTerritory", value: from },
							{ name: "toTerritory", value: to },
							{ name: "amount", value: ''+value }
						]});
					if (!f.successful) throw new UserInputError(f.message);
				}
			}

			const e = await dataSources.eventDS.add({
				event: consts.TURN_ENDED,
				payload: [{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }]
			});
			if (!e.successful) throw new UserInputError(e.message);
			const n = await dataSources.eventDS.add({
				event: consts.NEXT_PLAYER,
				payload: [{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }]
			});
			if (!n.successful) throw new UserInputError(n.message);

			await dataSources.eventDS.updateSnapshot();
			return e;
		},
		redeemCards: async (_, { cards }, { dataSources }) => {
			const p = dataSources.eventDS.me();
			if (!p) throw new UserInputError("[REDEEM] You are not a registered player yet");
			if (!p.joined) throw new UserInputError("[REDEEM] You are not in any game");

			const g = dataSources.eventDS.findGameByToken({ token: p.joined });
			if (!g) throw new UserInputError(`[REDEEM] Game '${p.joined}' not found`);
			if (g.rounds <= 0) throw new UserInputError("[REDEEM] The game is not ready yet");
			if (g.turn !== p.token) throw new UserInputError("[REDEEM] Now is not your turn yet");

			if (cards.length !== 3) throw new UserInputError("[REDEEM] Need to redeem 3 cards");
			let redeeming = [];
			for (const card of cards) {
				const r = p.cards.filter(c => c.name === card);
				if (r.length <= 0) throw new UserInputError(`[REDEEM] You don't own the card '${card}'`);
				redeeming.push(r[0]);
			}
			if (!dataSources.eventDS.gameRules.isRedeemable(redeeming)) throw new UserInputError("[REDEEM] The set of cards is not redeemable");

			const d = await dataSources.eventDS.add({
				event: consts.CARDS_REDEEMED, payload: [
					{ name: "playerToken", value: p.token },
					{ name: "gameToken", value: g.token },
					{ name: "card1", value: cards[0] },
					{ name: "card2", value: cards[1] },
					{ name: "card3", value: cards[2] }
				]});
			if (!d.successful) throw new UserInputError(d.message);

			for (const card of cards) {
				const t = await dataSources.eventDS.add({
					event: consts.CARD_RETURNED, payload: [
						{ name: "playerToken", value: p.token }, { name: "gameToken", value: g.token }, { name: "territoryName", value: card }
					]});
				if (!t.successful) throw new UserInputError(t.message);
			}
			await dataSources.eventDS.updateSnapshot();
			return d;
		}
	},
	Subscription: {
		broadcastEvent: {
			subscribe: () => pubsub.asyncIterator(consts.BROADCAST_EVENT.topic)
		},
		broadcastGameEvent: {
			subscribe: withFilter(
				() => pubsub.asyncIterator(consts.BROADCAST_GAME_EVENT.topic),
				(payload, variables) => {
					return payload.token === variables.token;
				}
			)
		}
	},
	Player: {
		joined: (player, _, { dataSources }) => {
			if ((typeof(player.joined) !== "undefined") && (player.joined !== null)) {
				return dataSources.eventDS.findGameByToken({ token: player.joined });
			}
			return null;
		},
		redeemable: (player, _, { dataSources }) => {
			return dataSources.eventDS.gameRules.isRedeemable(player.cards);
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
		},
		winner: (game, _, { dataSources }) => {
			if ((typeof(game.winner) !== "undefined") && (game.winner !== null)) {
				return dataSources.eventDS.findPlayerByToken({ token: game.winner });
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