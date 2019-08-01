module.exports = Object.freeze({
	PLAYER_REGISTERED: {
		id: 1, type: "P"
	}, PLAYER_QUITTED: {
		id: 2, type: "P"
	}, GAME_JOINED: {
		id: 3, type: "G"
	}, GAME_LEFT: {
		id: 4, type: "G"
	}, NEXT_PLAYER: {
		id: 5, type: "G"
	}, GAME_OPENED: 6,
	GAME_CLOSED: {
		id: 7, type: "G"
	}, GAME_STARTED: {
		id: 8, type: "G"
	}, TERRITORY_ASSIGNED: {
		id: 9, type: "T"
	}, TROOP_ADDED: {
		id: 10, type: "T"
	}, TROOP_DEPLOYED: {
		id: 11, type: "P"
	}
});