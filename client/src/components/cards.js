import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { REDEEM_CARDS } from '../mutations';
import { convert, isRedeemable } from '../utils';

export default function Cards(props) {
	const [compKey, setCompKey] = useState(0);
	const [values, setValues] = useState([]);
	const [scroll, setScroll] = useState(0);

	const [redeemCards, { loading, error }] = useMutation(REDEEM_CARDS, {
		onCompleted(data) {
			if (data.redeemCards.successful) {
				props.refresh({ player: true, game: true });
			}
		}
	});

	useEffect(() => {
		const list = document.getElementById("card-list");
		if (list) {
			list.scrollLeft = scroll;
		}
	});

	const handleSelect = (e) => {
		let array = values.map(c => c);
		let selected = e.target.value;

		const index = array.indexOf(selected);
		if (index >= 0) {
			array.splice(index, 1);
		} else {
			array.push(selected);
			if (array.length > 3) array.shift();
		}

		setValues(array);

		const list = document.getElementById("card-list");
		setScroll(list.scrollLeft);
		setCompKey(compKey + 1);
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (values.length !== 3) {
			console.log("Redeem a set of 3 cards...");
			return;
		}

		const rdm = props.cards.filter(c => (c.name === values[0]) || (c.name === values[1]) || (c.name === values[2]));
		if (!isRedeemable(rdm)) {
			console.log("Card set not redeemable...");
			return;
		}

		console.log("Redeem....", JSON.stringify(values));
		redeemCards({ variables: { cards: values }}).then(r => {
			props.refresh({ player: true, game: true });
		});
	};

	const handleHover = (e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		if (typeof(e.target.dataset.cid) !== "undefined") {
			props.onMouseOver(convert(e.target.dataset.cid));
		}
	};
	const handleLeave = (e) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		if (typeof(e.target.dataset.cid) !== "undefined") {
			props.onMouseOver(null);
		}
	};

	if (error) {
		console.log(JSON.stringify(error));
		return <p>ERROR</p>;
	}

	return (
		<>
			{loading &&
				<div id="cards">Loading...</div>
			}
			{!loading && props.playerToken && (props.cards.length > 0) &&
				<form key={compKey} id="cards" onSubmit={handleSubmit}>
					<ul id="card-list" onChange={handleSelect}>
						{props.cards.map(c => {
							const idx = props.territoryIdx[c.name];
							const territory = (typeof(idx) !== "undefined") && (idx >= 0) && (props.territories.length > 0) ? props.territories[idx] : {};
							const cid = c.name.toLowerCase();
							return (<li key={c.name}>
								<div data-cid={cid}
									className="card"
									onMouseOver={handleHover}
									onMouseLeave={handleLeave}>
									<div data-cid={cid} className="card-abbv">
										{c.type.substring(0, 1)}
									</div>
									<div data-cid={cid} className="card-self">
										{territory.owner && (territory.owner.token === props.playerToken) ? "@" : "" }
									</div>
									<input data-cid={cid}
										type="checkbox"
										value={c.name}
										defaultChecked={values.includes(c.name)} />
								</div>
							</li>);
						})}
					</ul>
					<input type="submit" value="&crarr;" />
				</form>
			}
		</>
	);
}
