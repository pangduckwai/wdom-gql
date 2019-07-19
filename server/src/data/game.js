const { DataSource } = require('apollo-datasource');
const { CONTINENTS, TERRITORIES } = require('./constants');

class GameDS extends DataSource {
	constructor({ store }) {
		super();
		this.store = store;
	}

	initialize(config) {
		this.context = config.context;
	}

	async list() {
		const games = await this.store.list();
		return games ? games : null;
	}

	async find({ id }) {
		const game = await this.store.find({ id });
		return game ? game : null;
	}

	async findByHost({ token }) {
		const game = await this.store.findByHost({ token });
		return game ? game : null;
	}

	async create({ name }) {
		if (this.context && this.context.player) {
			const token = this.context.player.token
			const game = await this.store.create({ name }, { token });
			return game ? game : null;
		}
		return null;
	}

	async updateRound({ id }) {
		const game = await this.store.find({ id });
		if (game) {
			if (this.context && this.context.player && (this.context.player.token === game.host)) {
				const game = await this.store.updateRound({ id });
				return game ? game : null;
			}
		}
		return null;
	}

	async updateReinforcement({ id }) {
		const game = await this.store.find({ id });
		if (game) {
			if (this.context && this.context.player && (this.context.player.token === game.host)) {
				const game = await this.store.updateReinforcement({ id });
				return game ? game : null;
			}
		}
		return null;
	}

	async remove({ id }) {
		const game = await this.store.find({ id });
		if (game) {
			if (this.context && this.context.player && (this.context.player.token === game.host)) {
				const game = await this.store.remove({ id });
				return game ? game : null;
			}
		}
		return null;
	}

	// conReducer() {
	// 	return Object.keys(CONTINENTS).map(name => {
	// 		let continent = {};
	// 		continent["name"] = name;
	// 		continent["reinforcement"] = CONTINENTS[name].reinforcement;
	// 	});
	// }

	// trrReducer() {
	// 	return Object.keys(TERRITORIES).map(name => {
	// 		let territory = {};
	// 		territory["name"] = name;
	// 		territory["continent"] = TERRITORIES[name].continent;
	// 		territory["army"] = 0;
	// 	});
	// }
}

module.exports = GameDS;