const itemVersion = {

};

const baseItem = {
	'init.html': 0,
	'xutool.html': 0,
	'pwa.html': 0,
	'script.js': 0,
	'style.css': 0,
}


const serviceRoot = self.location.href.replace(/\/*([^/]*)(?:[#?].*)?$/, '/');
function getPath(url) {
	if (url.indexOf(serviceRoot) !== 0) { return; }
	return url.substr(serviceRoot.length).replace(/[#?].*$/, '');
}
function getPageId(path) {
	path = /^([a-z0-9\-]*)(?:\.html)?$/.exec(path);
	if (path) { return path[1] || 'index'; }
}
function getItemId(path) {
	path = /^((?:component|util)\/[a-z0-9\-]*\.js)$/.exec(path);
	if (path) { return path[1] || ''; }
	path = /^(logo\/\d+\.png)$/.exec(path);
	if (path) { return path[1] || ''; }
	path = /^(logo\/logo\.svg)$/.exec(path);
	if (path) { return path[1] || ''; }
	path = /^(favicon\.ico)$/.exec(path);
	if (path) { return path[1] || ''; }
}

async function putItem(id, res, cache = 'xutool-item', version = itemVersion[id] || 0) {
	const data = await res.clone().blob();
	res = new Response(data, {
		headers: {
			'Content-Type': data.type,
			'Xu-Tools-Version': version,
			'Content-Length': data.size,
		}
	})
	cache = await caches.open(cache)
	cache.put(`./${id}`, res);
}
async function backup(id, cache = 'xutool-item', version = itemVersion[id]) {
	const res = await fetch(`./${id}`);
	if(res.status !== 200) { return res; }
	putItem(id, res, cache, version);
	return res;
}
async function updateItem(id, oldRes, cache = 'xutool-item', version = itemVersion[id]) {
	if (typeof version !== 'number') { return oldRes; }
	if (oldRes && Number(oldRes.headers.get('Xu-Tools-Version') || 0) >= version) { return oldRes; }
	try {
		const res = await fetch(`./${id}`);
		if(res.status !== 200) { return oldRes; }
		putItem(id, res, cache, version);
		return res;
	} catch(e) {
		return oldRes;
	}

}


self.addEventListener('install', function(event) {
	event.waitUntil(caches.open('xutool-base-page')
		.then(cache => Promise.all(
			Object.keys(baseItem)
				.map(async k => updateItem(k, await cache.match(k), 'xutool-base-page', baseItem[k]))
		))
	);
});
self.addEventListener('activate', function(event) {});
self.addEventListener('fetch', function(event) {
	if (event.request.method !== 'GET') { return; }
	const path = getPath(event.request.url);
	if (typeof path !== 'string') { return; }
	if (path === 'script.js') {
		return event.respondWith(caches.match('./script.js'));
	} else if (path === 'style.css') {
		return event.respondWith(caches.match('./style.css'));
	}
	const pageId = getPageId(path);
	if (pageId === 'pwa') {
		return event.respondWith(caches.match('./pwa.html'));
	} else if (pageId === 'xutool') {
		return event.respondWith(caches.match('./xutool.html'));
	} else if (pageId) {
		return event.respondWith(caches.match('./init.html'));
	}
	const itemId = getItemId(path);
	if (itemId) {
		return event.respondWith(caches.match(`./${itemId}`).then(res => res ? updateItem(itemId, res) : backup(itemId)));
		
	}
});
