import {getThemeStyleText} from '../index.js';
function createEvent(name, item, list) {
	const event = new Event(name);
	const index = Number(item.dataset.id);
	const value = list[index];
	event.index = index;
	event.value = value;
	return event;
}
export default class SelectList extends HTMLElement {
	static get observedAttributes() { return ['list', 'placeholder']; }
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
			console.log(event.key);
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
		input.addEventListener('input', event => this.input());
		this.update();
	}
	get placeholder() {
		return this.getAttribute('placeholder');
	}
	set placeholder(placeholder) {
		return this.setAttribute('placeholder', placeholder);
	}
	get list() {
		let list;
		try { list = JSON.parse(this.getAttribute('list')); } catch(e) {}
		return Array.isArray(list) ? list.filter(it => it && typeof it === 'object') : [];
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
		console.log(index);
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
	set list(list) {
		if (!Array.isArray(list)) { return ; }
		list = list.filter(it => it && typeof it === 'object').map(({title, explain}) =>({title: String(title), explain: explain && String(explain)}));
		this.setAttribute('list', JSON.stringify(list));
	}
	_enter() {
		let selected = this.shadowRoot.querySelector('li.selected');
		if (!selected) { return false; }
		this.dispatchEvent(createEvent('itemselect', selected, this.list));
		return true;
	}
	show(item) {
		if (!item) { return; }
		const ul = this.shadowRoot.querySelector('ul');
		if (ul.scrollTop + ul.clientHeight < item.offsetTop + item.clientHeight) {
			ul.scrollTop = item.offsetTop + item.clientHeight - ul.clientHeight;
		}
		if (ul.scrollTop > item.offsetTop) {
			ul.scrollTop = item.offsetTop;
		}
	}
	_blur(item) {
		item = item || this.shadowRoot.querySelector('li.selected');
		if (!item) { return false; }
		if(!item.classList.contains('selected')) { return false; }
		item.classList.remove('selected');
		this.dispatchEvent(createEvent('itemblur', item, this.list));
		return true;
	}
	_focus(item) {
		if (!item) { return false; }
		if (item === this.shadowRoot.querySelector('li.selected')) { this.show(item); return true; }
		this._blur();
		item.classList.add('selected');
		this.show(item);
		this.dispatchEvent(createEvent('itemfocus', item, this.list));
		return true;
	}
	focus() {
		this._input.focus();
	}
	update() {
		const list = this.list;
		const ul = this.shadowRoot.querySelector('ul');
		ul.innerHTML = '';
		list.forEach(({title, explain}, id) => {
			const li = ul.appendChild(document.createElement('li'));
			li.dataset.id = id;
			li.classList.add('show');
			li.appendChild(document.createElement('h2')).innerText = title;
			if (explain) { li.appendChild(document.createElement('p')).innerText = explain; }
			li.addEventListener('mouseenter', x => this.set(li));
			li.addEventListener('click', x => this._enter(li));
		});
		this.dispatchEvent(new Event('update'));
		this.input();
	}
	input() {
		const re = new RegExp (this._input.value.split('').map(x => x.replace(/([\^\$\(\)\{\}\[\]\.\\\/\?\*\+\|])/,'\\$1')).join('.*'), 'i');
		for (let li of Array.from(this.shadowRoot.querySelectorAll('li'))) {
			if (re.test(li.innerText.replace(/\s/g, ''))) {
				li.classList.add('show');
			} else {
				li.classList.remove('show');
			}
		}
		let selected = this.shadowRoot.querySelector('li.selected');
		if (selected && selected.classList.contains('show')) { return this.show(selected); }
		let item = selected ? this.shadowRoot.querySelector('li.selected ~ li.show') : this.shadowRoot.querySelector('li.show');
		this._blur(selected);
		if (!item) { item = Array.from(this.shadowRoot.querySelectorAll('li.show')).pop(); }
		this._focus(item);
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
			case 'list':{
				let list;
				try { list = JSON.parse(newVal); } catch(e) {}
				list = Array.isArray(list) ? list : [];
				list = list
					.filter(it => it && typeof it === 'object')
					.map(({title, explain}) =>({title: String(title), explain: explain && String(explain)}));
				const value = JSON.stringify(list);
				if (value !== newVal) {
					this.setAttribute('list', value);
				} else {
					this.update();
				}
				return;
			}
			case 'placeholder': {
				this._input.placeholder = newVal || '输入内容进行过滤(按上下箭头键选择，回车键确认)';
				return;
			}
		}
	}
}