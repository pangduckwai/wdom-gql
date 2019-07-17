const crypto = require('crypto');

let store = [];
let idxToken = {};
let idxName = {};

module.exports.list = () => {
	return new Promise((resolve, reject) => {
		resolve({ store, idxToken, idxName });
	});
};

module.exports.find = ({ token, name }) => {
	return new Promise((resolve, reject) => {
		if (token) {
			const result = store[idxToken[token]];
			if (result && result.active) {
				resolve(result);
			} else {
				reject("Player not found");
			}
		} else if (name) {
			const result = store[idxName[name.toUpperCase()]];
			if (result && result.active) {
				resolve(result);
			} else {
				reject(`Player '${name}' not found`);
			}
		} else {
			reject("Must provide either the token or name of the player");
		}
	});
};

module.exports.join = ({ name }) => {
	return new Promise((resolve, reject) => {
		if (name) {
			const result = store[idxName[name.toUpperCase()]];
			if (result && result.active) {
				reject(`Player '${result.name}' already exists`);
			} else {
				let token = crypto.createHash('sha256').update(name + (Math.floor(Math.random()*10000)).toString()).digest('base64');
				let player = {
					token: token,
					name: name,
					active: true
				}
				let len = store.push(player);
				if (len > 0) {
					idxToken[token] = len - 1;
					idxName[name.toUpperCase()] = len - 1;
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

module.exports.leave = ({ token }) => {
	return new Promise((resolve, reject) => {
		if (token) {
			const result = store[idxToken[token]];
			if (result) {
				result.active = false;
				resolve(result);
			} else {
				reject("Player not found");
			}
		} else {
			reject("Must provide the player token");
		}
	});
};