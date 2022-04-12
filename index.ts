#!/usr/bin/env node

let clivas = require('clivas');
let keypress = require('keypress');

let WIDTH = 15;
let HEIGHT = 20;

clivas.alias('box-color', 'inverse+cyan');
clivas.alias('full-width', 2*WIDTH+4);
clivas.flush(false);
clivas.cursor(false);

'black white blue yellow green magenta'.split(' ').forEach(function(color, i) {
	clivas.alias('color-'+i, '2+inverse+'+color);
});

let NUMBERS = [
	[
		'xxx',
		'x x',
		'x x',
		'x x',
		'xxx'
	],[
		'  x',
		'  x',
		'  x',
		'  x',
		'  x'
	],[
		'xxx',
		'  x',
		'xxx',
		'x  ',
		'xxx'
	],[
		'xxx',
		'  x',
		'xxx',
		'  x',
		'xxx'
	],[
		'x x',
		'x x',
		'xxx',
		'  x',
		'  x'
	],[
		'xxx',
		'x  ',
		'xxx',
		'  x',
		'xxx'
	],[
		'xxx',
		'x  ',
		'xxx',
		'x x',
		'xxx'
	],[
		'xxx',
		'  x',
		'  x',
		'  x',
		'  x'
	],[
		'xxx',
		'x x',
		'xxx',
		'x x',
		'xxx'
	],[
		'xxx',
		'x x',
		'xxx',
		'  x',
		'  x'
	]
];

let FIGURES = [
	[
		[0,1,0],
		[0,1,0],
		[1,1,0]
	],[
		[false,1,0],
		[false,1,0],
		[false,1,1]
	],[
		[1,1,0],
		[0,1,1],
		[0,0,0]
	],[
		[0,1,1],
		[1,1,0],
		[0,0,0]
	],[
		[0,0,0,0],
		[1,1,1,1],
		[0,0,0,0],
		[0,0,0,0]
	],[
		[1,1],
		[1,1]
	],[
		[0,1,0],
		[1,1,1],
		[0,0,0]
	]
];

let nextFigure = (Math.random()*FIGURES.length)|0;
let nextColor = 1+((Math.random()*5)|0);

let selectFigure = function() {
	figure = FIGURES[nextFigure];
	nextFigure = (Math.random()*FIGURES.length)|0;
	for (let i = 0; i < figure.length; i++) {
		for (let j = 0; j < figure.length; j++) {
			figure[i][j] = figure[i][j] && nextColor;
		}
	}
	nextColor = 1+((Math.random()*5)|0);
	y = -figure.length;
	x = ((WIDTH / 2) - (figure.length / 2)) | 0;

	let btm = figure.length-1;

	while (allEmpty(figure[btm])) {
		y++;
		btm--;
	}
};
let getScore = function() {
	let color = 1+(((score / 100)|0)%5);

	return ('00000'.substring(score.toString().length)+score.toString()).split('').map(function(d) {
		let num = NUMBERS[d];
		return num;
	}).reduce(function(result, value) {
		value.forEach(function(line, i) {
			result[i] = (result[i] ? result[i] + ' ' : '');
			result[i] += ' '+line.replace(/x/g, '{2+color-'+color+'}').replace(/ /g, '  ');
		});
		return result;
	}, []);
};

let board = [];
let x = 0;
let y = 0;
let figure;
let score = 0;

for (let i = 0; i < HEIGHT; i++) {
	board[i] = [];
	for (let j = 0; j < WIDTH; j++) {
		board[i][j] = 0;
	}
}

