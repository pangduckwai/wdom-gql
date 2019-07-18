const crypto = require('crypto');

let store = [];
let idxToken = {};
let idxName = {};

let rebuildIndex = () => {
	idxToken = {};
	idxName = {};

	for (let idx = 0; idx < store.length; idx ++) {
		idxToken[store[idx].token] = idx;
		idxName[store[idx].name.toUpperCase()] = idx;
	}
};

module.exports.listAll = () => {
	return new Promise((resolve, _) => {
		resolve(store);
	});
};

module.exports.list = ({ id }) => {
	return new Promise((resolve, _) => {
		resolve(store.filter(p => p.joined && p.joined.id === id));
	});
};

module.exports.find = ({ token }) => {
	return new Promise((resolve, reject) => {
		if (token) {
			const result = store[idxToken[token]];
			if (result) {
				resolve(result);
			} else {
				reject("Player not found");
			}
		} else {
			reject("Must provide either the token of the player");
		}
	});
};

module.exports.findByName = ({ name }) => {
	return new Promise((resolve, reject) => {
		if (name) {
			const result = store[idxName[name.toUpperCase()]];
			if (result) {
				resolve(result);
			} else {
				reject(`Player '${name}' not found`);
			}
		} else {
			reject("Must provide the name of the player");
		}
	});
}

module.exports.create = ({ name }) => {
	return new Promise((resolve, reject) => {
		if (name) {
			const result = store[idxName[name.toUpperCase()]];
			if (result) {
				reject(`Player '${result.name}' already exists`);
			} else {
				let token = crypto.createHash('sha256').update(name + (Math.floor(Math.random()*10000)).toString()).digest('base64');
				let player = {
					token: token,
					name: name
				}
				let len = store.push(player);
				if (len > 0) {
					rebuildIndex();
					resolve(player);
				} else {
					reject(`Add player '${name}' failed`);
				}
			}
		} else {
			reject("Must provide the player name");
		}
	});
};

module.exports.update = (p) => {
	return new Promise((resolve, reject) => {
		if (p && p.token) {
			const player = store[idxToken[p.token]];
			if (player) {
				if (p.joined) {
					player.joined = p.joined;
				} else {
					delete player.joined;
				}
				resolve(player);
			}
		} else {
			reject("Invalid player input");
		}
	});
};

module.exports.remove = ({ token }) => {
	return new Promise((resolve, reject) => {
		if (token) {
			const result = store[idxToken[token]];
			if (result) {
				store.splice(idxToken[token], 1);
				rebuildIndex();
				resolve(result);
			} else {
				reject("Player not found");
			}
		} else {
			reject("Must provide the player token");
		}
	});
};