const evn = require('../const-events');

module.exports.mockSetup = async ({ eventDS }) => {
	let ptokens = [];
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Rick' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'John' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Josh' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Nick' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.PLAYER_REGISTERED, payload: { name: 'Fred' }}).then(r => ptokens.push(r.event.token));
	await eventDS.updateSnapshot();

	let gtokens = [];
	await eventDS.add({ event: evn.GAME_OPENED, payload: { name: "Rick's Game", data: [ ptokens[0] ]}}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[0], gtokens[0]] }});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_OPENED, payload: { name: "John's Game", data: [ ptokens[1] ]}}).then(r => gtokens.push(r.event.token));
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[1], gtokens[1]] }});
	await eventDS.updateSnapshot();

	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[2], gtokens[1]] }});
	await eventDS.updateSnapshot();
	await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[3], gtokens[1]] }});
	await eventDS.updateSnapshot();
	// await eventDS.add({ event: evn.GAME_JOINED, payload: { data: [ptokens[4], gtokens[1]] }});
	// await eventDS.updateSnapshot();
};

/* For playground
query Games {
	listGames {
		token
		name
		host {
			name
		}
	}
}

query Players {
	listPlayers {
    token
		name
    joined {
      name
    }
	}
}

query Myself {
  me {
    token
    name
    joined {
      name
    }
  }
}
{
  "authorization": "hQeuhr6j2zyb4qt30/fW10UQookAPudiKfSR9k5La/Y="
}
*/