
const nameKeyMap = {
	'tab': 'Tab', 'pause': 'Pause', 'space': 'Space',
	'backspace': 'Backspace', 'back': 'Backspace',
	'escape': 'Escape', 'esc': 'Escape',
	'insert': 'Insert', 'ins': 'Insert',
	'delete': 'Delete', 'del': 'Delete',
	'home': 'Home', 'end': 'End',
	'pageup': 'PageUp', 'pgup': 'PageUp',
	'pagedown': 'PageDown', 'pgdown': 'PageDown',
	'pagedn': 'PageDown', 'pgdn': 'PageDown',
	'contextmenu': 'ContextMenu', 'menu': 'ContextMenu', 'ctxmenu': 'ContextMenu',
}
const trueKeyMap = {
	'a': 'A', 'b': 'B', 'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G',
	'h': 'H', 'i': 'I', 'j': 'J', 'k': 'K', 'l': 'L', 'm': 'M', 'n': 'N',
	'o': 'O', 'p': 'P', 'q': 'Q',           'r': 'R', 's': 'S', 't': 'T',
	'u': 'U', 'v': 'V', 'w': 'W',           'x': 'X', 'y': 'Y', 'z': 'Z',
	
	'keya': 'A', 'keyb': 'B', 'keyc': 'C', 'keyd': 'D', 'keye': 'E', 'keyf': 'F', 'keyg': 'G',
	'keyh': 'H', 'keyi': 'I', 'keyj': 'J', 'keyk': 'K', 'keyl': 'L', 'keym': 'M', 'keyn': 'N',
	'keyo': 'O', 'keyp': 'P', 'keyq': 'Q',              'keyr': 'R', 'keys': 'S', 'keyt': 'T',
	'keyu': 'U', 'keyv': 'V', 'keyw': 'W',              'keyx': 'X', 'keyy': 'Y', 'keyz': 'Z',

	'key-a': 'A', 'key-b': 'B', 'key-c': 'C', 'key-d': 'D', 'key-e': 'E', 'key-f': 'F', 'key-g': 'G',
	'key-h': 'H', 'key-i': 'I', 'key-j': 'J', 'key-k': 'K', 'key-l': 'L', 'key-m': 'M', 'key-n': 'N',
	'key-o': 'O', 'key-p': 'P', 'key-q': 'Q',               'key-r': 'R', 'key-s': 'S', 'key-t': 'T',
	'key-u': 'U', 'key-v': 'V', 'key-w': 'W',               'key-x': 'X', 'key-y': 'Y', 'key-z': 'Z',


	'digit1':  'digit-1', 'dig1':  'digit-1', 'numpad1':  'numpad-1', 'num1':  'numpad-1',
	'digit2':  'digit-2', 'dig2':  'digit-2', 'numpad2':  'numpad-2', 'num2':  'numpad-2',
	'digit3':  'digit-3', 'dig3':  'digit-3', 'numpad3':  'numpad-3', 'num3':  'numpad-3',
	'digit4':  'digit-4', 'dig4':  'digit-4', 'numpad4':  'numpad-4', 'num4':  'numpad-4',
	'digit5':  'digit-5', 'dig5':  'digit-5', 'numpad5':  'numpad-5', 'num5':  'numpad-5',
	'digit6':  'digit-6', 'dig6':  'digit-6', 'numpad6':  'numpad-6', 'num6':  'numpad-6',
	'digit7':  'digit-7', 'dig7':  'digit-7', 'numpad7':  'numpad-7', 'num7':  'numpad-7',
	'digit8':  'digit-8', 'dig8':  'digit-8', 'numpad8':  'numpad-8', 'num8':  'numpad-8',
	'digit9':  'digit-9', 'dig9':  'digit-9', 'numpad9':  'numpad-9', 'num9':  'numpad-9',
	'digit0':  'digit-0', 'dig0':  'digit-0', 'numpad0':  'numpad-0', 'num0':  'numpad-0',

	'digit-1': 'digit-1', 'dig-1': 'digit-1', 'numpad-1': 'numpad-1', 'num-1': 'numpad-1',
	'digit-2': 'digit-2', 'dig-2': 'digit-2', 'numpad-2': 'numpad-2', 'num-2': 'numpad-2',
	'digit-3': 'digit-3', 'dig-3': 'digit-3', 'numpad-3': 'numpad-3', 'num-3': 'numpad-3',
	'digit-4': 'digit-4', 'dig-4': 'digit-4', 'numpad-4': 'numpad-4', 'num-4': 'numpad-4',
	'digit-5': 'digit-5', 'dig-5': 'digit-5', 'numpad-5': 'numpad-5', 'num-5': 'numpad-5',
	'digit-6': 'digit-6', 'dig-6': 'digit-6', 'numpad-6': 'numpad-6', 'num-6': 'numpad-6',
	'digit-7': 'digit-7', 'dig-7': 'digit-7', 'numpad-7': 'numpad-7', 'num-7': 'numpad-7',
	'digit-8': 'digit-8', 'dig-8': 'digit-8', 'numpad-8': 'numpad-8', 'num-8': 'numpad-8',
	'digit-9': 'digit-9', 'dig-9': 'digit-9', 'numpad-9': 'numpad-9', 'num-9': 'numpad-9',
	'digit-0': 'digit-0', 'dig-0': 'digit-0', 'numpad-0': 'numpad-0', 'num-0': 'numpad-0',
	'numpaddivide':  'numpad-div', 'numpaddiv':  'numpad-div', 'numdivide':  'numpad-div', 'numdiv':  'numpad-div',
	'numpad-divide': 'numpad-div', 'numpad-div': 'numpad-div', 'num-divide': 'numpad-div', 'num-div': 'numpad-div',

	'numpadmultiply':  'numpad-mult', 'numpadmult':  'numpad-mult', 'nummultiply':  'numpad-mult', 'nummult':  'numpad-mult',
	'numpad-multiply': 'numpad-mult', 'numpad-mult': 'numpad-mult', 'num-multiply': 'numpad-mult', 'num-mult': 'numpad-mult',

	'numpadsubtract':  'numpad-sub', 'numpadsub':  'numpad-sub', 'numsubtract':  'numpad-sub', 'numsub':  'numpad-sub',
	'numpad-subtract': 'numpad-sub', 'numpad-sub': 'numpad-sub', 'num-subtract': 'numpad-sub', 'num-sub': 'numpad-sub',
	
	'numpadadd':  'numpad-add', 'numadd':  'numpad-add', 'numpad-add': 'numpad-add', 'num-add': 'numpad-add',
}
const fnKey = ['f1','f2','f3','f4','f5','f6','f7','f8','f9','f10','f11','f12'];
const charKey = [
	'~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+',
	'`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=',
	'{', '}',      '<', '>',      ':',      '"',      '?',      '|',
	'[', ']',      ',', '.',      ';',      "'",      '/',      '\\',
];
const attachkeyMap = {
	'shift': 'Shift',
	'ctrl': 'Ctrl',
	'control': 'Ctrl',
	'alt': 'Alt',
	'meta': 'Meta',
}
function getBaseKey(key) {
	if (charKey.includes(key)) { return key; }
	key = key.toLowerCase();
	if (fnKey.includes(key)) { return key; }
	if (key in nameKeyMap) { return nameKeyMap[key]; }
	if (key in trueKeyMap) { return trueKeyMap[key]; }
}
function getKey(key) {
	const keys = key.replace(/\s+/,'').split(/\s*\+\s*/g);
	if (keys.length > 1 && !keys[keys.length - 1] && !keys[keys.length - 2]) { keys.pop();keys.pop();keys.push('+'); }
	let baseKey = getBaseKey(keys.pop());
	if (!baseKey) { return ''; }
	const akey = new Set(keys.map(key => key.toLowerCase()).map(key => key in attachkeyMap && attachkeyMap[key]).filter(Boolean));
	if (akey.size === 0 && !fnKey.includes(baseKey)) { return ''; }
	
	const keyList = [];
	if (akey.has('Shift')) { keyList.push('Shift'); }
	if (akey.has('Ctrl')) { keyList.push('Ctrl'); }
	if (akey.has('Alt')) { keyList.push('Alt'); }
	if (akey.has('Meta')) { keyList.push('Meta'); }
	keyList.push(baseKey);
	return keyList.join('+');

}
let keyCommand = Object.create(null);
export function clear() {
	keyCommand = Object.create(null);
}
export function set(key, cmd) {
	if (!cmd) { return false; }
	key = getKey(key);
	if (!key) { return false; }
	keyCommand[key] = String(cmd);
	return true;
}
export function remove(key) {
	key = getKey(key);
	if (!key) { return false; }
	delete keyCommand[key];
	return true;
}
export function get(e) {
	if (!e) { return ''; }
	if (typeof e === 'string') {
		const key = getKey(e);
		return key in keyCommand ? keyCommand[key] : '';
	}
	let {key, code, metaKey, ctrlKey, shiftKey, altKey} = e;

	const keyList = [];
	if (ctrlKey) { keyList.push('Ctrl'); }
	if (altKey) { keyList.push('Alt'); }
	if (metaKey) { keyList.push('Meta'); }

	// 字符形快捷键
	if (charKey.includes(key) && keyList.length) {
		keyList.push(key);
		const keystr = keyList.join('+');
		if (keystr in keyCommand) { return keyCommand[keystr]; }
		keyList.pop();
	}

	// 字符按键
	if (code.toLowerCase() in trueKeyMap && !keyList.length) { return ''; }
	key = getBaseKey(code);
	if (!key) { return ''; }
	if (shiftKey) { keyList.unshift('Shift'); }
	if (!keyList.length) { return ''; }
	keyList.push(key);
	const keystr = keyList.join('+');
	return keystr in keyCommand ? keyCommand[keystr] : '';
}
