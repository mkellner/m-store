
//const SENSOR_NAME = "LM75";
//const USE_FARENHEIT = true;
//const RANGE_HI_F = 110;
//const RANGE_LO_F = 60;
//const RANGE_HI_C = 45;
//const RANGE_LO_C = 15;

import Temperature from "embedded:sensor/SENSOR_NAME";

class Measure {
	#sensor;
	constructor() {
		this.#sensor = new Temperature({...device.I2C.default});
	}
	get name() {
		return "SENSOR_NAME";
	}
	get range() {
		if (USE_FARENHEIT)
			return { hi: RANGE_HI_F, lo: RANGE_LO_F, div: 10 };
		else
			return { hi: RANGE_HI_C, lo: RANGE_LO_C, div: 5 };
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

