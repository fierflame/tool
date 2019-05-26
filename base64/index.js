import {generateThemeStyle} from '../index.js';
import * as base64 from '../util/base64.js'

export default class Base64 extends HTMLElement {
	constructor() {
		super();
		let shadow = this.attachShadow({mode:'open'});
		this._shadow = shadow;
		shadow.innerHTML = `
<style>
	:host { display: flex; flex-direction: column; position: relative; }
	div { display: flex; }
	textarea { flex: 1; border: 1px #999 solid; resize: none; border: 1px solid; }
	button { flex: 1; height: 40px; border: 1px solid; }
	${generateThemeStyle(':host')}
	${generateThemeStyle('button', 'button')}
	${generateThemeStyle('textarea', 'input')}
</style>
<textarea id="source" placeholder="要进行编码的文本..."></textarea>
<div class="main">
	<button id="encode">↓↓编码↓↓</button>
	<button id="decode">↑↑解码↑↑</button>
</div>
<textarea id="encoded" placeholder="要进行解码的 Base64 码..."></textarea>
`
		const sourceText = shadow.getElementById('source');
		const encodedText = shadow.getElementById('encoded');
		shadow.getElementById('encode').addEventListener('click', _ => this.encode());
		shadow.getElementById('decode').addEventListener('click', _ => this.decode());
		
		this._sourceText = sourceText;
		this._encodedText = encodedText;
	}
	encode() {
		this._encodedText.value = base64.encode(this._sourceText.value);
	}
	decode() {
		this._sourceText.value = base64.decode(this._encodedText.value);
	}
}