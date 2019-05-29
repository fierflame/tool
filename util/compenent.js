const map = new Map();
const components = Object.create(null);
function getName(name = '') {
	name = /^[a-z0-9\-]+$/.test(name) ? `xutool-${name}` : /^xutool-[a-z0-9]+$/.test(name) ? name : '';
	while(components[name] || !name) {
		name = `xutool-component-r${Math.floor(Math.random() * 100000000)}`
	};
	return name;
}
export function register(component, name) {
	if (map.has(component)) { return map.get(component); }
	name = getName(name);
	components[name] = component;
	map.set(component, name);
	customElements.define(name, component);
	return name;
}
const promise = Object.create(null);
export async function load(path) {
	if (!path) { path = 'index'; }
	if (path[path.length] === '/') { path += 'index'; }
	if (path !== 'index' && /^[a-z0-9\-]+$/.test(path)) { path = path + '/index'; }
	if (path.substr(path.length - 3) === '.js') { path = path.substr(0, path.length - 3); }
	if (path in promise) { return promise[path]; }
	return promise[path] = import(`../${path}.js`).then(({default: def}) => def);
}
export async function create(path, name = path) {
	return register(await load(path), name);
}

export default register;
