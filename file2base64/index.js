import {generateThemeStyle} from '../index.js';

export default class Base64 extends HTMLElement {
	static get observedAttributes() {
		return ['unclosable', 'width', 'opened'];
	}
	constructor() {
		super();
		let shadow = this.attachShadow({mode:'open'});
		this._shadow = shadow;
		shadow.innerHTML = `
<style>
:host { display: flex; flex-direction: column; position: relative; }
#selectFile  { height: 60px; }
ol { overflow: auto; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; flex: 1; }
li { display: flex; flex-direction: column; font-size: 14px; }
li > * { display: flex; }
textarea { height: 80px; resize: none; background: none; border: 1px solid; }
ol button { margin: 5px; height: 30px; }
output, input { background: none; margin: 0; height: 40px; line-height: 40px; border: none; outline: none; }
.name { flex: 1; }
progress { flex: 2; margin: auto; }
.size { margin: 0 5px 0 0; width: 60px; text-align: right; }
button { border: 1px solid; }
${generateThemeStyle(':host')}
${generateThemeStyle('button', 'button')}
${generateThemeStyle('textarea', 'input')}
${generateThemeStyle('li', 'item')}
</style>
<button id="selectFile">选择文件或将文件拖动到此处</button>
<ol></ol>`
		this._files = shadow.querySelector('ol');
		shadow.getElementById('selectFile').addEventListener('click', _ => this.selectFile());

		this.addEventListener('dragenter', e => {
			if (!e.dataTransfer.types.includes('Files')) { return; }
			// TODO: 显示提示层
		})
		this.addEventListener('dragover', e => {
			if (!e.dataTransfer.types.includes('Files')) { return; }
			e.preventDefault()
		})
		this.addEventListener('drop', e => {
			if (!e.dataTransfer.types.includes('Files')) { return; }
			e.preventDefault()
			for(let file of e.dataTransfer.files) {
				this.encodeFile(file);
			}
		})
	}
	selectFile() {
		const fileSelecter = document.createElement('input');
		fileSelecter.type = "file";
		// fileSelecter.multiple = true;
		fileSelecter.addEventListener('change', () => {
			for (let file of fileSelecter.files) {
				this.encodeFile(file);
			}
		});
		fileSelecter.click();
	}
	encodeFile(file) {
		const li = this._files.appendChild(document.createElement('li'));
		const div = li.appendChild(document.createElement('div'));
		const closeOutput = div.appendChild(document.createElement('button'));
		closeOutput.innerText = '×';
		closeOutput.style.width = '30px';
		closeOutput.addEventListener('click', x => this._files.removeChild(div));
		const sizeOutput = div.appendChild(document.createElement('input'));
		const nameOutput = div.appendChild(document.createElement('input'));
		nameOutput.readOnly = true;
		nameOutput.className = 'name';
		nameOutput.value = file.name;
		sizeOutput.readOnly = true;
		sizeOutput.className = 'size';
		let size = file.size;
		if (size < 1024) {
			sizeOutput.value = size + 'Byte';
		} else if (size < 10 * 1024) {
			sizeOutput.value = (size / 1024).toFixed(2) + 'KiB';
		} else if (size < 100 * 1024) {
			sizeOutput.value = (size / 1024).toFixed(1) + 'KiB';
		} else if (size < 1024 * 1024) {
			sizeOutput.value = (size / 1024).toFixed(0) + 'KiB';
		} else if (size < 10 * 1024 * 1024) {
			sizeOutput.value = (size / 1024 / 1024).toFixed(2) + 'MiB';
		} else if (size < 100 * 1024 * 1024) {
			sizeOutput.value = (size / 1024 / 1024).toFixed(1) + 'MiB';
		} else if (size < 1024 * 1024 * 1024) {
			sizeOutput.value = (size / 1024 / 1024).toFixed(0) + 'MiB';
		} else if (size < 10 * 1024 * 1024 * 1024) {
			sizeOutput.value = (size / 1024 / 1024 / 1024).toFixed(2) + 'GiB';
		} else if (size < 100 * 1024 * 1024 * 1024) {
			sizeOutput.value = (size / 1024 / 1024 / 1024).toFixed(1) + 'GiB';
		} else {
			sizeOutput.value = (size / 1024 / 1024 / 1024).toFixed(0) + 'GiB';
		}
		if (size > 100 * 1024 && !confirm(`${file.name}\n此文件尺寸(${sizeOutput.value})超过 100 KiB，转换速度较慢，确定要继续转换吗？`)) {
			div.appendChild(document.createElement('output')).value = '已取消';
			return;
		};
		const progress = div.appendChild(document.createElement('progress'));

		const abortButton = div.appendChild(document.createElement('button'));
		let end = false;
		abortButton.innerText = '取消';
		const fr = new FileReader(file);
		abortButton.addEventListener('click', x => () => fr.abort() );
		closeOutput.addEventListener('click', x => () => fr.abort() );
		fr.addEventListener('loadend', () => {
			if (end) { return; } end = true;
			div.removeChild(progress);
			div.removeChild(abortButton);
			const show = x => {
				const button = div.appendChild(document.createElement('button'));
				button.addEventListener('click', x => {
					textarea.select();
					document.execCommand('copy');
					alert('复制成功');
				})
				button.innerText = '复制';
				const textarea = document.createElement('textarea');
				textarea.readOnly = true;
				textarea.value = fr.result;
				li.appendChild(textarea)
			}
			if (size > 10 * 1024 * 1024) {
				const statusOutput = div.appendChild(document.createElement('output'));
				statusOutput.value = '文件较大，显示会造成长时间卡顿';
				const button = div.appendChild(document.createElement('button'));
				button.addEventListener('click', x => {
					statusOutput.value = '文件较大，全选复制会明显卡顿';
					div.removeChild(button);
					show();
				})
				button.innerText = '显示';
			} else if (size > 1024 * 1024) {
				const statusOutput = div.appendChild(document.createElement('output'));
				statusOutput.value = '文件较大，显示会明显卡顿';
				const button = div.appendChild(document.createElement('button'));
				button.addEventListener('click', x => {
					statusOutput.value = '文件较大，全选复制可能会卡顿';
					div.removeChild(button);
					show();
				})
				button.innerText = '显示';
			} else if (size > 100 * 1024) {
				const statusOutput = div.appendChild(document.createElement('output'));
				statusOutput.value = '文件较大，显示可能会卡顿';
				const button = div.appendChild(document.createElement('button'));
				button.addEventListener('click', x => {
					statusOutput.value = '文件较大，全选复制可能会卡顿';
					div.removeChild(button);
					show();
				})
				button.innerText = '显示';
			} else {
				show();
			}
		});
		fr.addEventListener('abort', () => {
			if (end) { return; } end = true;
			div.removeChild(progress);
			div.removeChild(abortButton);
			div.appendChild(document.createElement('output')).value = '已取消';
		})
		fr.addEventListener('progress', event => {
			progress.max = event.total;
			progress.value = event.loaded;
		})
		fr.addEventListener('error', () => {
			if (end) { return; } end = true;
			div.removeChild(progress);
			div.removeChild(abortButton);
			div.appendChild(document.createElement('output')).value = '发生错误';
		})
		fr.readAsDataURL(file);
	}
}