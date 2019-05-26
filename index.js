import list from './list.js';
import SelectList from './component/select-list.js';
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
 * 组件管理
 */
const componentPromise = Object.create(null);
const componentMap = new Map();
const components = Object.create(null);
export async function loadComponent(path) {
	if (!path) { path = 'index'; }
	if (path[path.length] === '/') { path += 'index'; }
	if (path !== 'index' && /^[a-z0-9\-]+$/.test(path)) { path = path + '/index'; }
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

const selectListTagName = registerComponent(SelectList);
/**
 * 主题切换管理函数
 */

export function getThemeStyleText(type = '', e = ''){
	if (type === 'default') { type = ''; }
	type = type.replace(/\-+/g, '').replace(/([A-Z])/g, '-$1').toLowerCase();
	if (type && type[0] !== '-') { type = '-' + type; }
	if (e) { e = '-' + e; }
	return `
	color: var(--themeused${type}-text-color${e})!important;
	border-color: var(--themeused${type}-border-color${e})!important;
	background-color: var(--themeused${type}-background-color${e})!important;
`
}
export function generateThemeStyle(selector = '', type = '', posterity = '') {
	selector = selector.replace(/\s+$/, '');
	if (type === 'default') { type = ''; }
	type = type.replace(/\-+/g, '').replace(/([A-Z])/g, '-$1').toLowerCase();
	if (type && type[0] !== '-') { type = '-' + type; }
	return `${selector} ${posterity} {
		color: var(--themeused${type}-text-color)!important;
		border-color: var(--themeused${type}-border-color)!important;
		background-color: var(--themeused${type}-background-color)!important;
	}
	${selector}:hover ${posterity} {
		color: var(--themeused${type}-text-color-hover)!important;
		border-color: var(--themeused${type}-border-color-hover)!important;
		background-color: var(--themeused${type}-background-color-hover)!important;
	}
	${selector}:focus ${posterity} {
		color: var(--themeused${type}-text-color-focus)!important;
		border-color: var(--themeused${type}-border-color-focus)!important;
		background-color: var(--themeused${type}-background-color-focus)!important;
	}`
}
export function getThemeStyle(themeInfoList, theme) {
	function getStyleName(name, type) {
		if (name === 'default') { name = ''; }
		name = name.replace(/\-+/g, '').replace(/([A-Z])/g, '-$1').toLowerCase();
		if (name && name[0] !== '-') { name = '-' + name; }
		type = type.replace(/\-+/g, '').replace(/([A-Z])/g, '-$1').toLowerCase();
		if (type && type[0] !== '-') { type = '-' + type; }
		return `--themeused${name}${type}`;
	}
	function getValue(theme, name, type) {
		if (name === 'default') { name = ''; }
		const t = name ? name + type[0].toUpperCase() + type.substr(1) : type;
		return t in theme ? theme[t] : '';
	}
	function getDefaultValue(info, name, type, def) {
		let item = info[name];
		if (!item) { return def; }
		if (item.value && item.value[type]) {
			return item.value[type];
		} else if (item.valueExtends && item.valueExtends[type]){
			let it = info[item.valueExtends[type]];
			if (it && it.value && it.value[type]) {
				return it.value[type];
			}
		}
		return def;
	}
	function generateThemeTypeValueList(info, theme, name, type) {
		let item = info[name];
		const extend = [name, ...(item.extends || [])];
		let baseValue, hoverValue, focusValue;
		for (let name of extend) {
			baseValue = baseValue || getValue(theme, name, type);
			hoverValue = hoverValue || getValue(theme, name, type + 'Hover') || baseValue;
			focusValue = focusValue || getValue(theme, name, type + 'Focus') || hoverValue;
			if (baseValue && hoverValue && focusValue) { break; }
		}
		baseValue = baseValue || getDefaultValue(info, name, type, 'inherit');
		hoverValue = hoverValue || getDefaultValue(info, name, type + 'Hover', baseValue);
		focusValue = focusValue || getDefaultValue(info, name, type + 'Focus', hoverValue);

		const styleName = getStyleName(name, type);
		return {
			[`${styleName}`]: baseValue,
			[`${styleName}-hover`]: hoverValue,
			[`${styleName}-focus`]: focusValue,
		}
	}
	const style = Object.create({});
	for (let name in themeInfoList) {
		Object.assign(style, generateThemeTypeValueList(themeInfoList, theme, name, 'textColor'));
		Object.assign(style, generateThemeTypeValueList(themeInfoList, theme, name, 'borderColor'));
		Object.assign(style, generateThemeTypeValueList(themeInfoList, theme, name, 'backgroundColor'));
	}
	return style;
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
function creatSelectList() {
	const selectList = document.getElementById('main').appendChild(document.createElement(selectListTagName));
	selectList.className = 'select-list';
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
	if (!isTool) {
		const themeSelectList = creatSelectList();
		themeSelectList.list = themeList.map(title => ({title}));
		themeSelectList.style.display = 'none';
		themeSelectList.placeholder = '选择主题(按上下箭头键预览)'
		themeSelectList.addEventListener('itemfocus', ({value: {title}}) => switchTheme(title, true))
		themeSelectList.addEventListener('itemblur', x => switchTheme(currentTheme))
		themeSelectList.addEventListener('itemselect', ({value: {title}}) => { switchTheme(title); themeSelectList.style.display = 'none'; })
		themeSelectList.addEventListener('exit', x => {switchTheme(currentTheme); themeSelectList.style.display = 'none'; })
		createtoolButton('皮肤').addEventListener('click', event => {
			themeSelectList.style.display = 'block';
			themeSelectList.value = '';
			themeSelectList.index = themeList.indexOf(currentTheme);
			setTimeout(x => themeSelectList.focus(), 0);
	} )
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
