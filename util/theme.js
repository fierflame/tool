
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
export function getVar(themeInfoList, theme) {
	const style = Object.create({});
	for (let name in themeInfoList) {
		Object.assign(style, generateThemeTypeValueList(themeInfoList, theme, name, 'textColor'));
		Object.assign(style, generateThemeTypeValueList(themeInfoList, theme, name, 'borderColor'));
		Object.assign(style, generateThemeTypeValueList(themeInfoList, theme, name, 'backgroundColor'));
	}
	return style;
}
export function getStyle(type = '', e = ''){
	if (type === 'default') { type = ''; }
	type = type.replace(/([A-Z])/g, '-$1').replace(/(^|-)\-+/g, '$1').replace(/\-$/g, '').toLowerCase();
	if (type && type[0] !== '-') { type = '-' + type; }
	if (e) { e = '-' + e; }
	return {
		color: `var(--themeused${type}-text-color${e})`,
		borderColor: `var(--themeused${type}-border-color${e})`,
		backgroundColor: `var(--themeused${type}-background-color${e})`,	
	}
}

export function getVarText(themeInfoList, theme) {
	const style = getVar(themeInfoList, theme);
	return Object.keys(style).map(k => k + ': ' + style[k]).join('; ');
}
export function getStyleText(type, e) {
	const style = getStyle(type, e);
	return Object.keys(style).map(k => k.replace(/([A-Z])/g, '-$1') + ': ' + style[k] + '!important;').join(' ');
}
