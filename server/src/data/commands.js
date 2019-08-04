const { DataSource } = require('apollo-datasource');
const evn = require('../events');
const { minPlayersPerGame, maxPlayersPerGame, shuffleCards, initialTroops } = require('../rules');

class Commands extends DataSource {
	constructor({ queries }) {
		super();
		this.queries = queries;
		this.store = queries.store;
	}

	initialize(config) {
		this.context = config.context;
	}

	async registerPlayer({ name }) {
		const p = this.queries.findPlayerByName({ name });
		if (p) {
			return new Promise((_, reject) => reject({ successful: false, message: `[REGISTER] Player '${name}' already exists` }));
		} else {
			const q = await this.store.add({ event: evn.PLAYER_REGISTERED, payload: { name: name }});
			if (q) {
				await this.queries.rebuildSnapshot();
				return q;
			}
		}
	}

	async quitPlayer({ token }) {
		const p = this.queries.findPlayerByToken({ token });
		if (p) {
			const q = await this.store.add({ event: evn.PLAYER_QUITTED, payload: { tokens: [token] }});
			if (q) {
				await this.queries.rebuildSnapshot();
				return q;
			}
		} else
			return new Promise((_, reject) => reject({ successful: false, message: `[QUIT] Player '${token}' not found` }));
	}

	async openGame({ token, name }) {
		const p = this.queries.findPlayerByToken({ token });
		if (p) {
			if (p.joined) {
				const j = this.queries.findGameByToken({ token: p.joined });
				if (j)
					return new Promise((_, reject) => reject({ successful: false, message: `[OPEN] Player '${p.name}' already in game '${j.name}'` }));
			}
		} else
			return new Promise((_, reject) => reject({ successful: false, message: `[OPEN] Player '${token}' not found` }));

		const g = this.queries.findGameByName({ name });
		if (g) return new Promise((_, reject) => reject({ successful: false, message: `[OPEN] Game '${name}' already exists` }));

		const h = await this.store.add({ event: evn.GAME_OPENED, payload: { name: name, tokens: [ token ] }});
		if (h) {
			if (h.successful) {
				await this.store.add({ event: evn.GAME_JOINED, payload: { tokens: [token, h.event.token] }});
				await this.queries.rebuildSnapshot();
			}
			return h;
		}
	}

	async closeGame({ token }) {
		const p = this.queries.findPlayerByToken({ token });
		if (p) {
			if (p.joined) {
				const g = this.queries.findGameByToken({ token: p.joined });
				if (g) {
					if (g.host === token) {
						const k = await this.store.add({ event: evn.GAME_CLOSED, payload: { tokens: [token, g.token] }});
						if (k) {
							if (k.successful) {
								await this.store.add({ event: evn.GAME_LEFT, payload: { tokens: [token, g.token] }});
								await this.queries.rebuildSnapshot();
							}
							return k;
						}
					} else
						return new Promise((_, reject) => reject({ successful: false, message: `[CLOSE] Can only close player ${p.name}'s own game` }));
				} else
					return new Promise((_, reject) => reject({ successful: false, message: `[CLOSE] Game '${p.joined}' not found` }));
			} else
				return new Promise((_, reject) => reject({ successful: false, message: `[CLOSE] Player '${p.name}' is not in any game` }));
		} else
			return new Promise((_, reject) => reject({ successful: false, message: `[CLOSE] Player '${token}' not found` }));
	}

	async joinGame({ player, game }) {
		const p = this.queries.findPlayerByToken({ token: player });
		if (p) {
			if (p.joined) {
				const j = this.queries.findGameByToken({ token: p.joined });
				if (j)
					return new Promise((_, reject) => reject({ successful: false, message: `[JOIN] Player '${p.name}' already in game '${j.name}'` }));
			} else {
				const g = this.queries.findGameByToken({ token: game });
				if (g) {
					if (g.rounds >= 0)
						return new Promise((_, reject) => reject({ successful: false, message: `[JOIN] Game '${g.name}' already started` }));

					const players = this.queries.listPlayersByGame({ token: game });
					if (players.length >= maxPlayersPerGame())
						return new Promise((_, reject) => reject({ successful: false, message: `[JOIN] Game '${g.name}' is full already` }));

					const k = await this.store.add({ event: evn.GAME_JOINED, payload: { tokens: [player, game] }});
					if (k) {
						await this.queries.rebuildSnapshot();
						return k;
					}
				} else
					return new Promise((_, reject) => reject({ successful: false, message: `[JOIN] Game '${game}' not found` }));
			}
		} else
			return new Promise((_, reject) => reject({ successful: false, message: `[JOIN] Player '${player}' not found` }));
	}

