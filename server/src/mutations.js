const { gql } = require('apollo-server');

module.exports = Object.freeze({
	REGISTER: gql`
	mutation Register($name: String!) {
		register(name: $name) {
			token
			name
		}
	}`,
	LEAVE: gql`
	mutation Leave {
		leave {
			token
			name
		}
	}`,
	START: gql`
	mutation Start($name: String!) {
		start(name: $name) {
			id
			name
			rounds
			host {
				token
				name
			}
		}
	}`,
	JOIN: gql`
	mutation Join($id: ID!) {
		join(id: $id) {
			token
			name
			joined {
				id
				name
			}
		}
	}`,
	QUIT: gql`
	mutation Quit {
		quit {
			token
			name
			joined {
				id
				name
			}
		}
	}`,
	BEGIN: gql`
	mutation Begin {
		begin {
			id
			name
			rounds
			cardReinforcement
			host {
				token
				name
			}
			turn {
				token
				name
			}
			territories {
				name
				army
				owner {
					name
				}
			}
		}
	}`,
	NEXT: gql`
	mutation Next {
		next {
			id
			name
			rounds
			cardReinforcement
			host {
				token
				name
			}
			turn {
				token
				name
			}
		}
	}`,
	END: gql`
	mutation End {
		end {
			token
			name
			joined {
				name
			}
		}
	}`
});
