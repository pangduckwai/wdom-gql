import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { CLOSE_GAME } from '../mutations';

export default function GreetHost(props) {
	const [action, { loading, error }] = useMutation(CLOSE_GAME);

	const handleSubmit = (e) => {
		e.preventDefault();
		action().then(r => {
			props.refetch();
		});
	};

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}
	return (
		<form id="greeting" onSubmit={handleSubmit}>
			{!loading ? (
				<>
					<label className="title">Hello <span className="name">{props.playerName}</span></label>
					<input type="submit" value="&times;" />
				</>
			) : (
				<label className="title">Loading....</label>
			)}
		</form>
	);
}