	async leaveGame({ token }) {
		const p = this.queries.findPlayerByToken({ token });
		if (p) {
			if (p.joined) {
				const g = this.queries.findGameByToken({ token: p.joined });
				if (g) {
					if (g.host !== token) {
						const k = await this.store.add({ event: evn.GAME_LEFT, payload: { tokens: [token, g.token] }});
						if (k) {
							await this.queries.rebuildSnapshot();
							return k;
						}
					} else
						return new Promise((_, reject) => reject({ successful: false, message: `[LEAVE] Cannot leave player ${p.name}'s own game` }));
				} else
					return new Promise((_, reject) => reject({ successful: false, message: `[LEAVE] Game '${p.joined}' not found` }));
			} else
				return new Promise((_, reject) => reject({ successful: false, message: `[LEAVE] Player '${p.name}' is not in any game` }));
		} else
			return new Promise((_, reject) => reject({ successful: false, message: `[LEAVE] Player '${token}' not found` }));
	}

	async startGame({ token }) {
		const p = this.queries.findPlayerByToken({ token });
		if (p) {
			if (p.joined) {
				const g = this.queries.findGameByToken({ token: p.joined });
				if (g) {
					if (g.host === token) {
						const players = this.queries.listPlayersByGame({ token: p.joined });
						if (players.length >= minPlayersPerGame()) {
							const k = await this.store.add({ event: evn.GAME_STARTED, payload: { tokens: [token, g.token] }});
							if (k) {
								if (k.successful) {
									const deck = shuffleCards(players.map(p => p.token));
									const hold = {};
									for (const c of Object.keys(deck)) {
										if (!hold[deck[c]]) {
											hold[deck[c]] = 1;
										} else {
											hold[deck[c]] = hold[deck[c]] + 1;
										}

										await this.store.add({
											event: evn.TERRITORY_ASSIGNED,
											payload: { name: c, tokens: [deck[c], g.token] }
										});
									}

									const troops = initialTroops(players.length);
									for (const player of players) {
										await this.store.add({
											event: evn.TROOP_ASSIGNED,
											payload: { amount: (troops - hold[player.token]), tokens: [player.token, g.token] }
										});
									}

									await this.queries.rebuildSnapshot();
								}
								return k;
							}
						} else
							return new Promise((_, reject) => reject({ successful: false, message: `[START] Minimum number of players is ${minPlayersPerGame()}` }));
					} else
						return new Promise((_, reject) => reject({ successful: false, message: `[START] Can only start player ${p.name}'s own game` }));
				} else
					return new Promise((_, reject) => reject({ successful: false, message: `[START] Game '${p.joined}' not found` }));
			} else
				return new Promise((_, reject) => reject({ successful: false, message: `[START] Player '${p.name}' is not in any game` }));
		} else
			return new Promise((_, reject) => reject({ successful: false, message: `[START] Player '${token}' not found` }));
	}

	// Click on an owned territory during one's turn
	async deployTroops({ token, territory }) {
		const p = this.queries.findPlayerByToken({ token });
		if (p) {
			if (p.joined) {
				const g = this.queries.findGameByToken({ token: p.joined });
				if (g) {
					if (g.turn === token) {
						if (p.reinforcement > 0) {
							if (g.territories[g.t_index[territory]].owner === token) {
								const k = await this.store.add({
									event: evn.TROOP_ADDED,
									payload: { name: territory, amount: 1, tokens: [token, g.token] }
								});
								if (k) {
									if (k.successful) {
										const m = await this.store.add({
											event: evn.TROOP_DEPLOYED,
											payload: { amount: 1, tokens: [token, g.token] }
										});
										// TODO!!! Move this to a proper place to control game flow
										if (m && (g.rounds === 0)) {
											await this.store.add({
												event: evn.TURN_TAKEN,
												payload: { tokens: [token, g.token] }
											});
										}
										await this.queries.rebuildSnapshot();
										return k;
									}
								}
							} else
								return new Promise((_, reject) => reject({ successful: false, message: `[DEPLOY] Territory '${g.territories[g.t_index[territory]].name}' is not owned by player ${p.name}` }));
						} else
							return new Promise((_, reject) => reject({ successful: false, message: `[DEPLOY] No more reinforcement for player ${p.name}` }));
					} else
						return new Promise((_, reject) => reject({ successful: false, message: `[DEPLOY] Now is not player ${p.name}'s turn` }));
				} else
					return new Promise((_, reject) => reject({ successful: false, message: `[DEPLOY] Game '${p.joined}' not found` }));
			} else
				return new Promise((_, reject) => reject({ successful: false, message: `[DEPLOY] Player '${p.name}' is not in any game` }));
		} else
			return new Promise((_, reject) => reject({ successful: false, message: `[DEPLOY] Player '${token}' not found` }));
	}
}

module.exports = Commands;