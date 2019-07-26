const { DataSource } = require('apollo-datasource');

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
		return this.store.find({ id });
	}

	async findByHost() {
		if (this.context && this.context.player) {
			const token = this.context.player.token;
			return this.store.findByHost({ token });
		}
		return [];
	}

	async findHost({ id }) {
		const games = await this.store.findAny({ id });
		return (games.length > 0) ? games[0].ptkn : null;
	}

	async findOwner({ id, name }) {
		const games = await this.store.findAny({ id });
		if (games.length > 0) {
			for (let t of games[0].territories) {
				if (t.name === name)
					return t.ptkn;
			}
		}
		return null;
	}

	async create({ name }) {
		if (this.context && this.context.player) {
			const token = this.context.player.token;
			const game = await this.store.create({ name, token });
			return game ? game : null;
		}
		return null;
	}

	/////////////
	// these functions should be called something like 'nextRound', 'reinforce', 'conquer', etc
	/////////////

	async conquer({ id, name }) {
		if (this.context && this.context.player) {
			const token = this.context.player.token;
			const game = await this.store.update({ id: id, territory: { name: name, owner: token } });
			return game ? game : null;
		}
		return null;
	}

	// async updateRound({ id }) {
	// 	const games = await this.store.find({ id });
	// 	if (games.length > 0) {
	// 		if (this.context && this.context.player && (this.context.player.token === games[0].ptkn)) {
	// 			const game = await this.store.updateRound({ id });
	// 			return game ? game : null;
	// 		}
	// 	}
	// 	return null;
	// }

	// async updateReinforcement({ id }) {
	// 	const games = await this.store.find({ id });
	// 	if (games.length > 0) {
	// 		if (this.context && this.context.player && (this.context.player.token === games[0].ptkn)) {
	// 			const game = await this.store.updateReinforcement({ id });
	// 			return game ? game : null;
	// 		}
	// 	}
	// 	return null;
	// }

	async remove({ id }) {
		const games = await this.store.find({ id });
		if (games.length > 0) {
			if (this.context && this.context.player && (this.context.player.token === games[0].ptkn)) {
				const game = await this.store.remove({ id });
				return game ? game : null;
			}
		}
		return null;
	}
}

module.exports = GameDS;