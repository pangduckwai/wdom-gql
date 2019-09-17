import React, { useState } from 'react';

export default function Fortify(props) {
	const [amount, setAmount] = useState(props.amount);

	const handleUpdate = (e) => {
		setAmount(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const result = parseInt(amount, 10);
		props.onFortified(props.from, props.to, isNaN(result) ? 0 : result);
	};

	const handleCancel = (e) => {
		e.preventDefault();
		props.onFortified(props.from, props.to, 0);
	};

	return (
		<div id="overlay">&nbsp;
			<div id="fortify">
				<form onSubmit={handleSubmit}>
					<p>Fortification</p>
					<div className="lbl">From <span className="name">{props.from}</span></div>
					<div className="lbl">To <span className="name">{props.to}</span></div>
					<label>
						<input type="range" min="0" max={props.amount} value={amount} onChange={handleUpdate} />
						<span className="small">Moving {amount} troop{amount > 1 ? 's' : ''}</span>
					</label>
					<div>
						<input type="submit" value="Okay" autoFocus />
						<button type="button" onClick={handleCancel}>Cancel</button>
					</div>
				</form>
			</div>
		</div>
	);
}