let rotateFigureMutation = function(dir) {
	let result = [];
	for (let i = 0; i < figure.length; i++) {
		for (let j = 0; j < figure[i].length; j++) {
			let y = dir === 1 ? j : figure.length-j-1;
			let x = dir === 1 ? figure.length-1-i : i;
			result[y] = result[y] || [];
			result[y][x] = figure[i][j];
		}
	}
	figure = result;
};
let addFigureMutation = function(draw) {
	for (let i = 0; i < figure.length; i++) {
		for (let j = 0; j < figure[i].length; j++) {
			let py = y+i;
			let px = x+j;
			if (figure[i][j] && (px < 0 || px >= WIDTH)) return false;
			if (py < 0) continue;
			if (!figure[i][j]) continue;
			if (!board[py] || board[py][px] || board[py][px] === undefined) return false;
			if (!draw) continue;
			board[py][px] = figure[i][j] || board[py][px];
		}
	}
	return draw ? true : addFigureMutation(true);
};
let removeFigureMutation = function() {
	for (let i = 0; i < figure.length; i++) {
		for (let j = 0; j < figure[i].length; j++) {
			let py = y+i;
			let px = x+j;
			if (px < 0) continue;
			if (!figure[i][j] || !board[py] || board[py][px] === undefined) continue;
			board[py][px] = 0;
		}
	}
};

let line = function() {
	let arr = [];
	for (let i = 0; i < WIDTH; i++) {
		arr[i] = 0;
	}
	return arr;
};
let allEmpty = function(arr) {
	return !arr.some(function(val) {
		return val;
	});
};
let hasEmpty = function(arr) {
	return arr.some(function(val) {
		return !val;
	});
};
let moveFigure = function(dx,dy) {
	removeFigureMutation();
	x += dx;
	y += dy;
	if (addFigureMutation()) return draw();
	x -= dx;
	y -= dy;
	addFigureMutation();
	draw();
};
let rotateFigure = function(dir) {
	removeFigureMutation();
	rotateFigureMutation(dir);
	if (addFigureMutation()) return draw();
	rotateFigureMutation(-dir);
	addFigureMutation();
};
let removeLines = function() {
	let modifier = 0;
	for (let i = 0; i < board.length; i++) {
		if (hasEmpty(board[i])) continue;
		board.splice(i,1);
		board.unshift(line());
		if (!modifier) {
			modifier += 150;
		}
		modifier *= 2;
		speed += 10;
	}
	score += modifier;
};

let draw = function() {
	clivas.clear();

	let scoreDraw = getScore();

	clivas.line('');
	clivas.line(' {full-width+box-color}');

	for (let i = 0; i < HEIGHT; i++) {
		let line = '{color-'+board[i].join('}{color-')+'}';
		let padding = '              ';

		if (i > 3 && scoreDraw[i-4]) {
			padding = '  '+scoreDraw[i-4];
		}
		if (i > 10 && FIGURES[nextFigure][i-11]) {
			padding = '   '+FIGURES[nextFigure][i-11].join('').replace(/false/g, '').replace(/0/g, '  ').replace(/[1-9]/g, '{2+color-'+nextColor+'}')+'    ';
		}

		clivas.line(' {2+box-color}'+line+'{2+box-color}'+padding);
	}

	clivas.line(' {full-width+box-color}   {green:tetris} {bold:'+require('./package.json').version+'} {green:by} {bold:@EloneHoo}');
	clivas.line('');
	return true;
};

let loop = function() {
	if (moveFigure(0,1)) return setTimeout(loop, speed);
	removeLines();
	if (y < 0) {
		clivas.alias('box-color', 'inverse+red');
		draw();
		process.exit(0);
		return;
	}
	selectFigure();
	setTimeout(loop, speed);
};

let speed = 600;

setInterval(function() {
	speed -= 20;
	speed = Math.max(speed, 50);
}, 10000);

setTimeout(loop, speed);

selectFigure();
addFigureMutation();
draw();

keypress(process.stdin);

process.stdin.on('keypress', function(ch, key) {
	if (key.name === 'c' && key.ctrl) return process.exit(0);
	if (key.name === 'right' || key.name === 'l') {
		moveFigure(1, 0);
	}
	if (key.name === 'left' || key.name === 'h') {
		moveFigure(-1, 0);
	}
	if (key.name === 'down' || key.name === 'j') {
		if (moveFigure(0, 1)) {
			score++;
		}
	}
	if (key.name === 'up' || key.name === 'k') {
		rotateFigure(1);
	}
	if (key.name === 'space' || (key.name === 'g' && key.shift)) {
		while (moveFigure(0, 1)) {
			score++;
		}
	}
});
process.stdin.resume();

try {
	process.stdin.setRawMode(true);
} catch (err) {
	require('tty').setRawMode(true);
}
