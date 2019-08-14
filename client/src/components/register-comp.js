import React from 'react';
import './map.css';

export default class RegisterComp extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: ""
		};
	}

	handleChange(e) {
		this.setState({ name: e.target.value });
	}

	handleSubmit(e) {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		e.nativeEvent.preventDefault();
		this.props.register({ variables: { name: this.state.name }});
	}

	render() {
		return (
			<div className="control">
				<form onSubmit={this.handleSubmit.bind(this)}>
					<label>Your name
						<input type="text" value={this.state.name} onChange={this.handleChange.bind(this)} />
					</label>
					<input type="submit" value="Register player" />
				</form>
			</div>
		);
	}
}
