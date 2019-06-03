require('@gensety/renderer-ejs');
module.exports = {
	theme: {
		static: 'static',
	},
	public: '../../public/tools',
	source: '../../tools',
	title: '开发者工具'
}
function getData(list, id) {
	const isPWA = id === 'pwa';
	const isInit = id === 'init';
	const isTool = id === 'xutool';
	const isIndex = !id || id === 'index';
	const isAppPage = isPWA ||  isTool;
	const it = list.find(it => it.id === id);
	const title = it && it.name || '';
	const description = it && it.description || '';
	return {
		list, id, title, description,
		isAppPage, isPWA, isInit, isTool, isIndex,
	};
}
const output = [];
const items = [];


gensety.addProcessor('/:path+', async function processor(file) {
	if (['/index.json', '/TODO', '/README.md'].includes(file.path)) { return false; }
	file.copyTo.push(file.path);
	output.push(file);
	const pageInfo = /^\/([a-z0-9\-]+)\/index\.js$/.exec(file.path);
	if (!pageInfo) { return true; }
	const infoText = (/^\/\*\*\n([\s\S]*?)\n \*\//.exec(String(await file.read())) || [])[1];
	if (!infoText) { return true; }
	const info = { id: pageInfo[1] }
	infoText.split('\n')
		.map(t => /^ \* @([a-z]+)\s+(.+)$/.exec(t))
		.filter(Boolean).filter(([, k])=> k !== 'id')
		.forEach(([, k ,v]) => info[k] = v);
	items.push(info);
	return true;
});
gensety.setGenerater('tools', function generator() {
	const ids = new Set(items.map(({id}) => id));
	ids.add('pwa');
	ids.add('xutool');
	return [
		...output,
		...[...ids].map(id => ({
			path: `${id}/index.html`,
			data: getData(items, id),
			layout: 'index.ejs',
		})),
		{
			path: `index.html`,
			data: getData(items, 'index'),
			layout: 'index.ejs',
		},
		{
			path: `index/index.html`,
			data: getData(items, 'init'),
			layout: 'index.ejs',
		},
		{
			path: `list.js`,
			data: `export default ${JSON.stringify(items)}`,
		},
	]
});