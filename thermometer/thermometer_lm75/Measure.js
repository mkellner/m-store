
const SENSOR_NAME = "LM75";
const USE_FARENHEIT = true;

import device from "embedded:provider/builtin";
import Temperature from "embedded:sensor/LM75";

class Measure {
	#sensor;
	constructor() {
		this.#sensor = new Temperature({...device.I2C.default});
	}
	get name() {
		return SENSOR_NAME;
	}
	temperature() {
		let value = this.#sensor.sample();
		let degrees;

		if (USE_FARENHEIT)
			degrees = (value.temperature * 1.8) + 32.0;
		else
			degrees = value.temperature;

		return degrees;
	}
}

export default Measure;

