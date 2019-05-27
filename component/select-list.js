import {getThemeStyleText} from '../index.js';
export default class SelectList extends HTMLElement {
	static get observedAttributes() { return ['placeholder']; }
	constructor() {
		super();
		let shadow = this.attachShadow({mode:'open'});
		shadow.innerHTML = `
		<style>
			:host { border: 1px solid; }
			input { box-sizing: border-box; border: none; border-bottom: 1px solid; height: 30px; margin: 0; padding: 0 5px; outline: none; width: 100%; }
			ul { position: relative; max-height: 320px; overflow: auto; margin: 0; padding: 0; }
			li { display: none; }
			.show { display: block; }
			.selected { background: #DDD; }
			li * { height: 20px; line-height: 16px; margin: 0; padding: 0; overflow: hidden; white-space:nowrap; text-overflow: ellipsis; }
			h2 { font-size: 12px; padding-top: 4px;}
			p { font-size: 10px; padding-bottom: 4px; }
			li{ ${getThemeStyleText('item')} }
			li h2{ ${getThemeStyleText('itemTitle')} }
			li p{ ${getThemeStyleText('itemExplain')} }
			li.selected{ ${getThemeStyleText('item', 'hover')} }
			li.selected h2{ ${getThemeStyleText('itemTitle', 'hover')} }
			li.selected p{ ${getThemeStyleText('itemExplain', 'hover')} }
			input{ ${getThemeStyleText('input')} }
			input:focus{ ${getThemeStyleText('input', 'focus')} }
			:host{ ${getThemeStyleText()} }
		</style>
		<input type="search" placeholder="输入内容进行过滤" />
		<ul></ul>`
		const input = shadow.querySelector('input');
		this._input = input;
		input.addEventListener('keydown', event => {
			if (event.key === 'ArrowDown') {
				this.next();
			} else if (event.key === 'ArrowUp') {
				this.next(true);
			} else if (event.key === 'Enter') {
				this._enter();
			} else if (event.key === 'Escape') {
				this.dispatchEvent(new Event('exit'));
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
		});
		this._re = /.?/i;
		input.addEventListener('input', event => this.input());
		this._mutationObserver = new MutationObserver(t => this.update(t))
		this._item2liMap = new Map();
		this._li2itemMap = new Map();
		this.update();
		this._mutationObserver.observe(this, {childList: true})
	}
	get placeholder() {
		return this.getAttribute('placeholder');
	}
	set placeholder(placeholder) {
		return this.setAttribute('placeholder', placeholder);
	}
	get value() {
		return this._input.value;
	}
	set value(newValue) {
		const input = this._input;
		newValue = String(newValue);
		if (newValue === input.value) { return; }
		input.value = newValue;
		this.input();
	}
	get index() {
		let selected = this.shadowRoot.querySelector('li.selected');
		if (!selected) { return -1; }
		return Number(selected.dataset.id);
	}
	set index(index) {
		let list = Array.from(this.shadowRoot.querySelectorAll('li'));
		if (!list.length) { return; }
		index = parseInt(index) || 0;
		if (index < 0) { index = 0; }
		if (index >= list.length) { index = list.length - 1; }
		let item = list[index];
		if (item.classList.contains('show')) {
			this._focus(item);
			return;
		}
		this._blur();
		item = this.shadowRoot.querySelector(`li:nth-child(${index}) ~ li.show`);
		if (!item) { item = Array.from(this.shadowRoot.querySelectorAll('li.show')).pop(); }
		this._focus(item);
	}
	_enter() {
		let selected = this.shadowRoot.querySelector('li.selected');
		if (!selected) { return false; }
		const item = this._li2itemMap.get(selected);
		if (item) { item.dispatchEvent(new Event('select')); }
		this.dispatchEvent(new Event('change'));
		return true;
	}
	_blur(li) {
		li = li || this.shadowRoot.querySelector('li.selected');
		if (!li) { return false; }
		if(!li.classList.contains('selected')) { return false; }
		li.classList.remove('selected');
		const item = this._li2itemMap.get(li);
		if (item) { item.dispatchEvent(new Event('blur')); }
		return true;
	}
	_focus(li) {
		if (!li) { return false; }
		if (li.classList.contains('selected')) { return this.show(li); }
		this._blur();
		li.classList.add('selected');
		this.show(li);
		const item = this._li2itemMap.get(li);
		if (item) { item.dispatchEvent(new Event('focus')); }
		return true;
	}
	focus() {
		super.focus();
		this._input.focus();
	}
	show(li) {
		if (li instanceof Item) {
			return this._focus(this._item2liMap.get(li));
		}
		if (!li) { return false; }
		const ul = this.shadowRoot.querySelector('ul');
		if (ul.scrollTop + ul.clientHeight < li.offsetTop + li.clientHeight) {
			ul.scrollTop = li.offsetTop + li.clientHeight - ul.clientHeight;
		}
		if (ul.scrollTop > li.offsetTop) {
			ul.scrollTop = li.offsetTop;
		}
		return true;
	}
	update(item) {
		if (item instanceof Item) {
			const li = this._item2liMap.get(li);
			if (!li) { return; }
			const { title, explain } = item;
			li.innerHTML = '';
			li.appendChild(document.createElement('h2')).innerText = title;
			if (explain) { li.appendChild(document.createElement('p')).innerText = explain; }
			this._updateShow(li);
			this._updateSelect(li);
			return;
		}
		const ul = this.shadowRoot.querySelector('ul');
		ul.innerHTML = '';
		const items = Array.from(this.children).filter(it => it instanceof Item);
		let item2liMap = this._item2liMap;
		let li2itemMap = this._li2itemMap;
		for (let [item, li] of [...item2liMap]) {
			if (items.includes(item)) { continue; }
			item2liMap.item2liMap(item);
			li2itemMap.item2liMap(li);
		}
		items.forEach(item => {
			let li = item2liMap.get(item);
			if (!li) {
				li = document.createElement('li');
				item2liMap.set(item, li);
				li2itemMap.set(li, item);
				li.addEventListener('mouseenter', x => this.set(li));
				li.addEventListener('click', x => this._enter(li));
				const { title, explain } = item;
				li.appendChild(document.createElement('h2')).innerText = title;
				if (explain) { li.appendChild(document.createElement('p')).innerText = explain; }
				this._updateShow(li);
			}
			ul.appendChild(li);
		})
		this._updateSelect();

		this.dispatchEvent(new Event('update'));
	}
	_updateShow(li) {
		if (this._re.test(li.innerText.replace(/\s+/g, ' '))) {
			li.classList.add('show');
		} else {
			li.classList.remove('show');
		}
	}
	_updateSelect(li) {
		if (li) {
			if (li.classList.contains('show')) { return; }
			if (!li.classList.contains('selected')) { return; }
			let item = this.shadowRoot.querySelector('li.selected ~ li.show') || Array.from(this.shadowRoot.querySelectorAll('li.show')).pop();;
			li.classList.remove('selected');
			if (item) { item.classList.add('selected'); }
			return;
		}
		let selected = this.shadowRoot.querySelector('li.selected');
		if (selected && selected.classList.contains('show')) { return this.show(selected); }
		let item = selected ? this.shadowRoot.querySelector('li.selected ~ li.show') : this.shadowRoot.querySelector('li.show');
		this._blur(selected);
		if (!item) { item = Array.from(this.shadowRoot.querySelectorAll('li.show')).pop(); }
		this._focus(item);
	}
	input() {
		const re = new RegExp (this._input.value.replace(/^\s+/g, '').replace(/\s+$/g, '').replace(/\s+/g, ' ').split('').map(x => x.replace(/([\^\$\(\)\{\}\[\]\.\\\/\?\*\+\|])/,'\\$1')).join('.*'), 'i');
		this._re = re;
		for (let li of Array.from(this.shadowRoot.querySelectorAll('li'))) {
			this._updateShow(li);
		}
		this._updateSelect();
	}
	set(li) {
		this._focus(li);
	}
	next(isUp) {
		if (!this.shadowRoot.querySelector('li.show')) { return; }
		const list = Array.from(this.shadowRoot.querySelectorAll('li.show, li.selected'));
		if (isUp) { list.reverse(); }
		let set = false;
		let item = list[0];
		for (let li of list) {
			if (set) { item = li; break; }
			if (this._blur(li)) { set = true; }
		}
		this._focus(item);
	}
	attributeChangedCallback(attrName, oldVal, newVal, ...p){
		if (oldVal === newVal) { return; }
		switch(attrName) {
			case 'placeholder': {
				this._input.placeholder = newVal || '输入内容进行过滤(按上下箭头键选择，回车键确认)';
				return;
			}
		}
	}
}



export class Item extends HTMLElement {
	static get observedAttributes() { return ['title', 'explain']; }
	constructor() {
		super();
	}
	focus() {
		const parent = this.parentNode;
		if (!(parent instanceof SelectList)) { return false; }
		return parent.show(this);
	}
	get title() {
		return this.getAttribute('title');
	}
	set title(title) {
		return this.setAttribute('title', title);
	}
	get explain() {
		return this.getAttribute('explain');
	}
	set explain(explain) {
		return this.setAttribute('explain', explain);
	}
	attributeChangedCallback(attrName, oldVal, newVal, ...p){
		if (oldVal === newVal) { return; }
		const parent = this.parentNode;
		if (!(parent instanceof SelectList)) { return; }
		parent.update(this);
	}
}