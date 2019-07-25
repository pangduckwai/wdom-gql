
module.exports.copyTerritory = (orig) => {
	let copy = {};
	copy.name = orig.name;
	copy.gid = orig.gid;
	copy.continent = orig.continent;
	if (typeof(orig.ptkn) !== "undefined") copy.ptkn = orig.ptkn; //(Player token)
	copy.army = orig.army;
	return copy;
};

module.exports.copyGame = (orig) => {
	let copy = {};
	copy.id = orig.id;
	copy.name = orig.name;
	copy.ptkn = orig.ptkn; //(Player token)
	copy.rounds = orig.rounds;
	copy.cardReinforcement = orig.cardReinforcement;
	copy.territories = orig.territories.map(t => this.copyTerritory(t));
	return copy;
};

module.exports.copyPlayer = (orig) => {
	let copy = {};
	copy.token = orig.token;
	copy.name = orig.name;
	if (typeof(orig.gid) !== "undefined") copy.gid = orig.gid; //(Game id)
	return copy;
};
