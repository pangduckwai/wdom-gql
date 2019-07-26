
let CONTINENTS = {
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

let TERRITORIES = {
	   "Congo": {
		continent: "Africa", connected: ["East-Africa", "North-Africa", "South-Africa"]
	}, "East-Africa": {
		continent: "Africa", connected: ["Congo", "Egypt", "Madagascar", "North-Africa", "South-Africa", "Middle-East"]
	}, "Egypt": {
		continent: "Africa", connected: ["East-Africa", "North-Africa", "Middle-East", "Southern-Europe"]
	}, "Madagascar": {
		continent: "Africa", connected: ["East-Africa", "South-Africa"]
	}, "North-Africa": {
		continent: "Africa", connected: ["Congo", "Egypt", "East-Africa", "Southern-Europe", "Western-Europe", "Brazil"]
	}, "South-Africa": {
		continent: "Africa", connected: ["Congo", "East-Africa", "Madagascar"]
	}, "Afghanistan": {
		continent: "Asia", connected: ["China", "India", "Middle-East", "Ural", "Ukraine"]
	}, "China": {
		continent: "Asia", connected: ["Afghanistan", "India", "Manchuria", "Siam", "Siberia", "Ural"]
	}, "India": {
		continent: "Asia", connected: ["Afghanistan", "China", "Middle-East", "Siam"]
	}, "Irkutsk": {
		continent: "Asia", connected: ["Kamchatka", "Manchuria", "Siberia", "Yakutsk"]
	}, "Japan": {
		continent: "Asia", connected: ["Kamchatka", "Manchuria"]
	}, "Kamchatka": {
		continent: "Asia", connected: ["Irkutsk", "Japan", "Manchuria", "Yakutsk", "Alaska"]
	}, "Manchuria": {
		continent: "Asia", connected: ["China", "Irkutsk", "Japan", "Kamchatka", "Siberia"]
	}, "Middle-East": {
		continent: "Asia", connected: ["Afghanistan", "India", "Egypt", "East-Africa", "Southern-Europe", "Ukraine"]
	}, "Siam": {
		continent: "Asia", connected: ["China", "India", "Indonesia"]
	}, "Siberia": {
		continent: "Asia", connected: ["China", "Irkutsk", "Manchuria", "Ural", "Yakutsk"]
	}, "Ural": {
		continent: "Asia", connected: ["Afghanistan", "China", "Siberia", "Ukraine"]
	}, "Yakutsk": {
		continent: "Asia", connected: ["Irkutsk", "Kamchatka", "Siberia"]
	}, "Eastern-Australia": {
		continent: "Australia", connected: ["New-Guinea", "Western-Australia"]
	}, "Indonesia": {
		continent: "Australia", connected: ["New-Guinea", "Western-Australia", "Siam"]
	}, "New-Guinea": {
		continent: "Australia", connected: ["Eastern-Australia", "Indonesia", "Western-Australia"]
	}, "Western-Australia": {
		continent: "Australia", connected: ["Eastern-Australia", "Indonesia", "New-Guinea"]
	}, "Great-Britain": {
		continent: "Europe", connected: ["Iceland", "Northern-Europe", "Scandinavia", "Western-Europe"]
	}, "Iceland": {
		continent: "Europe", connected: ["Great-Britain", "Scandinavia", "Greenland"]
	}, "Northern-Europe": {
		continent: "Europe", connected: ["Great-Britain", "Scandinavia", "Southern-Europe", "Ukraine", "Western-Europe"]
	}, "Scandinavia": {
		continent: "Europe", connected: ["Great-Britain", "Iceland", "Northern-Europe", "Ukraine"]
	}, "Southern-Europe": {
		continent: "Europe", connected: ["Northern-Europe", "Ukraine", "Western-Europe", "Egypt", "North-Africa", "Middle-East"]
	}, "Ukraine": {
		continent: "Europe", connected: ["Northern-Europe", "Scandinavia", "Southern-Europe", "Afghanistan", "Middle-East", "Ural"]
	}, "Western-Europe": {
		continent: "Europe", connected: ["Great-Britain", "Northern-Europe", "Southern-Europe", "North-Africa"]
	}, "Alaska": {
		continent: "North-America", connected: ["Alberta", "Northwest-Territory", "Kamchatka"]
	}, "Alberta": {
		continent: "North-America", connected: ["Alaska", "Northwest-Territory", "Ontario", "Western-United-States"]
	}, "Eastern-United-States": {
		continent: "North-America", connected: ["Mexico", "Ontario", "Quebec", "Western-United-States"]
	}, "Greenland": {
		continent: "North-America", connected: ["Northwest-Territory", "Ontario", "Quebec", "Iceland"]
	}, "Mexico": {
		continent: "North-America", connected: ["Eastern-United-States", "Western-United-States", "Venezuela"]
	}, "Northwest-Territory": {
		continent: "North-America", connected: ["Alaska", "Alberta", "Greenland", "Ontario"]
	}, "Ontario": {
		continent: "North-America", connected: ["Alberta", "Eastern-United-States", "Greenland", "Northwest-Territory", "Quebec", "Western-United-States"]
	}, "Quebec": {
		continent: "North-America", connected: ["Eastern-United-States", "Greenland", "Ontario"]
	}, "Western-United-States": {
		continent: "North-America", connected: ["Alberta", "Eastern-United-States", "Mexico", "Ontario"]
	}, "Argentina": {
		continent: "South-America", connected: ["Brazil", "Peru"]
	}, "Brazil": {
		continent: "South-America", connected: ["Argentina", "Peru", "Venezuela", "North-Africa"]
	}, "Peru": {
		continent: "South-America", connected: ["Argentina", "Brazil", "Venezuela"]
	}, "Venezuela": {
		continent: "South-America", connected: ["Brazil", "Peru", "Mexico"]
	}
};

module.exports.minPlayersPerGame = () => {
	return 3;
};

module.exports.maxPlayersPerGame = () => {
	return 6;
};

module.exports.initialArmies = (players) => {
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

module.exports.continentReinforcement = (continent) => {
	const cont = CONTINENTS[continent];
	if (cont) return cont.reinforcement;
	return -1;
};

module.exports.cardReinforcement = (last) => {
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

module.exports.basicReinforcement = (holdings) => {
	const ret = Math.floor(holdings.length / 3);
	return (ret < 3) ? 3 : ret;
};

module.exports.territoryReducer = (id) => {
    return Object.keys(TERRITORIES).map(name => {
        let territory = {};
        territory["name"] = name;
        territory["gid"] = id;
        territory["continent"] = TERRITORIES[name].continent;
        territory["army"] = 0;
        return territory;
    });
};

module.exports.shuffleCards = (tokens) => {
	let cards = Object.keys(TERRITORIES);
	let size = cards.length;

	while (size > 0) {
		let idx = Math.floor(Math.random() * size);
		size --;

		let tmp = cards[size];
		cards[size] = cards[idx];
		cards[idx] = tmp;
	}

	let ret = {};
	let index = 0;
	for (let v of cards) {
		ret[v] = tokens[index % tokens.length];
		index ++;
	}
	return ret;
};
