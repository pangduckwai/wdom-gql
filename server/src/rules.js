/*
- Setup Phase
- Playing Phase
- Reinforce Stage
- Combat Stage
- Fortify Stage
*/

let gameRules = new function() {
	this.MIN_PLAYER_PER_GAME = 3;
	this.MAX_PLAYER_PER_GAME = 6;

	this.CONTINENTS = {
		"Africa": {
			reinforcement: 3,
			territories: ["Congo", "East-Africa", "Egypt", "Madagascar", "North-Africa", "South-Africa"]
		}, "Asia": {
			reinforcement: 7,
			territories: ["Afghanistan", "China", "India", "Irkutsk", "Japan", "Kamchatka", "Manchuria", "Middle-East", "Siam", "Siberia", "Ural", "Yakutsk"]
		}, "Australia": {
			reinforcement: 2,
			territories: ["Eastern-Australia", "Indonesia", "New-Guinea", "Western-Australia"]
		}, "Europe": {
			reinforcement: 5,
			territories: ["Great-Britain", "Iceland", "Northern-Europe", "Scandinavia", "Southern-Europe", "Ukraine", "Western-Europe"]
		}, "North-America": {
			reinforcement: 5,
			territories: ["Alaska", "Alberta", "Eastern-United-States", "Greenland", "Mexico", "Northwest-Territory", "Ontario", "Quebec", "Western-United-States"]
		}, "South-America": {
			reinforcement: 2,
			territories: ["Argentina", "Brazil", "Peru", "Venezuela"]
		},
	};

	this.TERRITORIES = {
		"Congo": {
			continent: "Africa", card: "A", connected: ["East-Africa", "North-Africa", "South-Africa"]
		}, "East-Africa": {
			continent: "Africa", card: "I", connected: ["Congo", "Egypt", "Madagascar", "North-Africa", "South-Africa", "Middle-East"]
		}, "Egypt": {
			continent: "Africa", card: "C", connected: ["East-Africa", "North-Africa", "Middle-East", "Southern-Europe"]
		}, "Madagascar": {
			continent: "Africa", card: "C", connected: ["East-Africa", "South-Africa"]
		}, "North-Africa": {
			continent: "Africa", card: "I", connected: ["Congo", "Egypt", "East-Africa", "Southern-Europe", "Western-Europe", "Brazil"]
		}, "South-Africa": {
			continent: "Africa", card: "A", connected: ["Congo", "East-Africa", "Madagascar"]
		}, "Afghanistan": {
			continent: "Asia", card: "I", connected: ["China", "India", "Middle-East", "Ural", "Ukraine"]
		}, "China": {
			continent: "Asia", card: "A", connected: ["Afghanistan", "India", "Manchuria", "Siam", "Siberia", "Ural"]
		}, "India": {
			continent: "Asia", card: "C", connected: ["Afghanistan", "China", "Middle-East", "Siam"]
		}, "Irkutsk": {
			continent: "Asia", card: "A", connected: ["Kamchatka", "Manchuria", "Siberia", "Yakutsk"]
		}, "Japan": {
			continent: "Asia", card: "C", connected: ["Kamchatka", "Manchuria"]
		}, "Kamchatka": {
			continent: "Asia", card: "A", connected: ["Irkutsk", "Japan", "Manchuria", "Yakutsk", "Alaska"]
		}, "Manchuria": {
			continent: "Asia", card: "C", connected: ["China", "Irkutsk", "Japan", "Kamchatka", "Siberia"]
		}, "Middle-East": {
			continent: "Asia", card: "A", connected: ["Afghanistan", "India", "Egypt", "East-Africa", "Southern-Europe", "Ukraine"]
		}, "Siam": {
			continent: "Asia", card: "C", connected: ["China", "India", "Indonesia"]
		}, "Siberia": {
			continent: "Asia", card: "I", connected: ["China", "Irkutsk", "Manchuria", "Ural", "Yakutsk"]
		}, "Ural": {
			continent: "Asia", card: "I", connected: ["Afghanistan", "China", "Siberia", "Ukraine"]
		}, "Yakutsk": {
			continent: "Asia", card: "A", connected: ["Irkutsk", "Kamchatka", "Siberia"]
		}, "Eastern-Australia": {
			continent: "Australia", card: "C", connected: ["New-Guinea", "Western-Australia"]
		}, "Indonesia": {
			continent: "Australia", card: "I", connected: ["New-Guinea", "Western-Australia", "Siam"]
		}, "New-Guinea": {
			continent: "Australia", card: "C", connected: ["Eastern-Australia", "Indonesia", "Western-Australia"]
		}, "Western-Australia": {
			continent: "Australia", card: "A", connected: ["Eastern-Australia", "Indonesia", "New-Guinea"]
		}, "Great-Britain": {
			continent: "Europe", card: "I", connected: ["Iceland", "Northern-Europe", "Scandinavia", "Western-Europe"]
		}, "Iceland": {
			continent: "Europe", card: "C", connected: ["Great-Britain", "Scandinavia", "Greenland"]
		}, "Northern-Europe": {
			continent: "Europe", card: "C", connected: ["Great-Britain", "Scandinavia", "Southern-Europe", "Ukraine", "Western-Europe"]
		}, "Scandinavia": {
			continent: "Europe", card: "I", connected: ["Great-Britain", "Iceland", "Northern-Europe", "Ukraine"]
		}, "Southern-Europe": {
			continent: "Europe", card: "I", connected: ["Northern-Europe", "Ukraine", "Western-Europe", "Egypt", "North-Africa", "Middle-East"]
		}, "Ukraine": {
			continent: "Europe", card: "I", connected: ["Northern-Europe", "Scandinavia", "Southern-Europe", "Afghanistan", "Middle-East", "Ural"]
		}, "Western-Europe": {
			continent: "Europe", card: "I", connected: ["Great-Britain", "Northern-Europe", "Southern-Europe", "North-Africa"]
		}, "Alaska": {
			continent: "North-America", card: "A", connected: ["Alberta", "Northwest-Territory", "Kamchatka"]
		}, "Alberta": {
			continent: "North-America", card: "A", connected: ["Alaska", "Northwest-Territory", "Ontario", "Western-United-States"]
		}, "Eastern-United-States": {
			continent: "North-America", card: "A", connected: ["Mexico", "Ontario", "Quebec", "Western-United-States"]
		}, "Greenland": {
			continent: "North-America", card: "C", connected: ["Northwest-Territory", "Ontario", "Quebec", "Iceland"]
		}, "Mexico": {
			continent: "North-America", card: "I", connected: ["Eastern-United-States", "Western-United-States", "Venezuela"]
		}, "Northwest-Territory": {
			continent: "North-America", card: "C", connected: ["Alaska", "Alberta", "Greenland", "Ontario"]
		}, "Ontario": {
			continent: "North-America", card: "A", connected: ["Alberta", "Eastern-United-States", "Greenland", "Northwest-Territory", "Quebec", "Western-United-States"]
		}, "Quebec": {
			continent: "North-America", card: "A", connected: ["Eastern-United-States", "Greenland", "Ontario"]
		}, "Western-United-States": {
			continent: "North-America", card: "A", connected: ["Alberta", "Eastern-United-States", "Mexico", "Ontario"]
		}, "Argentina": {
			continent: "South-America", card: "I", connected: ["Brazil", "Peru"]
		}, "Brazil": {
			continent: "South-America", card: "I", connected: ["Argentina", "Peru", "Venezuela", "North-Africa"]
		}, "Peru": {
			continent: "South-America", card: "C", connected: ["Argentina", "Brazil", "Venezuela"]
		}, "Venezuela": {
			continent: "South-America", card: "C", connected: ["Brazil", "Peru", "Mexico"]
		}
	};

	this.initialTroops = (players) => {
		switch(players) {
			case 3:
				return 35;
			case 4:
				return 30;
			case 5:
				return 25;
			case 6:
				return 20;
		}
	};

	this.basicReinforcement = (holdings) => {
		const ret = Math.floor(holdings.length / 3);
		return (ret < 3) ? 3 : ret;
	};

	this.continentReinforcement = (holdings) => {
		return Object.keys(this.CONTINENTS).reduce((accm, curr) => {
			const val = holdings.filter(t => t.continent === curr).length;
			return accm + ((val === this.CONTINENTS[curr].territories.length) ? this.CONTINENTS[curr].reinforcement : 0);
		}, 0);
	};

	this.redeemReinforcement = (last) => {
		switch(last) {
			case 0:
				return 4;
			case 4:
				return 6;
			case 6:
				return 8;
			case 8:
				return 10;
			default:
				if (last >= 10) {
					if (last < 65) {
						return (5 * Math.floor(last/5)) + 5;
					} else {
						return 65;
					}
				}
				return -1;
		}
	};

	this.isRedeemable = (cards) => {
		if (cards.length < 3) return false;
		let a = cards.filter(c => (c.type === "A") || (c.type === ""));
		let c = cards.filter(c => (c.type === "C") || (c.type === ""));
		let i = cards.filter(c => (c.type === "I") || (c.type === ""));

		return ((a.length >= 3) || (c.length >= 3) || (i.length >= 3) || ((a.length >= 1) && (c.length >= 1) && (i.length >= 1)));
	};

	this.buildTerritory = () => {
		let tindex = {};
		let territories = Object.keys(this.TERRITORIES).map((name, idx) => {
			let territory = {};
			territory["name"] = name;
			territory["continent"] = this.TERRITORIES[name].continent;
			territory["troops"] = 0;
			tindex[name] = idx;
			return territory;
		});
		for (let territory of territories) {
			territory["connected"] = this.TERRITORIES[territory.name].connected.map(name => territories[tindex[name]]);
		}
		return territories;
	};

	this.getCard = (name) => {
		const rec = this.TERRITORIES[name];
		let card = {};
		card['name'] = name;
		if (rec) {
			card["type"] = rec.card;
		} else if ((name === "Wildcard-1") || (name === "Wildcard-2")) {
			card["type"] = "";
		} else {
			return null;
		}
		return card;
	};

	this.shuffleCards = (tokens) => {
		let cards = Object.keys(this.TERRITORIES);
		if (!tokens) {
			cards.push("Wildcard-1");
			cards.push("Wildcard-2");
		}
		let size = cards.length;

		while (size > 0) {
			let idx = Math.floor(Math.random() * size);
			size --;

			let tmp = cards[size];
			cards[size] = cards[idx];
			cards[idx] = tmp;
		}

		if (!tokens) {
			return cards.map(c => {
				let card = {};
				card["name"] = c;
				card["type"] = this.TERRITORIES[c] ? this.TERRITORIES[c].card : "";
				return card;
			});
		} else {
			let ret = {};
			let index = 0;
			for (let v of cards) {
				ret[v] = tokens[index % tokens.length];
				index ++;
			}
			return ret;
		}
	};

	this.doBattle = ({ attacker, defender }) => {
		let rdice = [], wdice = [];

		let roll = (start, end, troops, dices) => {
			let r;
			for (let i = start; i < Math.min(troops, end+start); i ++) {
				r = Math.floor(Math.random() * 6) + 1;
				for (let j = 0; j < dices.length; j ++) {
					if (r > dices[j]) {
						dices.splice(j, 0, r);
						break;
					}
				}
				if (dices.length === (i-start)) dices.push(r);
			}
		};

		roll(1, 3, attacker, rdice);
		roll(0, 2, defender, wdice);

		let casualties = { attacker: 0, defender: 0 };
		for (let k = 0; k < Math.min(rdice.length, wdice.length); k ++) {
			if (rdice[k] > wdice[k]) {
				casualties.defender ++; //Defender lose
			} else {
				casualties.attacker ++; //Attacker lose
			}
		}
		return casualties;
	};
};

module.exports = gameRules;