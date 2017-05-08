"use strict";

{
	let global = this;
	let GammaMask = global.GammaMask;

	let xor = function (fragment, R, G, B, mask) {
		R = R ? mask : 0;
		G = G ? mask : 0;
		B = B ? mask : 0;

		for (let i = 0; i < fragment.data.length; i += 4) {
			fragment.data[i] ^= R;
			fragment.data[i + 1] ^= G;
			fragment.data[i + 2] ^= B;
		}
	};

	let negativeFilter = function (fragment, settings) {
		xor(fragment, settings.R, settings.G, settings.B, 0xff);
	};

	let xor0x80Filter = function (fragment, settings) {
		xor(fragment, settings.R, settings.G, settings.B, 0x80);
	};

	let rotate = function (fragment, order) {
		switch (order) {
			case "RGB": {
				for (let i = 0; i < fragment.data.length; i += 4) {
					let temp = fragment.data[i + 2];
					fragment.data[i + 2] = fragment.data[i + 1];
					fragment.data[i + 1] = fragment.data[i];
					fragment.data[i] = temp;
				}
			} break;

			case "BGR": {
				for (let i = 0; i < fragment.data.length; i += 4) {
					let temp = fragment.data[i];
					fragment.data[i] = fragment.data[i + 1];
					fragment.data[i + 1] = fragment.data[i + 2];
					fragment.data[i + 2] = temp;
				}
			} break;

			case "RG": {
				for (let i = 0; i < fragment.data.length; i += 4) {
					let temp = fragment.data[i + 1];
					fragment.data[i + 1] = fragment.data[i];
					fragment.data[i] = temp;
				}
			} break;

			case "GB": {
				for (let i = 0; i < fragment.data.length; i += 4) {
					let temp = fragment.data[i + 2];
					fragment.data[i + 2] = fragment.data[i + 1];
					fragment.data[i + 1] = temp;
				}
			} break;

			case "RB": {
				for (let i = 0; i < fragment.data.length; i += 4) {
					let temp = fragment.data[i + 2];
					fragment.data[i + 2] = fragment.data[i];
					fragment.data[i] = temp;
				}
			}
		}
	};

	let rotateFilter = function (fragment, settings) {
		rotate(fragment, settings.order);
	};

	let unrotateFilter = function (fragment, settings) {
		if (settings.order === "RGB") {
			rotate(fragment, "BGR");
		} else {
			rotate(fragment, settings.order);
		}
	};

	let flipUpDown = function (fragment, top, height) {
		let width = fragment.width * 4;

		top *= width;
		height *= width;

		for (
			let one = top, two = top + height - width;
			one < top + height / 2;
			one += width, two -= width
		) {
			for (let x = 0; x < width; ++x) {
				let temp = fragment.data[one + x];
				fragment.data[one + x] = fragment.data[two + x];
				fragment.data[two + x] = temp;
			}
		}
	};

	let flipLeftRight = function (fragment, left, width) {
		left *= 4;
		width *= 4;

		for (let y = 0; y < fragment.height * fragment.width * 4; y += fragment.width * 4) {
			for (
				let one = left, two = left + width - 4;
				one < left + width / 2;
				one += 4, two -= 4
			) {
				let temp = fragment.data[y + one];
				fragment.data[y + one] = fragment.data[y + two];
				fragment.data[y + two] = temp;

				temp = fragment.data[y + one + 1];
				fragment.data[y + one + 1] = fragment.data[y + two + 1];
				fragment.data[y + two + 1] = temp;

				temp = fragment.data[y + one + 2];
				fragment.data[y + one + 2] = fragment.data[y + two + 2];
				fragment.data[y + two + 2] = temp;

				temp = fragment.data[y + one + 3];
				fragment.data[y + one + 3] = fragment.data[y + two + 3];
				fragment.data[y + two + 3] = temp;
			}
		}
	};

	let flipUpDownFilter = function (fragment, settings) {
		flipUpDown(fragment, 0, fragment.height);
	};

	let flipLeftRightFilter = function (fragment, settings) {
		flipLeftRight(fragment, 0, fragment.width);
	};

	let WinFilter = function (fragment, settings) {
		let temp = new Uint8ClampedArray(fragment.data);

		let width = fragment.width * 4;
		let height = fragment.height * width;

		for (let y = 0; y < height; y += width) {
			for (let x = 0; x <= width - 64; x += 64) {
				let index = y + x;

				fragment.data[index++] = temp[index + 47];
				fragment.data[index++] = temp[index + 47];
				fragment.data[index++] = temp[index + 47];
				fragment.data[index++] = temp[index + 47];

				fragment.data[index++] = temp[index + 27];
				fragment.data[index++] = temp[index + 27];
				fragment.data[index++] = temp[index + 27];
				fragment.data[index++] = temp[index + 27];

				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];

				fragment.data[index++] = temp[index + 47];
				fragment.data[index++] = temp[index + 47];
				fragment.data[index++] = temp[index + 47];
				fragment.data[index++] = temp[index + 47];

				fragment.data[index++] = temp[index + 19];
				fragment.data[index++] = temp[index + 19];
				fragment.data[index++] = temp[index + 19];
				fragment.data[index++] = temp[index + 19];

				fragment.data[index++] = temp[index + 31];
				fragment.data[index++] = temp[index + 31];
				fragment.data[index++] = temp[index + 31];
				fragment.data[index++] = temp[index + 31];

				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];

				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];

				fragment.data[index++] = temp[index - 29];
				fragment.data[index++] = temp[index - 29];
				fragment.data[index++] = temp[index - 29];
				fragment.data[index++] = temp[index - 29];

				fragment.data[index++] = temp[index - 21];
				fragment.data[index++] = temp[index - 21];
				fragment.data[index++] = temp[index - 21];
				fragment.data[index++] = temp[index - 21];

				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];
				fragment.data[index++] = temp[index + 15];

				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];

				fragment.data[index++] = temp[index - 49];
				fragment.data[index++] = temp[index - 49];
				fragment.data[index++] = temp[index - 49];
				fragment.data[index++] = temp[index - 49];

				fragment.data[index++] = temp[index - 33];
				fragment.data[index++] = temp[index - 33];
				fragment.data[index++] = temp[index - 33];
				fragment.data[index++] = temp[index - 33];

				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];
				fragment.data[index++] = temp[index - 17];

				fragment.data[index++] = temp[index - 49];
				fragment.data[index++] = temp[index - 49];
				fragment.data[index++] = temp[index - 49];
				fragment.data[index] = temp[index - 48];
			}
		}
	};

	let verticalGlassFilter = function (fragment, settings) {
		let width = settings.width;

		for (let i = 0; i < fragment.width; i += width) {
			flipLeftRight(fragment, i, fragment.width - i >= width ? width : fragment.width - i);
		}
	};

	let horizontalGlassFilter = function (fragment, settings) {
		let height = settings.height;

		for (let i = 0; i < fragment.height; i += height) {
			flipUpDown(fragment, i, fragment.height - i >= height ? height : fragment.height - i);
		}
	};

	let Q0Filter = function (fragment, settings) {
		let filters = [
			["verticalGlass", verticalGlassFilter],
			["horizontalGlass", horizontalGlassFilter],
			["negative", negativeFilter],
			["flipUpDown", flipUpDownFilter],
			["flipLeftRight", flipLeftRightFilter],
			["xor0x80", xor0x80Filter]
		];

		for (let i of filters) {
			let filterSettings = settings[i[0]];

			if (filterSettings !== null) {
				i[1](fragment, filterSettings);
			}
		}
	};

	let FLFilter = function (fragment, settings) {
		let width = Math.floor(fragment.width / 8);
		let height = Math.floor(fragment.height / 8);
		let length = width * height;

		if (settings.negative) {
			for (let y = 0; y < fragment.width * height * 32; y += fragment.width * 4) {
				for (let x = 0; x < width * 32; x += 4) {
					fragment.data[y + x] ^= 0xff;
					fragment.data[y + x + 1] ^= 0xff;
					fragment.data[y + x + 2] ^= 0xff;
				}
			}
		}

		let spiral = new Array(Math.floor(length / 2));

		let x = -1, y = --height, dx = 1, dy = 0;

		for (let i = 0; i < length;) {
			let line = dx ? width-- : height--;

			for (let k = 0; k < line; ++k) {
				let one = ((x += dx) + (y += dy) * fragment.width) * 32;

				if (i < length / 2) {
					spiral[i] = one;
				} else {
					let two = spiral[length - i - 1];

					for (let j = 0; j < 8; ++j) {
						for (let l = 0; l < 32; ++l) {
							let temp = fragment.data[one + l];
							fragment.data[one + l] = fragment.data[two + l];
							fragment.data[two + l] = temp;
						}

						one += fragment.width * 4;
						two += fragment.width * 4;
					}
				}

				++i;
			}

			let temp = dy;
			dy = -dx;
			dx = temp;
		}
	};

	let Meko = function (fragment, plus) {
		let width = Math.floor(fragment.width / 16);
		let height = Math.floor(fragment.height / 16);

		let temp = new Uint8ClampedArray(fragment.data);

		let order = GammaMask.MekoLookUp.slice(0, width * height).sort(function (a, b) {return a - b;});

		for (let i = 0; i < order.length; ++i) {
			let from, to = (Math.floor((order[i] & 0x3fff) / width) * fragment.width + (order[i] & 0x3fff) % width) * 64;

			if (plus) {
				from = to;
				to = (Math.floor(i / width) * fragment.width + i % width) * 64;
			} else {
				from = (Math.floor(i / width) * fragment.width + i % width) * 64;
			}

			for (let y = 0; y < 16; ++y) {
				for (let x = 0; x < 64; x += 4) {
					fragment.data[to + x] = 255 - temp[from + x];
					fragment.data[to + x + 1] = 255 - temp[from + x + 1];
					fragment.data[to + x + 2] = 255 - temp[from + x + 2];
					fragment.data[to + x + 3] = temp[from + x + 3];
				}

				from += fragment.width * 4;
				to += fragment.width * 4;
			}
		}
	};

	let MekoMinusFilter = function (fragment, settings) {
		Meko(fragment, false);
	};

	let MekoPlusFilter = function (fragment, settings) {
		Meko(fragment, true);
	};

	let CPFilter = function (fragment, settings) {
		let password = settings.password.toLowerCase(), key = [];

		for (let i = 0; i < password.length; ++i) {
			key.push(password.charCodeAt(i) - 97);

			key[i] = [
				16, 23, 19, 21, 9, 8, 10, 20, 6, 5, 22, 2, 13,
				3, 1, 4, 25, 12, 15, 14, 18, 7, 11, 24, 17, 26
			][key[i]];
		}

		let width = Math.floor(fragment.width / 8);
		let height = Math.floor(fragment.height / 8);
		let length = width * height;

		let order = new Array(length);

		for (let i = 0; i < length; ++i) order[i] = -1;

		let x = length - 1;
		let y = key.length + length % key.length;

		for (let i = 0; i < length; ++i, ++y) {
			x = (key[i % key.length] + x + y) % length;

			while (order[x] !== -1) x = (i & 1 ? x + length - 1 : x + 1) % length;

			order[x] = i;
		}

		for (let i = 0; i < order.length / 2; ++i) {
			let one = order[i];
			let two = order[order.length - i - 1];
			let flip = (one ^ two) & 1;

			one = (Math.floor(one / width) * fragment.width + one % width) * 32;
			two = (Math.floor(two / width) * fragment.width + two % width) * 32;

			for (let j = 1; j < 65; ++j) {
				let temp = fragment.data[one];
				let ephem = fragment.data[one + 1];

				fragment.data[one + 1] = fragment.data[two] ^ 0xff;
				fragment.data[one] = fragment.data[two + 1] ^ 0xff;
				fragment.data[two + 1] = temp ^ 0xff;
				fragment.data[two] = ephem ^ 0xff;

				temp = fragment.data[one + 2];
				fragment.data[one + 2] = fragment.data[two + 2] ^ 0xff;
				fragment.data[two + 2] = temp ^ 0xff;

				temp = fragment.data[one + 3];
				fragment.data[one + 3] = fragment.data[two + 3];
				fragment.data[two + 3] = temp;

				one += j % 8 ? 4 : fragment.width * 4 - 28;
				two += flip ? (
					j % 8 ? fragment.width * 4 : 4 - fragment.width * 28
				) : (
					(j % 8 === 0) * (fragment.width * 4 - 32) + 4
				);
			}
		}
	};

	let filters = {
		"negative": negativeFilter,
		"xor0x80": xor0x80Filter,
		"rotate": rotateFilter,
		"flipUpDown": flipUpDownFilter,
		"flipLeftRight": flipLeftRightFilter,
		"Win": WinFilter,
		"verticalGlass": verticalGlassFilter,
		"horizontalGlass": horizontalGlassFilter,
		"Q0": Q0Filter,
		"FL": FLFilter,
		"MekoMinus": MekoMinusFilter,
		"MekoPlus": MekoPlusFilter,
		"CP": CPFilter
	};

	let reverseFilters = {
		"negative": negativeFilter,
		"xor0x80": xor0x80Filter,
		"rotate": unrotateFilter,
		"flipUpDown": flipUpDownFilter,
		"flipLeftRight": flipLeftRightFilter,
		"Win": WinFilter,
		"verticalGlass": verticalGlassFilter,
		"horizontalGlass": horizontalGlassFilter,
		"Q0": Q0Filter,
		"FL": FLFilter,
		"MekoMinus": MekoPlusFilter,
		"MekoPlus": MekoMinusFilter,
		"CP": CPFilter
	};

	GammaMask.filters = filters;
	GammaMask.reverseFilters = reverseFilters;
}
