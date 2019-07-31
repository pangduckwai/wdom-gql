
module.exports.copyTerritory = (orig) => {
	let copy = {};
	copy.name = orig.name;
	copy.gid = orig.gid;
	copy.continent = orig.continent;
	if (typeof(orig.otkn) !== "undefined") copy.otkn = orig.otkn; //(Player token)
	copy.army = orig.army;
	return copy;
};

module.exports.copyGame = (orig) => {
	let copy = {};
	copy.id = orig.id;
	copy.name = orig.name;
	copy.htkn = orig.htkn; //(Player token)
	if (typeof(orig.ttkn) !== "undefined") copy.ttkn = orig.ttkn; //(Player token)
	copy.rounds = orig.rounds;
	copy.cardReinforcement = orig.cardReinforcement;
	copy.territories = orig.territories.map(t => this.copyTerritory(t));
	return copy;
};

module.exports.copyPlayer = (orig) => {
	let copy = {};
	copy.token = orig.token;
	copy.name = orig.name;
	copy.reinforcement = orig.reinforcement;
	if (typeof(orig.gid) !== "undefined") copy.gid = orig.gid; //(Game id)
	return copy;
};
