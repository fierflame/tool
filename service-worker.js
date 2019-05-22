const serviceRoot = self.location.href.replace(/\/*([^/]*)(?:[#?].*)?$/, '/');
function getPath(url) {
	if (url.indexOf(serviceRoot) !== 0) { return; }
	return url.substr(serviceRoot.length).replace(/[#?].*$/, '');
}
function getPageId(path) {
	path = /^([a-z0-9\-]*)(?:\.html)?$/.exec(path);
	if (path) { return path[1] || 'index'; }
}
function getUtilId(path) {
	path = /^util\/([a-z0-9\-]*)\.js$/.exec(path);
	if (path) { return path[1] || ''; }
}
function getComponentId(path) {
	path = /^component\/([a-z0-9\-]*)\.js$/.exec(path);
	if (path) { return path[1] || ''; }
}
const pageId = 1;
self.addEventListener('install', function(event) {
	event.waitUntil(caches.open('page-' + pageId).then(cache => {
		return cache.addAll([
			'./init.html',
			'./xutool.html',
			'./pwa.html',
			'./script.js',
			'./style.css',
		])
	}));
});

self.addEventListener('activate', function(event) {});
let e;
self.addEventListener('fetch', function(event) {
	e = event;
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
});
