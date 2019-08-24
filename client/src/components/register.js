import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { REGISTER } from '../mutations';

export default function Register(props) {
	const [name, setName] = useState("");

	const [register, { loading, error }] = useMutation(REGISTER, {
		onCompleted(data) {
			if (data.registerPlayer.successful) {
				sessionStorage.setItem("token", data.registerPlayer.event.token);
			}
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (name && (name != null) && (name !== "")) {
			register({ variables: { name: name }}).then(r => {
				props.refetch();
			});
		}
	};

	if (loading) return <p>'Register' Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<>
			<div id="greeting" className="title">Register as player</div>
			<form id="create" onSubmit={handleSubmit}>
				<input type="text" placeholder="Your name" autoFocus value={name} onChange={e => setName(e.target.value)} />
				<input type="submit" value="Register player" />
			</form>
		</>
	);
}
