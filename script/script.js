// 自动切换
function switchFullscreen(element) {
	var fullscreenElement =
		document.fullscreenElement
		|| document.mozFullscreenElement
		|| document.webkitFullscreenElement;
	if (fullscreenElement) {
		if (fullscreenElement.exitFullscreen) {
			fullscreenElement.exitFullscreen();
		} else if (fullscreenElement.mozCancelFullScreen) {
			fullscreenElement.mozCancelFullScreen();
		} else if (fullscreenElement.webkitCancelFullScreen) {
			fullscreenElement.webkitCancelFullScreen();
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
		return;
	}
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen();
	}
}
const loadComponent = (() => {
	let list = null;
	const components = Object.create(null);
	return async (id) => {
		if (id in components) {
			return components[id];
		}
		if (!id || id === 'index') {
			if (!list) { list = fetch('./component/index.json').then(res => res.json()); }
			return components[id] = list.then(list => class Index extends HTMLElement {
				constructor() {
					super();
					let shadow = this.attachShadow({mode:'open'});
					this._shadow = shadow;
					shadow.innerHTML = `
						<style>
							ul {list-style: none; margin: 0; padding: 0; overflow: auto; }
							@media (min-width:500px) { li { width: 50%; float: left; } }
							@media (min-width:750px) { li { width: 33.3333%; } }
							@media (min-width:1000px) { li { width: 25%; } }
							@media (min-width:1250px) { li { width: 20%; } }
							a { text-decoration: none; margin: 2px; display: block; border: 1px #999 solid; padding: 5px; border-radius: 5px; line-height: 1.5; }
							a:hover { background: #DDD; }
							a * { overflow: hidden; text-overflow: ellipsis; white-space:nowrap; }
							h2 { margin: 0; padding: 0; color:cornflowerblue; font-size: 16px; }
							p { color: #999; font-size: 12px; margin: 0; padding: 0; }
						</style>
						<ul id="home-index">
							${list.map(({id, title, explain}) => `<li><a href="./${id}.html#main" title="${title}" data-id="${id}"><h2>${title}</h2><p>${explain}</p></a></li>`)}
						</ul>`
					Array.from(shadow.querySelectorAll('a')).forEach(a => {
						const {dataset:{id}, href, title} = a;
						a.addEventListener('click', event => {
							showComponent(id, title);
							history.pushState({id, title}, title, href);
							event.preventDefault();
							event.stopPropagation();	
						});
					})
				}
			})
		}
		return components[id] = import(`../component/${id}.js`).then(({default: def}) => def)
	}
})();
const setComponent = (() => {
	const components = Object.create(null);
	return async (name, id = name) => {
		if (name in components) {
			return components[name];
		}
		return components[name] = loadComponent(id).then(component => customElements.define(`xutool-${name}`, component))
	}
})();
function showComponent(name, title) {
	setComponent(name);
	const main = document.getElementById('main');
	document.getElementById('title').innerText = title || '';
	const components = Array.from(document.getElementsByClassName('main'));
	const component = document.createElement(`xutool-${name}`);
	component.innerHTML = `<div class="loadding-box"><div class="loadding"></div><p>如果长时间未完成加载</p><p>可能是浏览器版本太低</p><p>请升级浏览器后再试</p></div>`
	component.className = 'main';
	main.insertBefore(component, components[0])
	for (let component of components) {
		main.removeChild(component);
	}
}
window.onload = x => {
	window.addEventListener('popstate', ({state}) => {
		if (state && state.id) {
			showComponent(state.id, state.title);
		}
	})
	const title = document.title.replace(/\s*\|.*$/, '');
	let id = location.pathname.replace(/\/([^/]*?)(?:\.html)$/, '$1');
	if (id === '/') { id = 'index'; }
	history.replaceState({id, title}, document.title);
	
	for (let a of Array.from(document.getElementById('main').getElementsByTagName('a'))) {
		if (a.target) { continue; }
		const href = a.getAttribute('href');
		if (href[0] == '#' || !href) { continue; }
		let id = '';
		if (/(?:\.\/)?([a-z0-9\-]+)(\.html)?(?:[?#].*)?$/.test(href)) {
			id = /(?:\.\/)?([a-z0-9]+)(?:\.html)?(?:[?#].*)?$/.exec(href)[1];
		} else if (href === './'){
			id = 'index';
		}
		if (id) {
			a.addEventListener('click', (((id, href, title) => event => {
				showComponent(id, title);
				history.pushState({id, title},title, href);
				event.preventDefault();
				event.stopPropagation();	
			})(id, href, a.title)));
		}
	}
}
