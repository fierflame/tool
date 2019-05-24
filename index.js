import list from './list.js';
export const path = import.meta.url.replace(/^([^#?]*\/)(?:[^/#?]*)(?:[#?].*)?$/i, '$1');
let isIndex = false;
// 工具Id，如果为空，怎表示不是工具页面
let toolId = location.href.replace(/^([^#?]*)(?:[#?].*)?$/, '$1');
if (toolId.indexOf(path) === 0) {
	toolId = toolId.substr(path.length);
	isIndex = !toolId || toolId === 'index' || toolId === 'index.html';
	if (!toolId) {
		toolId = 'index';
	} else if (/^([a-z0-9]+)(?:\/(?:index(?:\.html)?)?)?$/.test(toolId)) {
		toolId = /^([a-z0-9]+)(?:\/(?:index(?:\.html)?)?)?$/.exec(toolId)[1]
	} else {
		toolId = '';
	}
} else {
	toolId = '';
}
const isTool = toolId === 'xutool';
const isPWA = toolId === 'pwa';

(document.querySelector('link[rel=manifest]') || {}).href = path + 'manifest.json';
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register(path + 'service-worker.js')
}
/**
 * 跳转的指定工具
 * @param {string} id 工具Id
 * @param {string} title 工具名称
 * @param {soolean} replace 是否替换当前历史记录
 */
function gotoTool(id, title, replace = false) {
	if (!id) { id = 'index'; }
	showComponent(id, title);
	const toolUrl = path + (id === 'index' ? '' : id + '/')
	if (replace) {
		history.replaceState({id, title}, title, toolUrl);
	} else {
		history.pushState({id, title}, title, toolUrl);
	}
}

window.addEventListener('popstate', ({state}) => state && state.id && showComponent(state.id, state.title));



const componentPromise = Object.create(null);
const componentMap = new Map();
const components = Object.create(null);
export async function loadComponent(path) {
	if (!path) { path = 'index'; }
	if (path[path.length] === '/') { path += 'index'; }
	if (path !== 'index' && /^[a-z0-9]+$/.test(path)) { path = path + '/index'; }
	if (path.substr(path.length - 3) === '.js') { path = path.substr(0, path.length - 3); }
	if (path in componentPromise) { return componentPromise[path]; }
	return componentPromise[path] = import(`./${path}.js`).then(({default: def}) => def);
}
function getName(name = '') {
	name = /^[a-z0-9\-]+$/.test(name) ? `xutool-${name}` : /^xutool-[a-z0-9]+$/.test(name) ? name : '';
	while(components[name] || !name) {
		name = `xutool-component-r${Math.floor(Math.random() * 100000000)}`
	};
	return name;
}
export function registerComponent(component, name) {
	if (componentMap.has(component)) { return componentMap.get(component); }
	name = getName(name);
	components[name] = component;
	componentMap.set(component, name);
	customElements.define(name, component);
	return name;
}
export async function createComponent(path) {
	const component = await loadComponent(path);
	return registerComponent(component, path);
}
export function showComponent(id, title) {
	createComponent(id);
	const main = document.getElementById('main');
	document.getElementById('title').innerText = title || '开发者工具';
	const components = Array.from(document.getElementsByClassName('main'));
	const component = document.createElement(`xutool-${id}`);
	component.innerHTML = `<div class="loadding-box"><div class="loadding"></div><p>如果长时间未完成加载</p><p>可能是浏览器版本太低</p><p>请升级浏览器后再试</p></div>`
	component.className = 'main';
	main.insertBefore(component, components[0])
	for (let component of components) {
		main.removeChild(component);
	}
}

export default class Index extends HTMLElement {
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
				a { display:block; text-decoration: none; margin: 2px; border: 1px #999 solid; padding: 5px; border-radius: 5px; line-height: 1.5; }
				a:hover { background: #DDD; }
				a * { margin: 0; padding: 0; overflow: hidden; text-overflow: ellipsis; white-space:nowrap; }
				h2 { color:cornflowerblue; font-size: 16px; }
				p { color: #999; font-size: 12px; }
			</style>
			<ul id="home-index">
				${list.map(({id, title, explain}) => `<li><a href="${path}${id}/" title="${title}" id="${id}"><h2>${title}</h2><p>${explain}</p></a></li>`).join('')}
			</ul>`
		Array.from(shadow.querySelectorAll('a')).forEach(a => {
			const {id, title} = a;
			a.addEventListener('click', event => {
				gotoTool(id, title);
				event.preventDefault();
				event.stopPropagation();	
			});
		})
	}
}

window.addEventListener('load', x => {
	if (!toolId) { return; }
	for (let it of Array.from(document.querySelectorAll('[data-xu-tool-id]'))) {
		it.addEventListener('click', function(event) {
			const id = this.dataset.xuToolId, title = this.title;
			gotoTool(id, title)
			event.preventDefault();
			event.stopPropagation();	
		});
	}
	if (isTool) {
		const id = location.search.substr(1);
		if (!id || id === 'index' || parent === this) {
			location = `./${id === 'index' ? '' : id}`;
		}
		showComponent(id);
	} else if (!isIndex) {
		const id = isPWA ? location.search.substr(1) : toolId;
		const it = list.find(v => v.id === id);
		if (it) {
			gotoTool(id, it.title, true);
		} else {
			gotoTool('index', '', true);
		}
	} else {
		gotoTool(toolId, document.getElementById('title').innerText, true);
	}

	if (!isPWA && !isTool) {
		const bar = document.getElementById('tool-bar');
		if (bar) {
			const fullscreenBtn = bar.appendChild(document.createElement('a'));
			fullscreenBtn.className = "fullscreen btn";
			fullscreenBtn.href = "#main";
			fullscreenBtn.innerText = '全屏';
			fullscreenBtn.addEventListener('click', event => {
				const fullscreenElement =
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
				const main = document.getElementById('main');
				if (!main) { return; }
				if (main.requestFullscreen) {
					main.requestFullscreen();
				} else if (main.mozRequestFullScreen) {
					main.mozRequestFullScreen();
				} else if (element.webkitRequestFullScreen) {
					main.webkitRequestFullScreen();
				}
			})
		}
	}

});
