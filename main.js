"use strict";

{
	let global = this;
	let document = global.document;

	let openWindowTemplateNode;
	let editorWindowTemplateNode;
	let editorTemplateNode;

	let loadOpenWindow = function () {
		let cloneNode = document.importNode(openWindowTemplateNode.content, true);

		document.body.id = "open-window";
		document.body.textContent = "";
		document.body.appendChild(cloneNode);

		let fileNode = document.body.querySelector("#file");
		let openNode = document.body.querySelector("#open");

		let openFile = function () {
			if (fileNode.files.length === 1) {
				file = fileNode.files[0];

				if (
					file.type !== "image/jpeg" &&
					file.type !== "image/png" &&
					file.type !== "image/gif"
				) {
					global.alert("Wrong file type");

					return;
				}

				openNode.disabled = true;

				let URL = global.URL.createObjectURL(file);
				let image = new Image();

				let load = function () {
					loadEditorWindow(image);

					global.URL.revokeObjectURL(URL);
				};

				let handleError = function () {
					openNode.disabled = false;
					global.URL.revokeObjectURL(URL);

					global.alert("Can't decode image");
				};

				image.addEventListener("load", load);
				image.addEventListener("error", handleError);

				image.src = URL;
			}
		};

		openNode.addEventListener("click", openFile);
	};

	let loadEditorWindow = function (image) {
		let cloneNode = document.importNode(editorWindowTemplateNode.content, true);

		document.body.id = "editor-window";
		document.body.textContent = "";
		document.body.appendChild(cloneNode);

		let saveNode = document.body.querySelector("#save");
		let closeNode = document.body.querySelector("#close");
		let editorNode = document.body.querySelector("#editor");

		cloneNode = document.importNode(editorTemplateNode.content, true);

		editorNode.appendChild(cloneNode);

		let editor;

		let save = function () {
			let imageWindow = global.open();
			let URL = null;

			let revokeURL = function () {
				if (URL !== null) {
					global.URL.revokeObjectURL(URL);
				}
			};

			imageWindow.addEventListener("load", revokeURL);

			let show = function (image) {
				URL = global.URL.createObjectURL(image);

				imageWindow.location = URL;
			};

			editor.getImage(show);
		};

		let close = function () {
			delete global.editor;

			loadOpenWindow();
		};

		saveNode.addEventListener("click", save);
		closeNode.addEventListener("click", close);

		editor = new global.GammaMask.Editor(editorNode, image);

		global.editor = editor;
	};

	let main = function () {
		openWindowTemplateNode = document.querySelector("#open-window-template");
		editorWindowTemplateNode = document.querySelector("#editor-window-template");
		editorTemplateNode = document.querySelector("#editor-template");

		loadOpenWindow();
	};

	document.addEventListener("DOMContentLoaded", main);
}
