module.exports = Object.freeze({
	SETUP_PLAYERS: ['Rick', 'John', 'Josh', 'Nick', 'Rick', 'Paul', 'Bill', 'Fred', 'Jack'],
	SETUP_GAMES: [
		{ name: "John's Game", index: 'John' },
		{ name: "Paul's Game", index: 'Paul' },
		{ name: "John's Game", index: 'Rick' },
		{ name: "Some game", index: 'John'}
	],
	SETUP_JOIN: ['Rick', 'John', 'Josh', 'Nick', 'Bill', 'Fred', 'Jack'],
	SETUP_TROOPS: {
		'Rick': {index: 0, majors: ['Mexico', 'New-Guinea']},
		'John': {index: 0, majors: ['Siberia', 'Ural', 'Alberta']},
		'Josh': {index: 0, majors: ['Congo', 'South-Africa']},
		'Nick': {index: 0, majors: ['Great-Britain', 'Northern-Europe', 'Ukraine']},
		'Paul': {index: 0, majors: ['Venezuela']}
	},
	GAME_SCRIPT: [
		{p:'Paul', r:{xpt:5, name:'Brazil', amt:6},
			a:{xpt:9, lst:[{from:'Venezuela', to:'Mexico'}, {to:'Mexico', repeat:8}]},
			f:{from:'Mexico', to:'Venezuela', amt:7}, x:8},
		{p:'Rick', r:{xpt:3, name:'New-Guinea', amt:12}, a:{xpt:11, lst:[
			{from:'New-Guinea', to:'Eastern-Australia'}, {to:'Western-Australia'}, {to:'Indonesia'}
		]}, x:6},
		{p:'John', r:{xpt:3, name:'Alberta', amt:9},
			a:{xpt:10, lst:[{from:'Alberta', to:'Alaska'}, {to:'Kamchatka'}]}, x:5},
		{
			p:'Josh',
			r:{xpt:3, name:'South-Africa', amt:12},
			a:{xpt:11, lst:[{from:'South-Africa', to:'Madagascar'}, {to:'East-Africa'}, {from:'Congo', to:'North-Africa'}, {to:'Egypt'}]},
			x:6
		},
		// {
		// 	p:'Nick',
		// 	r:{xpt:3, name:'South-Africa', amt:12},
		// 	a:{xpt:11, lst:[{from:'South-Africa', to:'Madagascar'}, {to:'East-Africa'}, {from:'Congo', to:'North-Africa'}, {to:'Egypt'}]},
		// 	x:6
		// },
	]
});