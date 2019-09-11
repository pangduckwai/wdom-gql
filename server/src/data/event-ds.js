const { DataSource } = require('apollo-datasource');
const consts = require('../consts');

class EventDS extends DataSource {
	constructor({ store, rules }) {
		super();
		this.store = store;
		this.gameRules = rules;
	}

	initialize(config) {
		this.context = config.context;
	}

	async events() {
		return this.store.list({ index: 0 });
	}
	me() {
		if (this.context && this.context.token)
			return this.findPlayerByToken({ token: this.context.token });
		else
			return null;
	}
	listPlayers() {
		return this.store.players;
	};
	findPlayerByToken({ token }) {
		return this.store.players[this.store.idxPlayerToken[token]];
	}
	findPlayerByName({ name }) {
		return this.store.players[this.store.idxPlayerName[name]];
	}
	listPlayersByGame({ token }) {
		return this.store.players.filter(p => (typeof(p.joined) !== "undefined") && (p.joined === token));
	}

	listGames() {
		return this.store.games;
	}
	listAvailableGames() {
		return this.store.games.filter(g => g.rounds < 0);
	}
	findGameByToken({ token }) {
		return this.store.games[this.store.idxGameToken[token]];
	}
	findGameByName({ name }) {
		return this.store.games[this.store.idxGameName[name]];
	}

	listTerritoriesByPlayer({ token }) {
		return this.store.games[this.store.idxGameToken[this.store.players[this.store.idxPlayerToken[token]].joined]].territories.filter(t => 
			(typeof(t.owner) !== "undefined") && (t.owner === token)
		);
	}

	process(v) {
		let obj, len, amt;

		let fltr1, fltr2, fltr3, fltr4, fltr5;
		switch (v.event) {
			//Player events
			case consts.PLAYER_REGISTERED:
				fltr1 = v.data.filter(d => (d.name === "playerName"));
				obj = {
					ready: true,
					token: v.token,
					name: fltr1[0].value,
					reinforcement: 0,
					cards: [],
				};
				len = this.store.players.push(obj);
				if (len > 0) this.store.rebuildPlayerIndex();
				break;
			case consts.PLAYER_QUITTED:
				obj = this.store.players[this.store.idxPlayerToken[v.token]];
				if (obj) {
					this.store.players.splice(this.store.idxPlayerToken[v.token], 1);
					this.store.rebuildPlayerIndex();
				}
				break;
			case consts.GAME_JOINED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				obj = this.store.players[this.store.idxPlayerToken[fltr1[0].value]];
				if (obj) {
					obj.joined = v.token;
					obj.reinforcement = 0;
					obj.cards = [];
				}
				break;
			case consts.GAME_LEFT:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				obj = this.store.players[this.store.idxPlayerToken[fltr1[0].value]];
				if (obj) {
					delete obj.joined;
				}
				break;
			case consts.TROOP_DEPLOYED:
				fltr1 = v.data.filter(d => (d.name === "amount"));
				obj = this.store.players[this.store.idxPlayerToken[v.token]];
				if (obj) {
					amt = parseInt(fltr1[0].value, 10);
					if ((amt >= 0) && (obj.reinforcement >= amt)) {
						obj.reinforcement = obj.reinforcement - amt;
					} else {
						obj.ready = false;
					}
				}
				break;

			// Game events
			case consts.GAME_OPENED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "gameName"));
				obj = {
					ready: true,
					token: v.token,
					name: fltr2[0].value,
					host: fltr1[0].value,
					rounds: -1,
					redeemed: 0,
					cards: [],
					territories: this.gameRules.buildTerritory(),
					t_index: {},
					init_player: this.gameRules.chooseFirstPlayer()
				};
				for (let i = 0; i < obj.territories.length; i ++) {
					obj.t_index[obj.territories[i].name] = i;
				}

