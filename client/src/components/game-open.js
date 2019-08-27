import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { OPEN_GAME } from '../mutations';

export default function OpenGame(props) {
	const [name, setName] = useState("");

	const [openGame, { loading, error }] = useMutation(OPEN_GAME, {
		onCompleted(data) {
			if (data.openGame.successful) {
				sessionStorage.setItem("gameToken", data.openGame.event.token);
				props.refresh({ player: true, game: true });
			}
		}
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (name && (name != null) && (name !== "")) {
			openGame({ variables: { name: name }}).then(r => {
				props.refetch();
			});
		}
	};

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}
	if (loading) return <div className="bb mb pb">Loading...</div>;
	return (
		<form id="create" className="bb mb pb" onSubmit={handleSubmit}>
			<input type="text" placeholder="Name of new game" autoFocus value={name} onChange={e => setName(e.target.value)} />
			<input type="submit" value="Create" />
		</form>
	);
}
