module.exports = Object.freeze({
	PLAYER_REGISTERED: {
		id: 1, type: "P"
	}, PLAYER_QUITTED: {
		id: 2, type: "P"
	}, GAME_JOINED: {
		id: 3, type: "P"
	}, GAME_LEFT: {
		id: 4, type: "P"
	}, GAME_OPENED: {
		id: 5, type: "G"
	}, GAME_CLOSED: {
		id: 6, type: "G"
	}, GAME_STARTED: {
		id: 7, type: "G"
	}, TERRITORY_ASSIGNED: {
		id: 8, type: "T"
	}, TROOP_ADDED: {
		id: 9, type: "T"
	}, TROOP_ASSIGNED: {
		id: 10, type: "P"
	}, TROOP_DEPLOYED: {
		id: 11, type: "P"
	}, ACTION_TAKEN: {
		id: 12, type: "G"
	}, TERRITORY_SELECTED: {
		id: 13, type: "G"
	}, TURN_TAKEN: {
		id: 14, type: "G"
	}, SETUP_FINISHED: {
		id: 15, type: "G"
	}, TURN_STARTED: {
		id: 16, type: "G"
	}
});