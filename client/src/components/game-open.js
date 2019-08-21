import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { OPEN_GAME } from '../mutations';

export default function OpenGame(props) {
	const [name, setName] = useState("");

	const [openGame, { loading, error }] = useMutation(OPEN_GAME, {
		onCompleted(data) {
			if (data.openGame.successful) {
				sessionStorage.setItem("gameToken", data.openGame.event.token);
			}
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		openGame({ variables: { name: name }}).then(r => {
			props.refetch();
		});
	};

	if (loading) return <p>Loading...</p>;

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<form id="create" onSubmit={handleSubmit}>
			<input type="text" placeholder="Name of new game" value={name} onChange={e => setName(e.target.value)} />
			<input type="submit" value="Create" />
		</form>
	);
}
