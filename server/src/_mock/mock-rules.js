const gameRules = require('../rules');

module.exports.mockShuffleCards = (tokens) => {
	const cards1 = [
		"Northern-Europe","Congo","Irkutsk","Siberia","Japan","Venezuela","Brazil","Egypt","Peru","Western-Europe","Ural","Ukraine",
		"Eastern-Australia","Alaska","Manchuria","Eastern-United-States","India","Wildcard-2","China","Scandinavia","Great-Britain",
		"Indonesia","South-Africa","Western-Australia","Alberta","North-Africa","Quebec","Western-United-States","Afghanistan",
		"New-Guinea","Wildcard-1","Madagascar","Ontario","Middle-East","Yakutsk","Mexico","Greenland","Siam","East-Africa","Southern-Europe",
		"Northwest-Territory","Iceland","Argentina","Kamchatka"
	];
	const cards2 = ["Western-Europe","Ontario","Irkutsk","Great-Britain","Brazil","Mexico","Eastern-Australia","Northwest-Territory",
		"Kamchatka","Venezuela","New-Guinea","Alberta","Ukraine","India","Peru","Eastern-United-States","Ural","Congo",
		"Indonesia","Middle-East","Alaska","Greenland","South-Africa","Northern-Europe","Egypt","Iceland","China",
		"Western-Australia","Yakutsk","Argentina","Southern-Europe","Manchuria","Western-United-States","Afghanistan","Siam","Quebec",
		"Japan","Scandinavia","North-Africa","East-Africa","Madagascar","Siberia"
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
	return { attacker: 1, defender: 1 };
};