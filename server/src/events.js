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
	}, TERRITORY_SELECTED: {
		id: 12, type: "G"
	}, NEXT_PLAYER: {
		id: 13, type: "G"
	}, SETUP_FINISHED: {
		id: 14, type: "G"
	}, TURN_STARTED: {
		id: 15, type: "G"
	}, CARD_RETURNED: {
		id: 16, type: "G"
	}, TERRITORY_ATTACKED: {
		id: 17, type: "G"
	}, TERRITORY_CONQUERED: {
		id: 18, type: "G"
	}, FORTIFIED: {
		id: 19, type: "G"
	}, TURN_ENDED: {
		id: 20, type: "G"
	}
});