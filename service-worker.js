const baseItemVersion = 3;
const itemVersion = {
	'base64/index.js': 1,
	'file2base64/index.js': 2,
	'image-size/index.js': 2,
	'qrcode/index.js': 2,
};
const baseItem = [ './index/index.html', './pwa/index.html', './xutool/index.html', './index.js', './index.css',];
baseItem.forEach(it => itemVersion[it] = baseItemVersion);


const cacheName = 'tools@wangchenxu.net';
const serviceRoot = self.location.href.replace(/\/*([^/]*)(?:[#?].*)?$/, '/');
function getPath(url) {
	if (url.indexOf(serviceRoot) !== 0) { return; }
	return url.substr(serviceRoot.length).replace(/[#?].*$/, '');
}
function getPageId(path) {
	if (!path) { return 'index/'; }
	let info = /^([a-z0-9\-]+)(?:\.html|\/(?:index(?:\.html)?)?)?$/.exec(path);
	if (!info) { return; }
	let toolId = info[1];
	if (path[path.length - 1] === '/') { return toolId; }
	if (path.indexOf('/') !== -1) { return './'; }
	return toolId + '/';
}
function getItemId(path) {
	let info = /^([a-z0-9\-]+\/index\.js)$/.exec(path);
	if (info) { return info[1] || ''; }
	info = /^((?:component|util)\/[a-z0-9\-]+\.js)$/.exec(path);
	if (info) { return info[1] || ''; }
	info = /^(logo\/(?:\d+\.png|logo\.svg))$/.exec(path);
	if (info) { return info[1] || ''; }
	info = /^(favicon\.ico)$/.exec(path);
	if (info) { return info[1] || ''; }
	info = /^(index\.json)$/.exec(path);
	if (info) { return info[1] || ''; }
}

async function putItem(id, res, version = itemVersion[id] || 0) {
	const data = await res.clone().blob();
	res = new Response(data, {
		headers: {
			'Content-Type': data.type,
			'Xu-Tools-Version': version,
			'Content-Length': data.size,
		}
	})
	let cache = await caches.open(cacheName)
	cache.put(`./${id}`, res);
}
async function backup(id, version = itemVersion[id]) {
	const res = await fetch(`./${id}`);
	if(res.status !== 200) { return res; }
	putItem(id, res, version);
	return res;
}
async function updateItem(id, oldRes, version = itemVersion[id]) {
	if (typeof version !== 'number') { return oldRes; }
	if (oldRes && Number(oldRes.headers.get('Xu-Tools-Version') || 0) >= version) { return oldRes; }
	try {
		const res = await fetch(`./${id}`);
		if(res.status !== 200) { return oldRes; }
		putItem(id, res, version);
		return res;
	} catch(e) {
		if (oldRes) { throw e; }
		return oldRes;
	}

}
function updateList() {
	setTimeout(updateList, 6 * 60 *60 * 1000);
	backup('./list.js');
}

self.addEventListener('install', function(event) {
	caches.delete('page-1')
	caches.delete('xutool-base-page')
	caches.delete('xutool-item')
	event.waitUntil(caches.open(cacheName)
		.then(cache => Promise.all(
			baseItem.map(async k => updateItem(k, await cache.match(k), baseItem[k]))
		)).then(updateList)
	);
});
self.addEventListener('activate', function(event) {updateList()});
self.addEventListener('fetch', function(event) {
	if (event.request.method !== 'GET') { return; }
	const path = getPath(event.request.url);
	if (typeof path !== 'string') { return; }
	if (['index.js', 'index.css', 'list.js'].includes(path)) {
		return event.respondWith(caches.match(path).then(res => res || backup(path)));
	}
	const pageId = getPageId(path);
	if (pageId && pageId[pageId.length - 1] === '/') {
		return event.respondWith(Promise.resolve(new Response('',{ status: 301, headers: { location: pageId, } })));
	} else if (pageId === 'pwa') {
		return event.respondWith(caches.match('./pwa/').then(res => res || backup('./pwa/index.html')));
	} else if (pageId === 'xutool') {
		return event.respondWith(caches.match('./xutool/').then(res => res || backup('./xutool/index.html')));
	} else if (pageId) {
		return event.respondWith(caches.match('./index/').then(res => res || backup('./index/index.html')));
	}
	const itemId = getItemId(path);
	if (itemId === 'index.json') {
		return event.respondWith(caches.match(`./${itemId}`).then(res => res ? res : backup(itemId)));
	}
	if (itemId) {
		return event.respondWith(caches.match(`./${itemId}`).then(res => res ? updateItem(itemId, res) : backup(itemId)));
		
	}
});
