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
			li { display: none; cursor: pointer; }
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
				this.dispatchEvent(new Event('cancel'));
			} else {
				return;
			}
			event.preventDefault();
			event.stopPropagation();
		});
		this._re = /.?/i;
		input.addEventListener('input', event => this.input());
		input.addEventListener('input', event => this.dispatchEvent(new Event('input')));
		this._mutationObserver = new MutationObserver(list => {
			const ul = this.shadowRoot.querySelector('ul');
			for (let {addedNodes, nextSibling, removedNodes} of list) {
				let nextli;
				if (nextSibling) { nextli = nextSibling._li; }
				for (let item of addedNodes) {
					const li = item._li;
					if (nextli) {
						ul.insertBefore(li, nextli);
					} else {
						ul.appendChild(li);
					}
					this._updateShow(li);
					if (this.shadowRoot.querySelectorAll('li.selected').length > 2) {
						li.classList.remove('selected');
					}
				}
				for (let item of removedNodes) {
					item._li.remove();
				}
			}
			this._updateSelect();
			this.dispatchEvent(new Event('update'));
		})
		this._mutationObserver.observe(this, {childList: true})
	}
	get placeholder() { return this.getAttribute('placeholder'); }
	set placeholder(placeholder) { return this.setAttribute('placeholder', placeholder); }
	get value() {
		return this._input.value;
	}
	set value(newValue) {
		const input = this._input;
		newValue = String(newValue);
		if (newValue === input.value) { return; }
		input.value = newValue;
		this._input();
	}
	_enter() {
		const item = this.shadowRoot.querySelector('li.selected')._SLItem;
		if (!item) { return false; }
		item.dispatchEvent(new Event('select'));
		item.dispatchEvent(new Event('click'));
		this.dispatchEvent(new Event('change'));
		return true;
	}
	_blur(li) {
		li = li || this.shadowRoot.querySelector('li.selected');
		if (!li) { return false; }
		if(!li.classList.contains('selected')) { return false; }
		li.classList.remove('selected');
		const item = li._SLItem;
		if (!item) { return false; }
		item.dispatchEvent(new Event('blur'));
		return true;
	}
	_focus(li) {
		if (!li) { return false; }
		if (li.classList.contains('selected')) { return this.show(li); }
		const item = li._SLItem;
		if (!item) { return false; }
		this._blur();
		li.classList.add('selected');
		this.show(li);
		item.dispatchEvent(new Event('focus'));
		return true;
	}
	focus() { this._input.focus(); }
	show(li) {
		if (li instanceof Item) { return this._focus(li._li); }
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
	_updateShow(li) {
		if (!li.hidden && this._re.test(li.innerText.replace(/\s+/g, ' '))) {
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
	static get observedAttributes() { return ['title', 'explain', 'hidden']; }
	constructor() {
		super();
		const li = document.createElement('li');
		const titleEle = document.createElement('h2');
		li.appendChild(titleEle);
		const explainEle = document.createElement('p');
		this._title = titleEle;
		this._explain = explainEle;
		this._li = li;
		li.addEventListener('mouseenter', x => this.focus());
		li.addEventListener('click', x => this.click());
		li._SLItem = this;
	}
	click() {
		const parent = this.parentNode;
		if (!(parent instanceof SelectList)) { return; }
		parent._enter();
	}
	focus() {
		const parent = this.parentNode;
		if (!(parent instanceof SelectList)) { return false; }
		return parent.show(this);
	}
	get title() { return this.getAttribute('title') || ''; }
	set title(title) { this.setAttribute('title', title || ''); }
	get explain() { return this.getAttribute('explain') || ''; }
	set explain(explain) { this.setAttribute('explain', explain || ''); }
	get hidden() { return this._li.hidden; }
	set hidden(hidden) {
		this._li.hidden = hidden;
		hidden = this._li.getAttribute('hidden');
		if (hidden === null) {
			this.removeAttribute('hidden');
		} else {
			this.setAttribute('hidden', hidden);
		}
	}
	attributeChangedCallback(attrName, oldVal, newVal, ...p){
		if (oldVal === newVal) { return; }
		switch(attrName) {
			case 'title': {
				this._title.innerText = newVal || '';
				break;
			}
			case 'explain': {
				this._explain.innerText = newVal || '';
				if (newVal) {
					this._li.appendChild(this._explain);
				} else {
					this._explain.remove();
				}
				break;
			}
			case 'hidden': {
				if (newVal === null) {
					this._li.removeAttribute('hidden');
				} else {
					this._li.setAttribute('hidden', newVal);
				}
				break;
			}
		}
		const parent = this.parentNode;
		if (!(parent instanceof SelectList)) { return; }
		const li = this._li;
		parent._updateShow(li);
		parent._updateSelect(li);
	}
}