const Gpio = require('onoff').Gpio;

// Pin numbers for connection with FPGA (!!RANDOM RIGHT NOW!!)
const GPIORIGHT = 23;
const GPIOLEFT = 24;

const left = new Gpio(GPIOLEFT, 'in', 'both');
const right = new Gpio(GPIORIGHT, 'in', 'both');

console.log("Testing");
// Watch GPIO pins, executed when value is changed
right.watch((err, value) => {
    if (err) {
        throw err;
    }
    if (value = 1) {
        console.log("go right");
    } 
});

left.watch((err, value) => {
    if (err) {
        throw err;
    }
    if (value = 1) {
        console.log("go left");
    }
});