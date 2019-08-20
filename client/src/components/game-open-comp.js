import React from 'react';
import './map.css';

export default class OpenGameComp extends React.Component {
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
		this.props.openGame({ variables: { name: this.state.name }}).then(r => {
			this.props.refetch();
		});
	}

	render() {
		return (
			<form id="create" onSubmit={this.handleSubmit}>
				<input type="text" placeholder="Name of new game" value={this.state.name} onChange={this.handleChange} />
				<input type="submit" value="Create" />
			</form>
		);
	}
}
