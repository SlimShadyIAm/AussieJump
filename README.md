# Group 02 Computer Systems

## Aussie Jump

### About

Aussie jump is a sidescroller game inspired by Flappy Bird and Google's T-Rex game on Chrome. It features an Australian theme, as the character you control is a kangaroo and you avoid cactuses which come at you from two sides at varying speeds. Use your arrow keys, or tilt the sensor to avoid the obstacles and get the highest score you can. Boing! Boing! Boing!

The game is written in Electron v6.1.2 and makes use of the `onoff` NPM package to support communication over GPIO with an FPGA, which is connected to an accelerometer. This gives the user the choice to control the game with a keyboard or motion controls.

_This project was made by:
Aamir Farooq
Danielle Kwakkel
Olaf Apeldoorn
Jeroen Scholten
Pieter de Regt
Hessel Akkerman_

## Instructions to set up

### Prerequisites:

You will need Node v12+ and NPM 6.0.0+ installed on your system. Also, the `onoff` module used for communication with the Pi requires `libgconf-2.4`, which can be installed with apt install `libgconf-2.4`.

1.`git clone https://git.snt.utwente.nl/AussieJump/game` to clone the repository

2.  `cd game`
3.  `npm install` install Node dependencies
4.  `./node_modules/.bin/electron-rebuild` rebuild `epoll`, needed for communication over GPIO
5.  `npm run start` start the game.
