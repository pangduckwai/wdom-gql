
module.exports.copyTerritory = (orig) => {
	let copy = {};
	copy.name = orig.name;
	copy.continent = orig.continent;
	if (orig.owner) copy.owner = orig.owner; //.owner is string (Player token)
	copy.army = orig.army;
	return copy;
};

module.exports.copyGame = (orig) => {
	let copy = {};
	copy.id = orig.id;
	copy.name = orig.name;
	copy.host = orig.host; //.host is string (Player token)
	copy.rounds = orig.rounds;
	copy.cardReinforcement = orig.cardReinforcement;
	copy.territories = orig.territories.map(t => this.copyTerritory(t));
	return copy;
};

module.exports.copyPlayer = (orig) => {
	let copy = {};
	copy.token = orig.token;
	copy.name = orig.name;
	if (orig.joined) copy.joined = orig.joined; //.joined is integer (Game id)
	return copy;
};
