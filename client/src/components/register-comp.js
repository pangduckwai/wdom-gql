import React from 'react';
import './map.css';

export default class RegisterComp extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: ""
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(e) {
		this.setState({ name: e.target.value });
	}

	handleSubmit(e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		e.nativeEvent.preventDefault();
		this.props.register({ variables: { name: this.state.name }}).then(r => {
			this.props.refetch();
		});
	}

	render() {
		return (
			<>
				<div id="greeting" className="title">Register as a player</div>
				<form id="create" onSubmit={this.handleSubmit}>
					<input type="text" placeholder="Your name" value={this.state.name} onChange={this.handleChange} />
					<input type="submit" value="Register player" />
				</form>
			</>
		);
	}
}
