const { UserInputError } = require('apollo-server-express');
const crypto = require('crypto');
const consts = require('../consts');

let copy = (orig) => {
	let copy = {};
	copy.eventid = orig.eventid;
	copy.timestamp = orig.timestamp;
	copy.event = orig.event;
	copy.type = orig.type;
	copy.token = orig.token;

	copy.data = [];
	for (let dat of orig.data) {
		let itm = {};
		itm.name = dat.name;
		itm.value = dat.value;
		copy.data.push(itm);
	}
	return copy;
};

let populate = (event, token) => {
	event.token = token;
	return true;
}

class EventStore {
	constructor() {
		this.events = [];
		this.players = [];
		this.games = [];
		this.idxPlayerToken = {};
		this.idxPlayerName = {};
		this.idxGameToken = {};
		this.idxGameName = {};
		this.snapshot = -1;
	}

	////////////////////////////////////////////////
	rebuildPlayerIndex() {
		this.idxPlayerToken = {};
		this.idxPlayerName = {};
		for (let i = 0; i < this.players.length; i ++) {
			this.idxPlayerToken[this.players[i].token] = i;
			this.idxPlayerName[this.players[i].name] = i;
		}
	};

	rebuildGameIndex() {
		this.idxGameToken = {};
		this.idxGameName = {};
		for (let j = 0; j < this.games.length; j ++) {
			this.idxGameToken[this.games[j].token] = j;
			this.idxGameName[this.games[j].name] = j;
		}
	};

	////////////////////////////////////////////////
	list({ index }) {
		return new Promise((resolve, _) => {
			const len = this.events.length;
			const lst = (len > 0) ? this.events.slice(index).map(v => copy(v)) : [];
			resolve({ lastIndex: len - 1, eventList: lst });
		});
	}

	find({ from, to, type, event, token }) {
		return new Promise((resolve, _) => {
			resolve(this.events.filter(v =>
				((typeof(from) === "undefined")  || (from === null)  || (v.timestamp >= from)) &&
				((typeof(to) === "undefined")    || (to === null)    || (v.timestamp < to)) &&
				((typeof(type) === "undefined")  || (type === null)  || (v.type === type)) &&
				((typeof(event) === "undefined") || (event === null) || (v.event === event)) &&
				((typeof(token) === "undefined") || (token === null) || (v.token === token))
			).map(v => copy(v)));
		});
	}

