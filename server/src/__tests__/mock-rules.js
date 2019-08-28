const gameRules = require('../rules');

module.exports.mockShuffleCards = (tokens) => {
	const cards1 = [
		"Northern-Europe","Congo","Irkutsk","Siberia","Japan","Venezuela","Brazil","Egypt","Peru","Western-Europe","Ural","Ukraine",
		"Eastern-Australia","Wildcard-2","Manchuria","Eastern-United-States","India","Alaska","China","Scandinavia","Great-Britain",
		"Indonesia","South-Africa","Western-Australia","Alberta","North-Africa","Quebec","Western-United-States","Afghanistan",
		"New-Guinea","Wildcard-1","Madagascar","Ontario","Middle-East","Yakutsk","Mexico","Greenland","Siam","East-Africa","Southern-Europe",
		"Northwest-Territory","Iceland","Argentina","Kamchatka"
	];
	const cards2 = [
		"Western-Europe",       "Ontario",          "Irkutsk",              "Great-Britain",        "Brazil",
		"Mexico",               "Eastern-Australia","Northwest-Territory",  "Kamchatka",            "Venezuela",
		"New-Guinea",           "Alberta",          "India",                "Ukraine",              "Peru",
		"Eastern-United-States","Ural",             "Congo",                "Indonesia",            "Middle-East",
		"Alaska",               "Greenland",        "South-Africa",         "Northern-Europe",      "Egypt",
		"Iceland",              "China",            "Western-Australia",    "Yakutsk",              "Argentina",
		"Southern-Europe",      "Manchuria",        "Western-United-States","Afghanistan",          "Siam",
		"Quebec",               "Japan",            "Scandinavia",          "North-Africa",         "East-Africa",
		"Madagascar",           "Siberia"
	];

	if (!tokens) {
		return cards1.map(c => {
			let card = {};
			card["name"] = c;
			card["type"] = gameRules.TERRITORIES[c] ? gameRules.TERRITORIES[c].card : "";
			return card;
		});
	} else {
		let ret = {};
		let index = 0;
		for (let v of cards2) {
			ret[v] = tokens[index % tokens.length];
			index ++;
		}
		return ret;
	}
};

module.exports.mockDoBattle = ({ attacker, defender }) => {
	const rd = Math.min(attacker, 4) - 1;
	const wd = Math.min(defender, 2);
	if ((rd === 1) && (wd === 1))
		return { attacker: 1, defender: 0 };
	else
		return { attacker: 1, defender: 1 };
};

module.exports.mockInitTroops = (players) => {
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

module.exports.mockInitPlayer = () => {
	return 3;
}