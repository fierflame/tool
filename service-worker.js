const baseItem = {
	'init.html': 3,
	'xutool.html': 3,
	'pwa.html': 3,
	'script.js': 3,
	'style.css': 3,
}
const itemVersion = {
	...baseItem,
	'component/qrcode.js': 3,
};
const cacheName = 'xutool-item';
const serviceRoot = self.location.href.replace(/\/*([^/]*)(?:[#?].*)?$/, '/');
function getPath(url) {
	if (url.indexOf(serviceRoot) !== 0) { return; }
	return url.substr(serviceRoot.length).replace(/[#?].*$/, '');
}
function getPageId(path) {
	let info = /^([a-z0-9\-]*)(?:\.html)?$/.exec(path);
	if (info) { return info[1] || 'index'; }
}
function getItemId(path) {
	let info = /^((?:component|util)\/[a-z0-9\-]*\.js)$/.exec(path);
	if (info) { return info[1] || ''; }
	info = /^(logo\/\d+\.png)$/.exec(path);
	if (info) { return info[1] || ''; }
	info = /^(logo\/logo\.svg)$/.exec(path);
	if (info) { return info[1] || ''; }
	info = /^(favicon\.ico)$/.exec(path);
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
	backup('./component/index.json');
}

self.addEventListener('install', function(event) {
	caches.delete('page-1')
	caches.delete('xutool-base-page')
	event.waitUntil(caches.open(cacheName)
		.then(cache => Promise.all(
			Object.keys(baseItem)
				.map(async k => updateItem(k, await cache.match(k), baseItem[k]))
		)).then(updateList)
	);
});
self.addEventListener('activate', function(event) {updateList()});
self.addEventListener('fetch', function(event) {
	if (event.request.method !== 'GET') { return; }
	const path = getPath(event.request.url);
	if (typeof path !== 'string') { return; }
	if (path === 'script.js') {
		return event.respondWith(caches.match('./script.js').then(res => res || backup(path)));
	} else if (path === 'style.css') {
		return event.respondWith(caches.match('./style.css').then(res => res || backup(path)));
	}
	const pageId = getPageId(path);
	if (pageId === 'pwa') {
		return event.respondWith(caches.match('./pwa.html').then(res => res || backup('pwa.html')));
	} else if (pageId === 'xutool') {
		return event.respondWith(caches.match('./xutool.html').then(res => res || backup('xutool.html')));
	} else if (pageId) {
		return event.respondWith(caches.match('./init.html').then(res => res || backup('init.html')));
	}
	const itemId = getItemId(path);
	if (itemId === 'component/index.json') {
		return event.respondWith(caches.match(`./${itemId}`).then(res => res ? res : backup(itemId)));
	}
	if (itemId) {
		return event.respondWith(caches.match(`./${itemId}`).then(res => res ? updateItem(itemId, res) : backup(itemId)));
		
	}
});
