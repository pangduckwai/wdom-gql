import React, { useState, useEffect } from 'react';

export default function Fortify(props) {
	const [amount, setAmount] = useState(0);

	useEffect(() => {
		if (props.fortified) setAmount(props.fortified.amount);
	});

	const handleUpdate = (e) => {
		setAmount(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		props.onFortified(props.fortified.from, props.fortified.to, amount);
	};

	return (
		<>
			{props.fortified &&
				<div id="overlay">&nbsp;
					<div id="msgbox">
						<form onSubmit={handleSubmit}>
							<label>From <span className="name">{props.fortified.from}</span></label>
							<label>To <span className="name">{props.fortified.to}</span></label>
							<label>
								<input
									type="range" step="1" min="0"
									max={props.fortified.amount} defaultValue={props.fortified.amount}
									onChange={handleUpdate}/>
							</label>
							<input type="submit" value="&crarr;" />
						</form>
					</div>
				</div>
			}
		</>
	);
}
