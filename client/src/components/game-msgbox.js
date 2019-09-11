import React from 'react';

export default function Message(props) {
	const handleSubmit = (e) => {
		e.preventDefault();
		props.clear();
	};

	return (
		<>
			{props.message &&
				<div id="overlay">&nbsp;
					<div id="msgbox">
						<form onSubmit={handleSubmit}>
							<label>{props.message}</label>
							<input type="submit" value="&times;" />
						</form>
					</div>
				</div>
			}
		</>
	);
}
