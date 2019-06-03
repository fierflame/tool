import list from './list.js';
import { get as getKey, set as setKey, } from './util/key.js';
import { load as loadComponent, register as registerComponent, create as createComponent, } from './util/compenent.js';
import {getStyleText as getThemeStyleText, getVar as getThemeStyle} from './util/theme.js';
import SelectList, {Item as SelectListItem} from './component/select-list.js';
export { loadComponent, registerComponent, createComponent, };
export { getThemeStyleText };
const selectListTagName = registerComponent(SelectList);
const selectListItemTagName = registerComponent(SelectListItem);

/**
 * 系统相关配置
 * @var path 系统的路径
 * @var toolId 工具Id
 * @var isTool 是否为嵌入式工具页面
 * @var isPWA 是否为 PWA 页面
 */
export const path = import.meta.url.replace(/^([^#?]*\/)(?:[^/#?]*)(?:[#?].*)?$/i, '$1');
// 工具Id，如果为空，怎表示不是工具页面
let toolId = location.href.replace(/^([^#?]*)(?:[#?].*)?$/, '$1');
if (toolId.indexOf(path) === 0) {
	toolId = toolId.substr(path.length);
	if (!toolId) {
		toolId = 'index';
	} else if (/^([a-z0-9\-]+)(?:\/(?:index(?:\.html)?)?)?$/.test(toolId)) {
		toolId = /^([a-z0-9\-]+)(?:\/(?:index(?:\.html)?)?)?$/.exec(toolId)[1]
	} else {
		toolId = '';
	}
} else {
	toolId = '';
}
const isTool = toolId === 'xutool';
const isPWA = toolId === 'pwa';

/** 更新 Manifest 文件地址为绝对地址 */
(document.querySelector('link[rel=manifest]') || {}).href = path + 'manifest.json';
/** 启动服务进程 */
if ('serviceWorker' in navigator) { navigator.serviceWorker.register(path + 'service-worker.js'); }

/**
 * 页面路由
 */
function showComponent(id, title) {
	createComponent(id);
	const main = document.getElementById('main');
	const titleDiv = document.getElementById('title');
	if (titleDiv) { titleDiv.innerText = title || '开发者工具'; }
	const components = Array.from(document.getElementsByClassName('main'));
	const component = document.createElement(`xutool-${id}`);
	component.innerHTML = `<div class="loadding-box"><div class="loadding"></div><p>如果长时间未完成加载</p><p>可能是浏览器版本太低</p><p>请升级浏览器后再试</p></div>`
	component.className = 'main';
	main.insertBefore(component, components[0]);
	components.forEach(c => main.removeChild(c));
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



/**
 * 主题切换管理函数
 */

export function generateThemeStyle(selector = '', type = '', posterity = '') {
	selector = selector.replace(/\s+$/, '');
	return `${selector} ${posterity} { ${getThemeStyleText(type)} }
	${selector}:hover ${posterity} { ${getThemeStyleText(type, 'hover')} }
	${selector}:focus ${posterity} { ${getThemeStyleText(type, 'focus')} }`
}
/**
 * 主题相关
 * @var themeInfoList 主题信息列表
 * @var themes 系统主题
 * @var customThemes 自定义主题
 * @var themeList 主题列表
 */
const themeInfoList = {
	'default': {title: '默认', extends: [], value: { textColor: '#000', borderColor: '#999', backgroundColor: '#FFF', }},
	'title': {title: '默认标题', extends: ['default'], value: { textColor: '#69E', }},
	'explain': {title: '默认说明', extends: ['default'], value: { textColor: '#999', }},
	'button': {title: '按钮', extends: ['default'], valueExtends: { borderColor: 'default', }, value: { textColor: '#00F', backgroundColorHover: '#DDD', }},
	'input': {title: '输入框', extends: ['default'], valueExtends: { textColor: 'default', borderColor: 'default', backgroundColorHover: 'default',}, value: { }},
	'mask': {title: '遮罩层', extends: [], value: { textColor: '#DDD', borderColor: 'rgba(0,0,0, 0.5)', backgroundColor: 'rgba(0,0,0, 0.5)', }},
	'item': {title: '项目', extends: ['default'], valueExtends: { borderColor: 'default', }, value: { backgroundColorHover: '#DDD', }},
	'itemTitle': {title: '项目标题', extends: ['item', 'title', 'default'], valueExtends:{ textColor: 'title', }, value: { borderColor: 'inherit', backgroundColor: 'inherit', }},
	'itemExplain': {title: '项目说明', extends: ['item', 'explain', 'default'], valueExtends:{ textColor: 'explain', }, value: { borderColor: 'inherit', backgroundColor: 'inherit', }},
};

const themes = {
	bright: {},
	dark: {
		textColor: '#CCC',
		borderColor: '#999',
		backgroundColor: '#222',
		titleTextColor: '#69E',
		explainTextColor: '#999',

		buttonTextColor: '#99F',
		buttonBackgroundColorHover: '#444',
		itemBackgroundColorHover: '#444',
	}
}
const customThemes = JSON.parse(localStorage.getItem('xutools-theme-custom')) || {};

export function setStyle(theme, element = document.getElementsByTagName('html')[0]){
	const list = getThemeStyle(themeInfoList, theme);
	for (let k in list) {
		element.style.setProperty(k, list[k]);
	}
}
let currentTheme = localStorage.getItem('xutools-theme') || 'bright';
export function switchTheme(theme, temp = false) {
	if(!temp) {
		currentTheme = theme;
		localStorage.setItem('xutools-theme', theme);
	}
	if (!theme) {
		theme = customThemes.custom;
	} else if (theme in themes) {
		theme = themes[theme];
	} else {
		theme = {};
	}
	setStyle(theme);
}
export const themeList = Object.keys(themes);
switchTheme(currentTheme);

/**
 * 首页组件
 */
export default class Index extends HTMLElement {
	constructor() {
		super();
		let shadow = this.attachShadow({mode:'open'});
		this._shadow = shadow;
		shadow.innerHTML = `
			<style>
				ul{ list-style: none; margin: 0; padding: 0; overflow: auto; }
				ul * { margin: 0; padding: 0; overflow: hidden; text-overflow: ellipsis; white-space:nowrap; }
				@media (min-width:500px) { li { width: 50%; float: left; } }
				@media (min-width:750px) { li { width: 33.3333%; } }
				@media (min-width:1000px) { li { width: 25%; } }
				@media (min-width:1250px) { li { width: 20%; } }
				a { text-decoration: none; margin: 2px; display: block; border: 1px solid; padding: 5px; border-radius: 5px; line-height: 1.5; }
				h2 { color:cornflowerblue; font-size: 16px; }
				p { color: var(--theme-border-color-default); font-size: 12px; }
				${generateThemeStyle('a', 'item')}
				${generateThemeStyle('a', 'itemTitle', 'h2')}
				${generateThemeStyle('a', 'itemExplain', 'p')}
			</style>
			<ul id="home-index">
				${list.map(({id, name, description}) => `<li><a href="${path}${id}/" title="${name}" id="${id}"><h2>${name}</h2><p>${description}</p></a></li>`).join('')}
			</ul>`
		Array.from(shadow.querySelectorAll('a')).forEach(a => {
			const {id, name} = a;
			a.addEventListener('click', event => {
				gotoTool(id, name);
				event.preventDefault();
				event.stopPropagation();	
			});
		})
	}
}


function createMask() {
	const mask = document.getElementById('main').appendChild(document.createElement('div'));
	mask.className = 'mask';
	mask.addEventListener('click', event => {
		if (event.path[0] === mask) {
			mask.style.display = '';
		}
	})
	return mask;
}
const selectLists = [];
function creatSelectList(open, placeholder) {
	if (typeof open === 'string' || placeholder === 'function') {
		[open, placeholder] = [placeholder, open];
	}
	const selectList = document.createElement(selectListTagName);
	selectList.className = 'select-list';
	selectList.placeholder = typeof placeholder === 'string'  && placeholder || '';
	selectList.open = function() {
		selectLists.forEach(it => it.remove() );
		document.getElementById('main').appendChild(selectList);
		setTimeout(x => selectList.focus(), 0);
		if (typeof open === 'function') { open(selectList); }
	};
	selectList.close = function() { this.remove(); };
	selectList.addEventListener('cancel', x => selectList.close());
	selectList.addEventListener('change', x => selectList.close());
	selectLists.push(selectList);
	return selectList;
}
function createtoolButton(text) {
	const btn = document.getElementById('tool-bar').appendChild(document.createElement('a'));
	btn.className = "btn";
	btn.href = '#main';
	btn.innerText = text;
	return btn;
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
	} else {
		const id = isPWA ? location.search.substr(1) : toolId;
		const it = list.find(v => v.id === id);
		if (it) {
			gotoTool(id, it.title, true);
		} else {
			gotoTool('index', '', true);
		}
	}

	const toolBar = document.getElementById('tool-bar');
	if (!toolBar) { return; }
	const cmdSelectList = creatSelectList('选择主题(按上下箭头键预览)');
	setKey('Shift + Ctrl + P', 'panel');
	document.addEventListener('keydown', event => {
		const cmd = getKey(event);
		if (!cmd) { return; }
		const evt = new Event('keycmd', {composed: true, bubbles: true, cancelable: true});
		evt.cmd = cmd;
		evt.repeat = event.repeat;
		if (event.path[0].dispatchEvent(evt)) { return; }
		event.preventDefault();
		event.stopPropagation();
	}, true);
	document.addEventListener('keycmd', ({cmd, repeat}) => {
		if (cmd === 'panel') {
			cmdSelectList.open();
			event.preventDefault();
			event.stopPropagation();
		}
	}, true);

	if (!isTool) {
		let showThemeSelect = false;
		const themeSelectList = creatSelectList('选择主题(按上下箭头键预览)',x => {
			themeSelectList.value = '';
			showThemeSelect = true;
			Array.from(themeSelectList.children).filter(it => it.title === currentTheme).forEach(it => it.focus());
		});
		themeList.forEach(theme => {
			const item = document.createElement(selectListItemTagName);
			item.title = theme;
			item.addEventListener('focus', x => showThemeSelect && switchTheme(theme, true))
			item.addEventListener('blur', x => showThemeSelect && switchTheme(currentTheme))
			item.addEventListener('select', x => showThemeSelect && switchTheme(theme))
			themeSelectList.appendChild(item);
		})
		themeSelectList.addEventListener('cancel', x => showThemeSelect = false )
		themeSelectList.addEventListener('change', x => showThemeSelect = false )
		themeSelectList.addEventListener('cancel', x => showThemeSelect && switchTheme(currentTheme) )
		createtoolButton('主题').addEventListener('click', event => themeSelectList.open());
		const cmdItem = document.createElement(selectListItemTagName);
		cmdItem.title = '首选项: 颜色皮肤';
		cmdItem.addEventListener('click', x => themeSelectList.open());
		cmdSelectList.appendChild(cmdItem);
	}

	if (!isPWA && !isTool) {
		createtoolButton('全屏').addEventListener('click', event => {
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
			} else if (main.webkitRequestFullScreen) {
				main.webkitRequestFullScreen();
			}

		})
	}
});
