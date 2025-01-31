const settings = {
	volume: {
		sounds: 0.5,
		music: 0.5,
	},
	difficulty: 0
},
	  keybindings = {
		  left: "a",
		  right: "d",
		  shot: "space",
		  pause: "escape"
	  },
	  keyboard = {},
	  avHeight = document.documentElement.clientHeight-150,
	  avWidth = document.documentElement.clientWidth-80,
	  board = document.querySelector("#board"),
	  backgrounds = shuffle([
		["https://i.pinimg.com/originals/1d/15/d8/1d15d8da8b3b6f3a895828ba2663f409.gif", "cover", "Lazurowe Wody"],
		["https://i.pinimg.com/originals/c6/a2/fb/c6a2fb8cd65edc585019348f6aa48e45.gif", "cover", "Ocean Bezkresny"],
		["https://cliply.co/wp-content/uploads/2019/12/401912580_BLACK_LIQUID_400px.gif", "cover", "Ciemna Masa"],
		["https://64.media.tumblr.com/578466e9288df0498dadf95908ad4365/tumblr_p8fazwc7OH1viuar9o1_1280.gif", "cover", "Nocna Rafa"]
	  ]),
	  background_audio = [
		new Audio,
		new Audio
	  ];
	  
background_audio[1].src = './res/sfx/background.mp3';
background_audio[1].loop = true;

background_audio[0].src = './res/sfx/music.mp3';
background_audio[0].loop = true;

function start_playing()
{
	try
	{
		background_audio[0].volume = settings.volume.music;
		background_audio[1].volume = settings.volume.music * 0.8;
		background_audio[0].play();
		background_audio[1].play();
	}
	catch(error)
	{
		console.log('Cannot play!');
		start_playing();
	}
}

function stop_playing()
{
	background_audio[1].pause();
	background_audio[1].currentTime = 0;
	
	background_audio[0].pause();
	background_audio[0].currentTime = 0;
}

function shuffle(arr)
{
	let res = [],
		got = [];
	for(let i=0; i<arr.length; i++)
	{
		let rand;
		do
		{
			rand = Math.floor(Math.random()*arr.length)
		}
		while(got.includes(rand));
		res.push(arr[rand]);
		got.push(rand);
	}
	return res;
}

let level = 1,
	entities,
	idGivers,
	timer,
	wantedProducers,
	pause,
	gameInterval,
	timerInterval;

{
	function keyboardController(ev)
	{
		let key = ev.key == ' ' ? "space" : ev.key.toLowerCase();
		if(key.startsWith("arrow")) key = key.substring(5);
		if(!/^([0-9]|[a-z]|escape|space|up|left|right|down)$/.test(key)) return;
		
		if(key == keybindings.pause && ev.type == 'keydown' && gameInterval){
			pause = !pause;
			document.querySelector("#game").querySelector(".timer").innerHTML = ["<span class='timer-pause'>Pauza</span>",`<span class='timer-num'>00</span><span class='timer-sep'>:</span><span class='timer-num'>00</span><span class='timer-sep'>:</span><span class='timer-num'>00</span>`][Number(!pause)]
		}
		
		if(ev.type == 'keyup' && keyboard[key])
			delete keyboard[key];
		else if(ev.type == 'keydown')
			keyboard[key] = true;
	}
	document.addEventListener("keydown", keyboardController);
	document.addEventListener("keyup", keyboardController);
}

Math.radians = function(degrees){
	return degrees * Math.PI / 180; 
}

function distance(a, b)
{
	let x1 = a.x + (a.w/2),
		x2 = b.x + (b.w/2),
		y1 = a.y + (a.h/2),
		y2 = b.y + (a.h/2);
		
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function createCounter()
{
	let i = -1;
	return (readonly) => {
		if(readonly) return i;
		else return ++i
	};
}

function refreshClocks()
{
	function pad(t, n){
		if(t < 0) t = Math.abs(t);
		let res = "";
		for(let i = 0; i < n; i++)
			if(t < Math.pow(10, i))
				res += "0";
		return (t > 0 ? res + t : res);
	};
	let s = timer(true)
	let h = Math.floor(s/3600); s%=3600;
	let m = Math.floor(s/60); s%=60;
	
	outputs = Array.from(document.querySelectorAll(".timer-num"));
	
	for(let i = 0; i < outputs.length; i += 3)
	{
		outputs[i].innerText = pad(h, 2);
		outputs[i+1].innerText = pad(m, 2);
		outputs[i+2].innerText = pad(s, 2);
	}
}

function initializeGame()
{	
	if(gameInterval || timerInterval) return;
	entities = [];
	idGivers = {
		ship: createCounter(),
		oar: createCounter(),
		pwrUp: createCounter()
	};
	timer = createCounter();
	
	{
		const bg = backgrounds[Math.ceil((level-1)/5) % backgrounds.length],
			  gm = document.querySelector("#game");
			  
		gm.style.backgroundImage = `url('${bg[0]}')`;
		gm.style.backgroundSize = bg[1];
		
		document.querySelector("#level").innerText = `Poziom ${level}:`;
		document.querySelector("#level-name").innerText = bg[2];
	}
	
	new Ship(5, 5)
	startGame();
	return true;
}