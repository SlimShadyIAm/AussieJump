const Gpio = require("onoff").Gpio;

// Pin numbers for connection with FPGA (!!JUMP STILL RANDOM!!)
const GPIORIGHT = 26;
const GPIOLEFT = 24;
const GPIOJUMP0 = 22;
const GPIOJUMP1 = 21;

// Configure GPIO's, and save them as objects for later use
const left = new Gpio(GPIOLEFT, "in", "both");
const right = new Gpio(GPIORIGHT, "in", "both");
const jump0 = new Gpio(GPIOJUMP0, "in", "both");
const jump1 = new Gpio(GPIOJUMP1, "in", "both");

const rightEventOff = new CustomEvent("sensorValue", {
	detail: { type: "right", value: false }
});
const leftEventOff = new CustomEvent("sensorValue", {
	detail: { type: "left", value: false }
});
const jumpEventOff = new CustomEvent("sensorValue", {
	detail: { type: "up", value: false }
});

const rightEventOn = new CustomEvent("sensorValue", {
	detail: { type: "right", value: true }
});
const leftEventOn = new CustomEvent("sensorValue", {
	detail: { type: "left", value: true }
});
const jumpEventOn = new CustomEvent("sensorValue", {
	detail: { type: "up", value: true }
});

// Watch GPIO pins, executed when value is changed
right.watch((err, value) => {
	if (err) {
		throw err;
	}
	if (value == 0) {
		//Notify the game the controller is not going right anymore
		document.dispatchEvent(rightEventOff);
	} else if (value == 1) {
		console.log("Go right");
		//Notify the game the controller is going right
		document.dispatchEvent(rightEventOn);
	}
});

left.watch((err, value) => {
	if (err) {
		throw err;
	}
	if (value == 0) {
		//Notify the game the controller is not going left anymore
		document.dispatchEvent(leftEventOff);
	} else if (value == 1) {
		console.log("Go left");
		//Notify the game the controller is going left
		document.dispatchEvent(leftEventOn);
	}
});

jump1.watch((err, value) => {
	if (err) {
		throw err;
	}
	if (value == 0) {
		//Notify the game the controller is not going up anymore
		document.dispatchEvent(jumpEventOff);
	} else if (value == 1) {
		console.log("Jump lvl 2");
		//Notify the game the controller is going up (level 2)
		document.dispatchEvent(jumpEventOn);
	}
});