	// Adding events (these are not commands)
	add({ event, payload = [] }) {
		return new Promise((resolve, reject) => {
			let dtm = Date.now();
			let eid = crypto.createHash('sha256').update('' + (dtm + Math.floor(Math.random()*10000))).digest('base64');
			let obj = {
				eventid: eid,
				timestamp: dtm,
				event: event.id,
				type: event.type
			};
			let rspn = { successful: false };

			// if (payload.name !== null) obj.name = payload.name;
			// if (payload.amount >= 0) obj.amount = payload.amount;
			obj.data = [];
			for (let d of payload) {
				obj.data.push(d);
			}

			let fltr1, fltr2, fltr3, fltr4, fltr5, fltr6;
			switch (event.id) {
				case consts.PLAYER_REGISTERED.id:
					fltr1 = payload.filter(d => (d.name === "playerName"));
					if (fltr1.length !== 1) {
						rspn.message = "[REGISTER] Missing player name";
					} else {
						rspn.successful = populate(obj, eid); //event id is also the token of the player
					}
					break;
				case consts.PLAYER_QUITTED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					if (fltr1.length !== 1) {
						rspn.message = "[QUIT] Missing player ID";
					} else {
						rspn.successful = populate(obj, fltr1[0].value); //token of the player quitting
					}
					break;
				case consts.GAME_JOINED.id:
				case consts.GAME_LEFT.id:
				case consts.GAME_CLOSED.id:
				case consts.GAME_STARTED.id:
				case consts.NEXT_PLAYER.id:
				case consts.SETUP_FINISHED.id:
				case consts.TURN_STARTED.id:
				case consts.TURN_ENDED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "Missing player and/or game IDs";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.GAME_OPENED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameName"));
					if (fltr1.length !== 1) {
						rspn.message = "[OPEN] Missing player ID";
					} else if (fltr2.length !== 1) {
						rspn.message = "[OPEN] Missing game name";
					} else {
						rspn.successful = populate(obj, eid); //event id is also the token of the game
					}
					break;
				case consts.TERRITORY_ASSIGNED.id:
				case consts.TERRITORY_SELECTED.id:
				case consts.CARD_RETURNED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "territoryName"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "Missing player and/or game IDs";
					} else if (fltr3.length !== 1) {
						rspn.message = "Missing territory name";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.TROOP_ADDED.id:
					// NOTE - used for both during game setup, and start of turns when adding troops to owned territories
					//      - usually correspond to a click to a territory, meaning to add 1 troop.
					//      - exception: when redeeming cards, if any of the territory on the cards are owned by the same player,
					//        add 2 troops directly to that territory
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "territoryName"));
					fltr4 = payload.filter(d => (d.name === "amount"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "[ADD] Missing player and/or game IDs";
					} else if (fltr3.length !== 1) {
						rspn.message = "[ADD] Missing territory name";
					} else if ((fltr4.length !== 1) || isNaN(fltr4[0].value)) {
						rspn.message = "[ADD] Missing number of troops";
					} else {
						rspn.successful = populate(obj, fltr2[0].value); //token of the game in question
					}
					break;
				case consts.TROOP_ASSIGNED.id:
					// TROOP_ASSIGNED: NOTE - use for assigning troops to a player at:
					//  1. during setup phase, assigning remaining troops after adding 1 troop to each owned territory
					//  2. at the begining of each turn when receiving reinforcement
					//  3. after redeem cards for additional reinforcement
				case consts.TROOP_DEPLOYED.id:
					// TROOP_DEPLOYED: NOTE - subtract currently available reinforcement of a player after troops added to a territory
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "amount"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1)) {
						rspn.message = "Missing player and/or game IDs";
					} else if ((fltr3.length !== 1) || isNaN(fltr3[0].value)) {
						rspn.message = "Missing number of troops";
					} else {
						rspn.successful = populate(obj, fltr1[0].value);
					}
					break;
				case consts.TERRITORY_ATTACKED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "fromTerritory"));
					fltr4 = payload.filter(d => (d.name === "toTerritory"));
					fltr5 = payload.filter(d => (d.name === "attackerLoss"));
					fltr6 = payload.filter(d => (d.name === "defenderLoss"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1)) {
						rspn.message = "[ATTACK] Missing player ID, game ID and from/to territory IDs";
					} else if ((fltr5.length !== 1) || isNaN(fltr5[0].value)) {
						rspn.message = "[ATTACK] Missing attacker casualties";
					} else if ((fltr6.length !== 1) || isNaN(fltr6[0].value)) {
						rspn.message = "[ATTACK] Missing defender casualties";
					} else {
						rspn.successful = populate(obj, fltr2[0].value); //token of the game in question
					}
					break;
				case consts.TERRITORY_CONQUERED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "fromTerritory"));
					fltr4 = payload.filter(d => (d.name === "toTerritory"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1)) {
						rspn.message = "[CONQUER] Missing player ID, game ID, and from/to territory IDs";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.PLAYER_ATTACKED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "defenderToken"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1)) {
						rspn.message = "[ATTACK] Missing player ID, game ID, and ID of the player under attack";
					} else {
						rspn.successful = populate(obj, fltr1[0].value);
					}
					break;
				case consts.FORTIFIED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "fromTerritory"));
					fltr4 = payload.filter(d => (d.name === "toTerritory"));
					fltr5 = payload.filter(d => (d.name === "amount"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1)) {
						rspn.message = "[FORTIFY] Missing player ID, game ID, and from/to territory IDs";
					} else if ((fltr5.length !== 1) || isNaN(fltr5[0].value)) {
						rspn.message = "[FORTIFY] Missing number of troops";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
				case consts.CARDS_REDEEMED.id:
					fltr1 = payload.filter(d => (d.name === "playerToken"));
					fltr2 = payload.filter(d => (d.name === "gameToken"));
					fltr3 = payload.filter(d => (d.name === "card1"));
					fltr4 = payload.filter(d => (d.name === "card2"));
					fltr5 = payload.filter(d => (d.name === "card3"));
					if ((fltr1.length !== 1) || (fltr2.length !== 1) || (fltr3.length !== 1) || (fltr4.length !== 1) || (fltr5.length !== 1)) {
						rspn.message = "[REDEEM] Missing player ID, game ID, and IDs of the cards being redeemed";
					} else {
						rspn.successful = populate(obj, fltr2[0].value);
					}
					break;
			}
			if (rspn.successful) {
				const len = this.events.push(obj);
				if (len > 0) {
					rspn.event = copy(obj);
					resolve(rspn);
				} else {
					throw new UserInputError(`Adding event ${JSON.stringify(obj)} failed`);
				}
			} else {
				throw new UserInputError(rspn.message);
			}
		});
	}
};

module.exports = EventStore;