				len = this.store.games.push(obj);
				if (len > 0) this.store.rebuildGameIndex();
				break;
			case consts.GAME_CLOSED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.host === fltr1[0].value)) { //Only the host can close a game
					this.store.games.splice(this.store.idxGameToken[v.token], 1);
					this.store.rebuildGameIndex();
				}
				break;
			case consts.GAME_STARTED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.host === fltr1[0].value)) { //Only the host can start a game
					//Assign initial troops to each player
					const players = this.listPlayersByGame({ token: v.token });
					const troops = this.gameRules.initialTroops(players.length);

					let first = { token: null, min: 7};
					for (const player of players) {
						player.reinforcement = troops;
						player.order = obj.init_player ++;
						if (obj.init_player > 6) obj.init_player = 1;

						if (player.order < first.min) {
							first.min = player.order;
							first.token = player.token;
						}
					}
					obj.turn = first.token;
					obj.rounds = 0;
				}
				break;
			case consts.TERRITORY_ASSIGNED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "territoryName"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj) {
					obj.territories[obj.t_index[fltr2[0].value]].owner = fltr1[0].value;
					obj.territories[obj.t_index[fltr2[0].value]].troops = 1;
					const ply = this.store.players[this.store.idxPlayerToken[fltr1[0].value]];
					if (ply) {
						ply.reinforcement -= 1;
					}
				}
				break;
			case consts.TROOP_PLACED:
			case consts.TROOP_ADDED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "territoryName"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.territories[obj.t_index[fltr2[0].value]].owner === fltr1[0].value)) {
					obj.territories[obj.t_index[fltr2[0].value]].troops += 1;
				}
				break;
			case consts.TERRITORY_SELECTED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "territoryName"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.territories[obj.t_index[fltr2[0].value]].owner === fltr1[0].value)) {
					obj.current = fltr2[0].value;
				}
				break;
			case consts.NEXT_PLAYER:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === fltr1[0].value)) {
					const plys = this.listPlayersByGame({ token: v.token });
					let idx = 0;
					for (const ply of plys) {
						if (ply.token === fltr1[0].value) break;
						idx ++;
					}
					let off = ((idx + 1) >= plys.length) ? 0 : idx + 1;

					if (obj.rounds === 0) {
						// Setup phase
						let finished = false;
						while (plys[off].reinforcement <= 0) {
							off ++;
							if (off >= plys.length) off = 0;
							if (off === idx) {
								finished = true;
								break; //No one has reinforcement left
							}
						}
						if (!finished) obj.turn = plys[off].token;
					} else if (obj.rounds > 0) {
						// Gameplay phase
						while (this.listTerritoriesByPlayer({ token: plys[off].token }).length <= 0) {
							off ++;
							if (off >= plys.length) off = 0;
						}
						if (off !== idx) {
							obj.turn = plys[off].token;
							obj.fortified = false;

							const ply = this.store.players[this.store.idxPlayerToken[obj.turn]];
							if (ply) {
								const holdings = this.listTerritoriesByPlayer({token: obj.turn});
								ply.reinforcement = this.gameRules.basicReinforcement(holdings) + this.gameRules.continentReinforcement(holdings);
								ply.conquer = false;
							}
						} else {
							obj.winner = fltr1[0].value;
						}
					}
				}
				break;
			case consts.SETUP_FINISHED:
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.rounds === 0)) {
					obj.turn = obj.host;
					const players = this.listPlayersByGame({ token: v.token });
					let first = { token: null, min: 7};
					for (const player of players) {
						if (player.order < first.min) {
							first.min = player.order;
							first.token = player.token;
						}
					}
					obj.turn = first.token;
					obj.rounds = 1;
					obj.fortified = false;

					const ply = this.store.players[this.store.idxPlayerToken[obj.turn]];
					if (ply) {
						const holdings = this.listTerritoriesByPlayer({token: obj.turn});
						ply.reinforcement = this.gameRules.basicReinforcement(holdings) + this.gameRules.continentReinforcement(holdings);
						ply.conquer = false;
					}
				}
				break;
			case consts.CARD_RETURNED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "territoryName"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && ((obj.rounds === 0) || (obj.turn === fltr1[0].value))) {
					const card = this.gameRules.getCard(fltr2[0].value);
					if (card && (obj.cards.filter(c => c.name === fltr2[0].value).length <= 0)) {
						obj.cards.push(card);
					}
				}
				break;
			case consts.CARDS_REDEEMED: //TODO test a player redeem 2 sets of cards in 1 round
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "card1") || (d.name === "card2") || (d.name === "card3"));
				const cards = fltr2.map(itm => itm.value);
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === fltr1[0].value)) {
					const reinforcement = this.gameRules.redeemReinforcement(obj.redeemed);
					const ply = this.store.players[this.store.idxPlayerToken[fltr1[0].value]];
					if (ply) {
						obj.redeemed = reinforcement;
						ply.reinforcement += reinforcement;
						ply.cards = ply.cards.filter(c => !cards.includes(c.name));

						const territories = this.listTerritoriesByPlayer({token: fltr1[0].value});
						for (let i = 0; i < fltr2.length; i ++) {
							const territory = territories.filter(t => t.name === fltr2[i].value);
							if (territory.length > 0) territory[0].troops += 2;
						}
					}
				}
				break;
			case consts.TERRITORY_ATTACKED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "fromTerritory"));
				fltr3 = v.data.filter(d => (d.name === "toTerritory"));
				fltr4 = v.data.filter(d => (d.name === "attackerLoss"));
				fltr5 = v.data.filter(d => (d.name === "defenderLoss"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === fltr1[0].value)) {
					const fm = obj.territories[obj.t_index[fltr2[0].value]];
					const to = obj.territories[obj.t_index[fltr3[0].value]];
					const ca = parseInt(fltr4[0].value, 10);
					const cd = parseInt(fltr5[0].value, 10);
					if (fm.troops > ca)
						fm.troops -= ca;
					else
						fm.troops = 1;
					if (to.troops >= cd)
						to.troops -= cd;
					else
						to.troops = 0;
				}
				break;
			case consts.TERRITORY_CONQUERED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "fromTerritory"));
				fltr3 = v.data.filter(d => (d.name === "toTerritory"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === fltr1[0].value)) {
					const fm = obj.territories[obj.t_index[fltr2[0].value]];
					const to = obj.territories[obj.t_index[fltr3[0].value]];
					to.owner = fltr1[0].value;
					to.troops = fm.troops - 1;
					fm.troops = 1;
					obj.current = fltr3[0].value;

					const ply = this.store.players[this.store.idxPlayerToken[fltr1[0].value]];
					if (ply) ply.conquer = true;
				}
				break;
			case consts.PLAYER_DEFEATED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "defenderToken"));
				obj = this.store.players[this.store.idxPlayerToken[v.token]];
				if (obj) {
					const ply = this.store.players[this.store.idxPlayerToken[fltr2[0].value]];
					const left = this.listTerritoriesByPlayer({ token: fltr2[0].value });
					if (left.length <= 0) {
						//Player defeated
						obj.cards.push(...ply.cards);
						ply.cards = [];
					}
				}
				break;
			case consts.FORTIFIED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				fltr2 = v.data.filter(d => (d.name === "fromTerritory"));
				fltr3 = v.data.filter(d => (d.name === "toTerritory"));
				fltr4 = v.data.filter(d => (d.name === "amount"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === fltr1[0].value)) {
					const fm = obj.territories[obj.t_index[fltr2[0].value]];
					const to = obj.territories[obj.t_index[fltr3[0].value]];
					const amt = parseInt(fltr4[0].value, 10);
					const value = (amt >= fm.troops) ? fm.troops - 1 : amt;
					to.troops += value;
					fm.troops -= value;
					obj.fortified = true;
					obj.current = fltr3[0].value;
				}
				break;
			case consts.TURN_ENDED:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				if (obj && (obj.turn === fltr1[0].value)) {
					obj.rounds ++;

					const ply = this.store.players[this.store.idxPlayerToken[fltr1[0].value]];
					if (ply && ply.conquer) {
						const card = obj.cards.splice(0, 1)[0];
						ply.cards.push(card);
					}
				}
				break;
			case consts.GAME_WON:
				fltr1 = v.data.filter(d => (d.name === "playerToken"));
				obj = this.store.games[this.store.idxGameToken[v.token]];
				obj.winner = fltr1[0].value;
				break;
		}
	}

	async updateSnapshot() {
		return new Promise(async (resolve, _) => {
			const { lastIndex, eventList } = await this.store.list({ index: this.store.snapshot + 1 });
			this.store.snapshot = lastIndex;

			if (lastIndex >= 0) {
				for (const event of eventList) {
					this.process(event);
				}
			}
			resolve(true);
		});
	}

	async add({ event, payload }) {
		return this.store.add({ event, payload });
	}
};

module.exports = EventDS;