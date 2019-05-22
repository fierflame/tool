
let base64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
export function base2buff(str, chars = base64chars) {
	const n = Math.floor(Math.log2(chars.length));
	str = str.replace(/[=\s]+/g,'');
	let list = new Uint8Array(str.length * n >> 3);
	let next = 0;
	let v = 0, l = 0;
	for (let c of str) {
		v = (v << n) | chars.indexOf(c);
		l += n;
		while (l >= 8) {
			l -= 8;
			list[next++] = (v >> l) & 0xff;
			v &= (1 << l) - 1;
		}
	}
	return list.buffer;
}
export function buff2base(buff, chars = base64chars) {
	const n = Math.floor(Math.log2(chars.length));
	const mask = (1 << n) - 1;
	let list = new Array(Math.floor(((buff.byteLength << 3) + n - 1) / n));
	let next = 0;
	let v = 0, l = 0;
	for (let b of new Uint8Array(buff)) {
		v = (v << 8) | b;
		l += 8;
		while(l >= n) {
			l -= n;
			list[next++] = chars[(v >> l) & mask];
			v &= (1 << l) - 1;
		}
	}
	if (l) { list[next++] = chars[(v << (n - l)) & mask]; }
	while (list.length % 4) { list.push('='); }
	return list.join('');
}

export function str2buff(str) {
	let out = [];
	for (let c of str.split('').map(ch => ch.charCodeAt(0))) {
		if (c < 0x80) {
			out.push(c);
		} else if (c < 0x800) {
			out.push(0xC0 | 0x1F & (c >> 6));
			out.push(0x80 | 0x3F & c);
		} else {
			out.push(0xE0 | 0x0F & (c >> 12));
			out.push(0x80 | 0x3F & (c >> 6));
			out.push(0x80 | 0x3F & c);
		}
	}
	return new Uint8Array(out).buffer;
}

export function buff2str(buffer) {
	const code = new Uint8Array(buffer);
	let ret = [];
	let index = 0;
	while (index < code.length) {
		let c = code[index++] | 0;
		if (c > 0b11100000) {
			c = (c & 0xF) << 12;
			c |= (code[index++] & 0x3F) << 6;
			c |= code[index++] & 0x3F;
		} else if (c > 0b11000000) {
			c = (c & 0x1F) << 12;
			c |= (code[index++] & 0x3F) << 6;
		}
		ret.push(c);
	}
	return ret.map(x => String.fromCharCode(x)).join('');
}
export function encode(str) {
	return buff2base(str2buff(str));
}

export function decode(base) {
	return buff2str(base2buff(base));
}
