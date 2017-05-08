"use strict";

{
	let global = this;
	let GammaMask = global.GammaMask;

	let Editor = function (mainNode, image) {
		let nodes = {
			"field": mainNode.querySelector(".Gamma-Mask-field"),
			"selectionWrapper": mainNode.querySelector(".Gamma-Mask-selection-wrapper"),
			"selection": mainNode.querySelector(".Gamma-Mask-selection"),
			"canvas": mainNode.querySelector(".Gamma-Mask-canvas"),

			"negative": mainNode.querySelector(".Gamma-Mask-negative"),
			"negativeR": mainNode.querySelector(".Gamma-Mask-negative-R"),
			"negativeG": mainNode.querySelector(".Gamma-Mask-negative-G"),
			"negativeB": mainNode.querySelector(".Gamma-Mask-negative-B"),

			"xor0x80": mainNode.querySelector(".Gamma-Mask-xor-0x80"),
			"xor0x80R": mainNode.querySelector(".Gamma-Mask-xor-0x80-R"),
			"xor0x80G": mainNode.querySelector(".Gamma-Mask-xor-0x80-G"),
			"xor0x80B": mainNode.querySelector(".Gamma-Mask-xor-0x80-B"),

			"rotate": mainNode.querySelector(".Gamma-Mask-rotate"),
			"rotateOrder": mainNode.querySelector(".Gamma-Mask-rotate-order").elements["order"],

			"flipUpDown": mainNode.querySelector(".Gamma-Mask-flip-up-down"),

			"flipLeftRight": mainNode.querySelector(".Gamma-Mask-flip-left-right"),

			"Win": mainNode.querySelector(".Gamma-Mask-Win"),

			"verticalGlass": mainNode.querySelector(".Gamma-Mask-vertical-glass"),
			"verticalGlassWidth": mainNode.querySelector(".Gamma-Mask-vertical-glass-width"),

			"horizontalGlass": mainNode.querySelector(".Gamma-Mask-horizontal-glass"),
			"horizontalGlassHeight": mainNode.querySelector(".Gamma-Mask-horizontal-glass-height"),

			"Q0": mainNode.querySelector(".Gamma-Mask-Q0"),
			"Q0VerticalGlass": mainNode.querySelector(".Gamma-Mask-Q0-vertical-glass"),
			"Q0HorizontalGlass": mainNode.querySelector(".Gamma-Mask-Q0-horizontal-glass"),
			"Q0Negative": mainNode.querySelector(".Gamma-Mask-Q0-negative"),
			"Q0FlipUpDown": mainNode.querySelector(".Gamma-Mask-Q0-flip-up-down"),
			"Q0FlipLeftRight": mainNode.querySelector(".Gamma-Mask-Q0-flip-left-right"),
			"Q0Xor0x80": mainNode.querySelector(".Gamma-Mask-Q0-xor-0x80"),

			"FL": mainNode.querySelector(".Gamma-Mask-FL"),
			"FLNegative": mainNode.querySelector(".Gamma-Mask-FL-negative"),

			"MekoMinus": mainNode.querySelector(".Gamma-Mask-Meko-minus"),

			"MekoPlus": mainNode.querySelector(".Gamma-Mask-Meko-plus"),

			"CP": mainNode.querySelector(".Gamma-Mask-CP"),
			"CPPassword": mainNode.querySelector(".Gamma-Mask-CP-password"),

			"cellSize": mainNode.querySelector(".Gamma-Mask-cell-size").elements["cell-size"],

			"undo": mainNode.querySelector(".Gamma-Mask-undo"),
			"redo": mainNode.querySelector(".Gamma-Mask-redo"),
			"log": mainNode.querySelector(".Gamma-Mask-log")
		};

		this.nodes = nodes;

		// Load image

		let context = nodes.canvas.getContext("2d");

		nodes.canvas.width = image.width;
		nodes.canvas.height = image.height;

		context.drawImage(image, 0, 0);

		this.context = context;

		// Grid cell size

		let gridCellSize;

		let self = this;

		let updateGridCellSize = function () {
			gridCellSize = Number.parseInt(nodes.cellSize.value);

			self.gridCellSize = gridCellSize;
		};

		for (let i of nodes.cellSize) {
			i.addEventListener("change", updateGridCellSize);
		}

		updateGridCellSize();

		// Selection canvas

		this.selectedRectangle = null;

		let selectionContext = nodes.selection.getContext("2d");

		nodes.selection.width = nodes.canvas.width + 2;
		nodes.selection.height = nodes.canvas.height + 2;

		this.selectionContext = selectionContext;

		// Selection animation frames

		let frameSources = [
			"data:image/gif;base64,R0lGODdhCAAIAIABAAAAAP///ywAAAAACAAIAAACDYQRGadrzVRMB9FZ5SwAOw==",
			"data:image/gif;base64,R0lGODdhCAAIAIAAAAAAAP///ywAAAAACAAIAAACD4SDYZB6udpiaMJYsXuoAAA7",
			"data:image/gif;base64,R0lGODdhCAAIAIABAAAAAP///ywAAAAACAAIAAACDwSCYZeb6tBi0LRYaX2gAAA7",
			"data:image/gif;base64,R0lGODdhCAAIAIAAAAAAAP///ywAAAAACAAIAAACD0QeoJhq515b0KHI7KW1AAA7",
			"data:image/gif;base64,R0lGODdhCAAIAIABAAAAAP///ywAAAAACAAIAAACDYwDCadrzVRMB9FZ5SwAOw==",
			"data:image/gif;base64,R0lGODdhCAAIAIAAAAAAAP///ywAAAAACAAIAAACD4yBYJF6udpiaMJYsXuoAAA7",
			"data:image/gif;base64,R0lGODdhCAAIAIABAAAAAP///ywAAAAACAAIAAACD0yAYJeb6tBi0LRYaX2hAAA7",
			"data:image/gif;base64,R0lGODdhCAAIAIAAAAAAAP///ywAAAAACAAIAAACDwwOoZhq515b0KHI7KW1AAA7"
		];

		let frames = new Array(frameSources.length);

		for (let i = 0; i < frameSources.length; ++i) {
			frames[i] = selectionContext.strokeStyle;

			let frameImage = new Image();

			let load = function () {
				frames[i] = selectionContext.createPattern(this, "repeat");
			};

			frameImage.addEventListener("load", load);
			frameImage.src = frameSources[i];
		}

		// Selection painting

		let currentFrame = 0;
		let stopAnimation = true;
		let animationRunning = false;

		let clearFrame = function () {
			let rectangle = self.selectedRectangle;

			selectionContext.clearRect(rectangle[0], rectangle[1], rectangle[2] + 2, 1);
			selectionContext.clearRect(rectangle[0], rectangle[1] + rectangle[3] + 1, rectangle[2] + 2, 1);
			selectionContext.clearRect(rectangle[0], rectangle[1], 1, rectangle[3] + 2);
			selectionContext.clearRect(rectangle[0] + rectangle[2] + 1, rectangle[1], 1, rectangle[3] + 2);
		};

		let drawFrame = function () {
			let rectangle = self.selectedRectangle;

			selectionContext.strokeStyle = frames[currentFrame];
			selectionContext.strokeRect(rectangle[0] + .5, rectangle[1] + .5, rectangle[2] + 1, rectangle[3] + 1);
		};

		let animateSelection = function () {
			if (stopAnimation) {
				currentFrame = 0;

				animationRunning = false;
			} else {
				animationRunning = true;

				drawFrame();

				currentFrame = (currentFrame + 1) % frames.length;

				global.setTimeout(animateSelection, 125);
			}
		};

		let canvasWidth = nodes.canvas.width;
		let canvasHeight = nodes.canvas.height;

		let updateSelection = function (rectangle) {
			if (self.selectedRectangle !== null) {
				clearFrame();
			}

			self.selectedRectangle = rectangle;

			if (rectangle === null) {
				self.workingRectangle = [0, 0, canvasWidth, canvasHeight];

				stopAnimation = true;
			} else {
				self.workingRectangle = rectangle;

				drawFrame();

				stopAnimation = false;

				if (!animationRunning) {
					animateSelection();
				}
			}
		};

		// Selection

		updateSelection(null);

		let buttonPressed = false;
		let startPoint = null;
		let previousPoint = null;
		let previousClientPoint = null;

		let canvasNode = nodes.canvas;

		let select = function (event) {
			let point = null;

			if (event.type !== "scroll") {
				if (event.buttons !== 1) {
					buttonPressed = false;
				} else if (!buttonPressed && event.type === "mousedown") {
					let bounds = canvasNode.getBoundingClientRect();

					point = [
						Math.floor(Math.min(Math.max(event.clientX - bounds.left, 0), canvasWidth) / gridCellSize) * gridCellSize,
						Math.floor(Math.min(Math.max(event.clientY - bounds.top, 0), canvasHeight) / gridCellSize) * gridCellSize
					];

					buttonPressed = true;
					startPoint = point;
					previousPoint = point;
				}
			}

			if (buttonPressed) {
				let clientPoint = null;

				if (event.type === "scroll") {
					clientPoint = previousClientPoint;
				} else {
					event.preventDefault();
					nodes.field.focus();

					clientPoint = [event.clientX, event.clientY];
				}

				if (point === null) {
					let bounds = canvasNode.getBoundingClientRect();

					point = [
						Math.floor(Math.min(Math.max(clientPoint[0] - bounds.left, 0), canvasWidth) / gridCellSize) * gridCellSize,
						Math.floor(Math.min(Math.max(clientPoint[1] - bounds.top, 0), canvasHeight) / gridCellSize) * gridCellSize
					];
				}

				if (startPoint[0] === point[0] || startPoint[1] === point[1]) {
					updateSelection(null);
				} else if (previousPoint[0] !== point[0] || previousPoint[1] !== point[1]) {
					updateSelection([
						Math.min(startPoint[0], point[0]),
						Math.min(startPoint[1], point[1]),
						Math.abs(startPoint[0] - point[0]),
						Math.abs(startPoint[1] - point[1])
					]);
				}

				previousPoint = point;
				previousClientPoint = clientPoint;
			}
		};

		nodes.selectionWrapper.addEventListener("mousedown", select);
		mainNode.addEventListener("mousemove", select);
		mainNode.addEventListener("mouseup", select);
		nodes.field.addEventListener("scroll", select);

		// Filters

		let getNegativeParameters = function (rectangle) {
			let settings = {
				"R": nodes.negativeR.checked,
				"G": nodes.negativeG.checked,
				"B": nodes.negativeB.checked
			};

			let checked = Object.keys(settings).filter(function (i) {return settings[i]});

			if (checked.length === 0) {
				return null;
			} else {
				return [settings, "negative (" + checked.join(", ") + ")"];
			}
		};

		let getXor0x80Parameters = function (rectangle) {
			let settings = {
				"R": nodes.xor0x80R.checked,
				"G": nodes.xor0x80G.checked,
				"B": nodes.xor0x80B.checked
			};

			let checked = Object.keys(settings).filter(function (i) {return settings[i]});

			if (checked.length === 0) {
				return null;
			} else {
				return [settings, "xor 0x80 (" + checked.join(", ") + ")"];
			}
		};

		let getRotateParameters = function (rectangle) {
			let settings = {
				"order": nodes.rotateOrder.value
			};

			return [settings, "rotate (" + settings.order + ")"];
		};

		let getFlipUpDownParameters = function (rectangle) {
			return [{}, "flip up-down"];
		};

		let getFlipLeftRightParameters = function (rectangle) {
			return [{}, "flip left-right"];
		};

		let getWinParameters = function (rectangle) {
			return [{}, "Win"];
		};

		let getVerticalGlassParameters = function (rectangle) {
			let width = nodes.verticalGlassWidth.valueAsNumber;

			if (Number.isNaN(width) || width < 2 || width % 1 !== 0) {
				alert("Invalid width");

				return null;
			}

			let settings = {
				"width": width
			};

			return [settings, "vertical glass (" + width.toString() + ")"];
		};

		let getHorizontalGlassParameters = function (rectangle) {
			let height = nodes.horizontalGlassHeight.valueAsNumber;

			if (Number.isNaN(height) || height < 2 || height % 1 !== 0) {
				alert("Invalid height");

				return null;
			}

			let settings = {
				"height": height
			};

			return [settings, "horizontal glass (" + height.toString() + ")"];
		};

		let getQ0Parameters = function (rectangle) {
			let filters = [
				[nodes.Q0VerticalGlass, "verticalGlass", getVerticalGlassParameters],
				[nodes.Q0HorizontalGlass, "horizontalGlass", getHorizontalGlassParameters],
				[nodes.Q0Negative, "negative", getNegativeParameters],
				[nodes.Q0FlipUpDown, "flipUpDown", getFlipUpDownParameters],
				[nodes.Q0FlipLeftRight, "flipLeftRight", getFlipLeftRightParameters],
				[nodes.Q0Xor0x80, "xor0x80", getXor0x80Parameters]
			];

			let settings = {};
			let descriptions = [];

			for (let [node, name, getParameters] of filters) {
				if (node.checked) {
					let parameters = getParameters();

					if (parameters === null) {
						return null;
					}

					settings[name] = parameters[0];
					descriptions.push(parameters[1]);
				} else {
					settings[name] = null;
				}
			}

			if (descriptions.length === 0) {
				return null;
			} else {
				return [settings, "Q0 (" + descriptions.join(", ") + ")"];
			}
		};

		let getFLParameters = function (rectangle) {
			let settings = {
				"negative": nodes.FLNegative.checked
			};

			return [settings, "FL (" + (settings.negative ? "" : "without ") + "negative)"]
		};

		let checkMekoRectangle = function (rectangle) {
			return Math.floor(rectangle[2] / 16) * Math.floor(rectangle[3] / 16) <= GammaMask.MekoLookUp.length;
		};

		let getMekoMinusParameters = function (rectangle) {
			if (checkMekoRectangle(rectangle)) {
				return [{}, "Meko -"];
			} else {
				alert("Too big area");

				return null;
			}
		};

		let getMekoPlusParameters = function (rectangle) {
			if (checkMekoRectangle(rectangle)) {
				return [{}, "Meko +"];
			} else {
				alert("Too big area");

				return null;
			}
		};

		let getCPParameters = function (rectangle) {
			let password = nodes.CPPassword.value;

			if (!/^[a-zA-Z]{1,16}$/.test(password)) {
				alert("Invalid password format");

				return null;
			}

			let settings = {
				"password": password
			};

			return [settings, "CP (\"" + password + "\")"];
		};

		let filters = [
			[
				nodes.negative,
				GammaMask.filters.negative,
				GammaMask.reverseFilters.negative,
				getNegativeParameters
			],

			[
				nodes.xor0x80,
				GammaMask.filters.xor0x80,
				GammaMask.reverseFilters.xor0x80,
				getXor0x80Parameters
			],

			[
				nodes.rotate,
				GammaMask.filters.rotate,
				GammaMask.reverseFilters.rotate,
				getRotateParameters
			],

			[
				nodes.flipUpDown,
				GammaMask.filters.flipUpDown,
				GammaMask.reverseFilters.flipUpDown,
				getFlipUpDownParameters
			],

			[
				nodes.flipLeftRight,
				GammaMask.filters.flipLeftRight,
				GammaMask.reverseFilters.flipLeftRight,
				getFlipLeftRightParameters
			],

			[
				nodes.Win,
				GammaMask.filters.Win,
				GammaMask.reverseFilters.Win,
				getWinParameters
			],

			[
				nodes.verticalGlass,
				GammaMask.filters.verticalGlass,
				GammaMask.reverseFilters.verticalGlass,
				getVerticalGlassParameters
			],

			[
				nodes.horizontalGlass,
				GammaMask.filters.horizontalGlass,
				GammaMask.reverseFilters.horizontalGlass,
				getHorizontalGlassParameters
			],

			[
				nodes.Q0,
				GammaMask.filters.Q0,
				GammaMask.reverseFilters.Q0,
				getQ0Parameters
			],

			[
				nodes.FL,
				GammaMask.filters.FL,
				GammaMask.reverseFilters.FL,
				getFLParameters
			],

			[
				nodes.MekoMinus,
				GammaMask.filters.MekoMinus,
				GammaMask.reverseFilters.MekoMinus,
				getMekoMinusParameters
			],

			[
				nodes.MekoPlus,
				GammaMask.filters.MekoPlus,
				GammaMask.reverseFilters.MekoPlus,
				getMekoPlusParameters
			],

			[
				nodes.CP,
				GammaMask.filters.CP,
				GammaMask.reverseFilters.CP,
				getCPParameters
			]
		];

		let log = [];
		let logPointer = 0;

		let previousRectangle = null;
		let fragment = null;

		let doFilter = function (rectangle, filter, settings) {
			if (
				previousRectangle === null ||
				previousRectangle[0] !== rectangle[0] ||
				previousRectangle[1] !== rectangle[1] ||
				previousRectangle[2] !== rectangle[2] ||
				previousRectangle[3] !== rectangle[3]
			) {
				fragment = context.getImageData(
					rectangle[0],
					rectangle[1],
					rectangle[2],
					rectangle[3]
				);
			}

			filter(fragment, settings);

			context.putImageData(fragment, rectangle[0], rectangle[1]);
		};

		let moveLogPointer = function (newLogPointer) {
			if (logPointer > 0) {
				nodes.log.children[logPointer - 1].classList.remove("Gamma-Mask-current");
			}

			logPointer = newLogPointer;

			if (logPointer > 0) {
				nodes.log.children[logPointer - 1].classList.add("Gamma-Mask-current");
			}
		};

		let applyFilter = function (filter, reverseFilter, getParameters) {
			let rectangle = self.workingRectangle;
			let parameters = getParameters(rectangle);

			if (parameters === null) {
				return;
			}

			let [settings, description] = parameters;

			doFilter(rectangle, filter, settings);

			for (let i = logPointer; i < log.length; ++i) {
				nodes.log.removeChild(nodes.log.lastChild);
			};

			let entryNode = mainNode.ownerDocument.createElement("li");

			entryNode.textContent = (
				description.substr(0, 1).toUpperCase() + description.substr(1) +
				" [" + rectangle[0].toString() + "; " + rectangle[1].toString() + "]" +
				" " + rectangle[2].toString() + " × " + rectangle[3].toString()
			);

			nodes.log.appendChild(entryNode);

			log.splice(logPointer);
			log.push([rectangle, filter, reverseFilter, settings]);

			moveLogPointer(logPointer + 1);
		};

		let undo = function () {
			if (logPointer === 0) {
				return;
			}

			let [rectangle, filter, reverseFilter, settings] = log[logPointer - 1];

			doFilter(rectangle, reverseFilter, settings);

			moveLogPointer(logPointer - 1);
		};

		let redo = function () {
			if (logPointer === log.length) {
				return;
			}

			let [rectangle, filter, reverseFilter, settings] = log[logPointer];

			doFilter(rectangle, filter, settings);

			moveLogPointer(logPointer + 1);
		};

		for (let [node, filter, reverseFilter, getParameters] of filters) {
			node.addEventListener("click", applyFilter.bind(node, filter, reverseFilter, getParameters));
		}

		nodes.undo.addEventListener("click", undo);
		nodes.redo.addEventListener("click", redo);
	};

	Editor.prototype.getImage = function (callback) {
		this.nodes.canvas.toBlob(callback);
	};

	GammaMask.Editor = Editor;
}
