
export function convert(tid) {
	const buff = tid.split("");
	let found = true;
	for (let i = 0; i < buff.length; i ++) {
		if (found) {
			found = false;
			buff[i] = buff[i].toUpperCase();
		} else if (buff[i] === '-') {
			found = true;
		}
	}
	return buff.join("");
}

export function getMousePosition(svg, xpos, ypos) {
	const CTM = svg.getScreenCTM();
	return {
		xpos: (xpos - CTM.e) / CTM.a,
		ypos: (ypos - CTM.f) / CTM.d
	};
}

export function getArrowHead({ a, b }, { c, d }, x, y) {
	const x1 = c - a;
	const y1 = d - b;
	if (y1 === 0) {
		return [{ p: (c - x), q: (d + y) }, { r: (c - x), s: (d - y) }];
	} else if (x1 === 0) {
		return [{ p: (c - y), q: (d - x) }, { r: (c + y), s: (d - x) }];
	}

	const l1 = Math.sqrt((x1 * x1) + (y1 * y1));
	const e = c - ((x * x1) / l1);
	const f = d - ((x * y1) / l1);
	const t = (a - c) / y1;
	const u = y / Math.sqrt((t * t) + 1);
	const p = Math.round(e - u);
	const q = Math.round(f - (t * u));
	const r = Math.round(u + e);
	const s = Math.round((t * u) + f);
	return [{ p, q }, { r, s }];
}
