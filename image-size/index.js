import {generateThemeStyle} from '../index.js';

function getSize(size) {
	if (size < 1024) {
		return size + 'Byte';
	} else if (size < 10 * 1024) {
		return(size / 1024).toFixed(2) + 'KiB';
	} else if (size < 100 * 1024) {
		return(size / 1024).toFixed(1) + 'KiB';
	} else if (size < 1024 * 1024) {
		return(size / 1024).toFixed(0) + 'KiB';
	} else if (size < 10 * 1024 * 1024) {
		return(size / 1024 / 1024).toFixed(2) + 'MiB';
	} else if (size < 100 * 1024 * 1024) {
		return(size / 1024 / 1024).toFixed(1) + 'MiB';
	} else if (size < 1024 * 1024 * 1024) {
		return(size / 1024 / 1024).toFixed(0) + 'MiB';
	} else if (size < 10 * 1024 * 1024 * 1024) {
		return(size / 1024 / 1024 / 1024).toFixed(2) + 'GiB';
	} else if (size < 100 * 1024 * 1024 * 1024) {
		return(size / 1024 / 1024 / 1024).toFixed(1) + 'GiB';
	} else {
		return(size / 1024 / 1024 / 1024).toFixed(0) + 'GiB';
	}
}

const mime = ['image/png','image/jpeg','image/bmp','image/webp','image/svg+xml'];
export default class ImageSize extends HTMLElement {
	constructor() {
		super();
		let shadow = this.attachShadow({mode:'open'});
		this._shadow = shadow;
		shadow.innerHTML = `
<style>
	@media (min-width:500px) { li { width: 50%; float: left; } }
	@media (min-width:750px) { li { width: 33.3333%; } }
	@media (min-width:1000px) { li { width: 25%; } }
	@media (min-width:1250px) { li { width: 20%; } }
	:host { display: flex; flex-direction: column; position: relative; }
	ul { flex: 1; padding: 0; margin: 0; list-style: none; overflow: auto; }
	li { float: left; }
	li > div { position: relative; display: flex; flex-direction: column; text-align: center; margin: 2px; border: 1px #999 solid; border-radius: 2px; }
	li .image { position: relative; min-width: 200px; height: 200px; }
	li img { position: absolute; top: 0; left: 0; right: 0; bottom: 0; max-width: 90%; max-height: 90%; margin: auto; }
	li .handle { display: flex; }
	li .handle button{ flex: 1; height: 30px; }
	li input { position: absolute; opacity: 0.5; width: 60px; height: 60px; margin: 5px; }
	li input:hover { opacity: 1; }
	li .name { height: 20px; line-height: 20px; }
	li .info { display: flex; height: 20px; line-height: 20px; }
	li .info * { flex: 1; }
	form { margin: 0; height: 40px; line-height: 40px; display: flex; }
	form select, form input{ border: 1px solid; flex: 1; width: 0; height: 40px; margin: 0; box-sizing: border-box; }
	form label{ line-height: 20px; width: 20px; font-size: 14px; text-align: center; }
	form select[name=mime] { max-width: 60px; }
	.buttons { display: flex; height: 40px; line-height: 40px; }
	.buttons button, buttons input{ flex: 1; height: 40px; margin: 0; }
	.buttons .selectAll{ flex: none; width: 40px; height: 40px; margin: 0; }
	#show-plyer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); }
	#show-plyer img { position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; max-height: 80%; max-width: 80%; }
	button { border: 1px solid; }
	${generateThemeStyle(':host')}
	${generateThemeStyle('button', 'button')}
	${generateThemeStyle('input', 'input')}
	${generateThemeStyle('select', 'input')}
	${generateThemeStyle('li > div', 'item')}
	${generateThemeStyle('#show-plyer', 'mask')}
</style>
<div class="buttons">
	<button class="selectImage">选择图片</button>
	<button class="delete">批量删除</button>
	<button class="download">批量下载</button>
	<label for="selectAll">全选</label><input class="selectAll" type="checkbox">
</div>
<ul></ul>
<form onsubmit="return false">
	<label>模式</label>
	<select name="mode">
		<option value="0">按比例缩放</option>
		<option value="1" selected>宽度固定，高度缩放</option>
		<option value="2">高度固定，宽度缩放</option>
		<option value="3">固定宽度和高度</option>
	</select>
	<label>比例</label>
	<input name="zoom" type="number" value="1" />
	<label>宽度</label>
	<input name="width" type="number" value="640" />
	<label>高度</label>
	<input name="height" type="number" value="640" />
	<label>格式</label>
	<select name="mime">
		<option value="image/png">png</option>
		<option value="image/jpeg">jpg</option>
		<option value="image/webp">webp</option>
	</select>
</form>
<div class="buttons">
	<button class="selectImage">选择图片</button>
	<button class="delete">批量删除</button>
	<button class="download">批量下载</button>
	<label for="selectAll">全选</label><input class="selectAll" type="checkbox">
</div>
<div id="show-plyer" style="display: none"></div>`

		this._list = shadow.querySelector('ul');
		shadow.querySelectorAll('.selectImage').forEach(it => it.addEventListener('click', x => this.selectImage()));
		const showPlyer = shadow.querySelector('#show-plyer');
		showPlyer.addEventListener('click', event => event.path[0] === showPlyer && (showPlyer.style.display = 'none') && (showPlyer.innerHTML = ''));
		this._showPlyer = showPlyer;
		const form = shadow.querySelector('form')
		this._mode = form.mode;
		this._width = form.width;
		this._height = form.height;
		this._zoom = form.zoom;
		this._mime = form.mime;
		const selectAll = shadow.querySelectorAll('.selectAll');
		this._selectAll = selectAll;
		selectAll.forEach(it => it.addEventListener('click', x=> {
			const checked = selectAll[0].checked;
			Array.from(this._shadow.querySelectorAll('input[type=checkbox]')).forEach(it => it.checked = checked);
		}))
		shadow.querySelectorAll('.delete').forEach(it => it.addEventListener('click', x=> {
			Array.from(this._shadow.querySelectorAll('input[type=checkbox]'))
				.filter(it => it.checked)
				.forEach(it => it.parentElement.dispatchEvent(new Event('requesDelete')))
		}))
		shadow.querySelectorAll('.download').forEach(it => it.addEventListener('click', x=> {
			Array.from(this._shadow.querySelectorAll('input[type=checkbox]'))
				.filter(it => it.checked)
				.forEach(it => it.parentElement.dispatchEvent(new Event('requestDownload')))
		}))
		


		this.addEventListener('dragenter', event => {
			if (!event.dataTransfer.types.includes('Files')) { return; }
			// TODO: 显示提示层
		})
		this.addEventListener('dragover', event => {
			if (!event.dataTransfer.types.includes('Files')) { return; }
			event.preventDefault()
		})
		this.addEventListener('drop', event => {
			if (!event.dataTransfer.types.includes('Files')) { return; }
			event.preventDefault()
			for(let file of event.dataTransfer.files) {
				this.addImage(file);
			}
		})
	}
	addImage(file) {
		const {name, type, size} = file;
		if (!mime.includes(type)) { return; }
		const li = this._list.appendChild(document.createElement('li'));
		const item = li.appendChild(document.createElement('div'));
		const imageDiv = item.appendChild(document.createElement('div'));
		const nameDiv = item.appendChild(document.createElement('div'));
		const info = item.appendChild(document.createElement('div'));
		const handle = item.appendChild(document.createElement('div'));
		const checkbox = item.appendChild(document.createElement('input'));
		imageDiv.className = 'image';
		info.className = 'info';
		handle.className = 'handle';
		nameDiv.className = 'name';
		checkbox.type = 'checkbox';

		nameDiv.innerText = name;
		info.appendChild(document.createElement('div')).innerText = getSize(size);

		const image = imageDiv.appendChild(new Image());
		const delBtn = handle.appendChild(document.createElement('button'));
		delBtn.innerText = '删除';
		delBtn.addEventListener('click', e => item.dispatchEvent(new Event('requesDelete')))
		checkbox.addEventListener('click', e => this.updateSelectAll())
		
		let url =  URL.createObjectURL(file);
		item.addEventListener('requesDelete', event => {
			URL.revokeObjectURL(url);
			url = '';
			this._list.removeChild(li);
			this.updateSelectAll();
		})
		image.addEventListener('load', event => {
			const {naturalWidth: width, naturalHeight: height} = image;
			info.appendChild(document.createElement('div')).innerText = `${width}x${height}`;
			const viewBtn = handle.insertBefore(document.createElement('button'), delBtn);
			const downloadBtn = handle.insertBefore(document.createElement('button'), delBtn);
			viewBtn.innerText = '预览';
			downloadBtn.innerText = '下载';
			viewBtn.addEventListener('click', e => item.dispatchEvent(new Event('requestShow')))
			downloadBtn.addEventListener('click', e => item.dispatchEvent(new Event('requestDownload')))
			item.addEventListener('requestDownload', event => {
				if (!url) { return; }
				this.getUrl(image).then(url => this.download(url, name))
			})
			item.addEventListener('requestShow', event => {
				if (!url) { return; }
				this.getUrl(image).then(url => this.show(url))
			})
		})
		image.src = URL.createObjectURL(file);
		if (this._selectAll[0].checked) {
			checkbox.checked = true;
		}
	}
	get mode() { return Number(this._mode.value); }
	get width() { return Number(this._width.value); }
	get height() { return Number(this._height.value); }
	get zoom() { return Number(this._zoom.value); }
	async getUrl(image) {
		const canvas = document.createElement("canvas");
		let w, h;
		switch(Math.floor(this.mode % 4)) {
			default:
				w = image.naturalWidth * this.zoom;
				h = image.naturalHeight * this.zoom;
				break;
			case 1:
				w = this.width;
				h = image.naturalHeight / image.naturalWidth * w;
				break;
			case 2:
				h = this.height;
				w = image.naturalWidth / image.naturalHeight * h;
				break;
			case 3:
				w = this.width;
				h = this.height;
				break;
		}
		canvas.width = w;
		canvas.height = h;
		canvas.getContext("2d").drawImage(image, 0, 0, w, h);
		return new Promise (resolve => canvas.toBlob(blob => resolve(URL.createObjectURL(blob)), this.mime));
	}
	show (url) {
		const showPlyer = this._showPlyer;
		showPlyer.innerHTML = '';
		showPlyer.style.display = '';
		showPlyer.appendChild(new Image()).src = url;
	}
	download(url, name) {
		const a = document.createElement('a');
		a.href = url;
		a.download = ((name || '').replace(/\.[^\.]*$/, '') || '图片') + '.jpg';
		a.click();
	}
	updateSelectAll() {
		const checkboxs = Array.from(this._shadow.querySelectorAll('input[type=checkbox]')).filter(cb => !cb.className);
		const checked = checkboxs.filter(cb => cb.checked);
		if(checked.length === 0) {
			this._selectAll[0].checked = false;
			this._selectAll[0].indeterminate = false;
			this._selectAll[1].checked = false;
			this._selectAll[1].indeterminate = false;
		} else if(checked.length === checkboxs.length) {
			this._selectAll[0].checked = true;
			this._selectAll[0].indeterminate = false;
			this._selectAll[1].checked = true;
			this._selectAll[1].indeterminate = false;
		} else {
			this._selectAll[0].checked = false;
			this._selectAll[0].indeterminate = true;
			this._selectAll[1].checked = false;
			this._selectAll[1].indeterminate = true;
		}
	}
	selectImage() {
		const fileSelecter = document.createElement('input');
		fileSelecter.type = "file";
		// fileSelecter.multiple = true;
		fileSelecter.accept = mime.join(',');
		fileSelecter.addEventListener('change', () => {
			for (let file of fileSelecter.files) {
				this.addImage(file)
			}
		});
		fileSelecter.click();
	}
}