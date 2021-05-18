/*
 * Copyright (c) 2016-2021  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <https://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */

import Timer from "timer";
import parseBMP from "commodetto/parseBMP";
import parseBMF from "commodetto/parseBMF";
import Poco from "commodetto/Poco";
import Resource from "Resource";

import Module from "modules";

class FakeMeasure {
	constructor() {
		this.degrees = 60;
		this.bump = +1;
	}
	get name() {
		return "simulated";
	}
	get range() {
		return { hi: 110, lo: 60, div: 10 };
	}
	get units() {
		return "F";
	}
	temperature() {
		this.degrees += this.bump;
		if (this.degrees > 100) {
			this.degrees = 99;
			this.bump = -1;
		}
		else if (this.degrees < 60) {
			this.degrees = 60;
			this.bump = +1;
		}
		return this.degrees;	
	}
}

let measure;

try {
	if (Module.has("Measure")) {
		measure = new (Module.importNow("Measure"))();
		measure.temperature();
	}
}
catch (e) {
	trace(`Could not connect to sensor ${measure.name}\n`);
	measure = undefined;
}

if (undefined === measure) {
	// no mod
	measure = new FakeMeasure();
}

const range = measure.range;

trace(`Using temperature module "${measure.name}"\n`);
trace(`Range: ${range.hi} to ${range.lo} ${measure.units}\n`);

let render = new Poco(screen);

const white = render.makeColor(255, 255, 255);
const green = render.makeColor(0, 255, 0);
const red = render.makeColor(255, 0, 0);
const black = render.makeColor(0, 0, 0);
const backgroundColor = white;

let markerFont = parseBMF(new Resource("OpenSans-Regular-16.bf4"));
let titleFont = parseBMF(new Resource("OpenSans-Semibold-18.bf4"));
let thermo = parseBMP(new Resource("thermometer-color.bmp"));

const title = "Temperature";
const headerHeight = 30;
const barMargin = 20;
const barThickness = 20;

class VertThermo {
	constructor(dictionary) {
		Object.assign(this, dictionary);
		this.topGap = markerFont.height / 2;
		this.div = (this.pixelRange - this.topGap) / (this.hiTemp - this.loTemp);
	}
	tempToY(temp) {
		return this.y + this.div * (this.hiTemp - temp) + this.topGap;
	}
	drawTicks() {
		for (let i=this.loTemp; i<=this.hiTemp; i+=this.tempDiv) {
			let v = (this.hiTemp - i) + this.loTemp;
			let w = render.getTextWidth(v, markerFont);
			let y = this.tempToY(v);
			render.drawText(v, markerFont, black, this.x - 2 - w, y - (markerFont.height / 2) + 1);
			render.fillRectangle(this.tickColor, this.x, y, 10, 3);
		}
	}
	update(degrees) {
		const labelWidth = 30;
		const x = this.x - labelWidth;
		const degOffset = degrees - this.loTemp;
		const degRange = this.hiTemp - this.loTemp;
		let top = this.tempToY(degrees) - this.topGap/2 + 1;
		render.begin(x, this.y, this.width + labelWidth * 2, this.height);
//			render.fillRectangle(backgroundColor, x, this.y, this.width+1, this.height);
			render.fillRectangle(backgroundColor, 0, 0, render.width, render.height);
			render.drawBitmap(this.bitmap, this.x, this.y);
			render.fillRectangle(this.fillColor, this.x+13, top, 34, this.pixelRange - (top - this.y) + this.topGap);
			this.drawTicks();
			render.drawText(degrees, markerFont, black, this.x + this.width - 5, top - markerFont.height/2);
		render.end();
	}
}

let indicator = new VertThermo({
		x:(render.width - 60) >> 1, y:render.height - 248 - 5,
		width:61, height:248,
		pixelRange: 190,
		loTemp: range.lo,
		hiTemp: range.hi,
		tempDiv: range.div,
		bitmap:thermo, fillColor:red, tickColor:black
	});

/* title */

render.begin();
	render.fillRectangle(backgroundColor, 0, 0, render.width, render.height);
	render.drawText(title, titleFont, black, (render.width - render.getTextWidth(title, titleFont)) / 2, (headerHeight - titleFont.height) / 2);
	render.fillRectangle(black, 0, headerHeight + 2, render.width, 1);
	render.drawText(measure.name, titleFont, black, (render.width - render.getTextWidth(measure.name, titleFont)) / 2, headerHeight + 2 + (headerHeight - titleFont.height) / 2);
render.end();

Timer.repeat(() => {
	let degrees = measure.temperature();
	indicator.update(degrees);
}, 50);


