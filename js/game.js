let clear_comment;

function clearComment(fromTimeout)
{
	const box = document.querySelector('#comment-box');

	if(!box) return;


	if(!fromTimeout) clearTimeout(clear_comment);
	clear_comment = undefined;

	box.innerHTML = '';
	box.style.color = '#000';
}

function writeComment(str, color, src)
{
	const box = document.querySelector('#comment-box');

	if(!box) return;
	clearComment();

	box.innerHTML = str;
	box.style.color = color;

	clear_comment = setTimeout(() => clearComment(true), 5_000)

	if(src)
	{
		let audio = new Audio;
		audio.src = src;
		audio.volume = settings.volume.sounds;
		audio.play();
	}
}

function refreshBars (entity)
{
	const stats = Array.from(document.querySelectorAll(".stat")).map(el => [el.querySelector("canvas"), el.querySelector("span")]),
		  values = [entity.hp/(entity.hpLimit ?? 100) * 100, entity.oars, entity.producers/((level+1)*5) * 100];
		  
	for(let [canvas, span] of stats){
		const ctx = canvas.getContext('2d'),
			  cellWidth = (canvas.width - (20 * 2))/20,
			  cellHeight = canvas.height,
			  value = values.shift();
		
		ctx.clearRect(0,0,canvas.width,canvas.height);
		ctx.beginPath();
		for(let i = 0; i < 20; i++)
		{
			if(i < value/5)
				ctx.fillStyle = value > 100 ? '#0f0' : ["#f00", "#f80", "#ff0", "#0f0"][Math.ceil(value/25)-1] + 'a';
				
			else
				ctx.fillStyle = '#333a';
			ctx.fillRect(i*2 + i*cellWidth, 0, cellWidth, cellHeight);
		}
		ctx.closePath();
		span.innerText = Math.round(value);
	}
}

function refreshPowerUp (entity) {
	const canvas = document.querySelector("#powerup-state"),
		  ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height);
	
	const stats = [entity.special, entity.effect];
	for(let i = 0; i < 2; i++)
	{
		const stat = stats[i];
		if(stat)
		{
			let img = Object.assign(new Image, { src: `./res/pwr-up-${stat.id}.png` }),
				percent = (stat.end - new Date().getTime())/[30_000, 45_000][i];
			
			ctx.beginPath();
			ctx.strokeStyle = ["#f00", "#f90", "#ff0", "#0f0"][Math.floor(percent*4)] || "#0f0";
			ctx.lineWidth = 2;
			ctx.arc(20,(i+1) * 20 + i*20, 15, 0, 2 * Math.PI * percent, false);
			ctx.stroke();
			ctx.drawImage(img, 6, (i+1) * 6 + i*35, 28, 28);
			ctx.closePath();
		}
	}
}

function refreshFilterFrame()
{
	const ff = document.querySelector("#filter-frame"),
		  entity = entities.find(el => el instanceof Ship && el.player);
		  
	if(entity?.effect?.id && entity.producers/((level+1)*5) * 100 < 100)
	{
		let color = ['#f00', false, '#00f', '#0f0'][entity.effect.id-2];
		ff.classList.replace("hidden", "active");
		ff.style.backgroundColor = color  + '8';
		ff.style.boxShadow = `0 0 100px 200px ${color} inset`;
	}
	else if(ff.classList.contains("active")) ff.classList.replace("active", "hidden");
}

function startGame()
{
		start_playing();
		gameInterval = setInterval(movement, 1000/60);
		timerInterval = setInterval(() => {
			const time = timer();
			refreshClocks();
			if(time%3 == 0 && entities.filter(el => el instanceof Ship).map(el => el.producers).reduce((a,b) => a+b) <= level*5) new Ship(Math.floor(Math.random()*avWidth),avHeight);
		}, 1000);
}

function movement()
{
	if(pause) return;
	refreshFilterFrame();
	if(!entities.some(el => el instanceof Ship && el.player)) return lose();
	if(entities.find(el => el instanceof Ship && el.player).producers == (level+1)*5) return win();
	for(let entity of entities) switch(true)
	{
		case entity instanceof Ship && entity.player:
		{	
			if(keyboard[keybindings.left]) entity.rotate(true);
			else if(keyboard[keybindings.right]) entity.rotate(false);
			if(keyboard[keybindings.shot]) entity.shot();
			
			entity.move();
			entity.refreshTag();
			if(entity.hp <= 0) entity.destroy();
			
			refreshBars(entity);
			refreshPowerUp(entity);
		}
		break;
		case entity instanceof Ship && !entity.player:
		{
			if(!entities.some(el => el.id == this.id) || el.target instanceof Bullet) entity.setTarget();
			
			entity.move();
			
			let x1 = entity.x,
				x2 = entity.target.x,
				y1 = entity.y,
				y2 = entity.target.y;
			
			const dirX = x2 - x1,
				  dirY = y2 - y1,
				  angle = (360 + Math.atan2(dirY, dirX) * 180 / Math.PI) % 360;
			
			{
				let ang1 = Math.round(angle),
					ang2 = entity.rotation;
				
				entity.rotate(ang1 - ang2 < 0)
			}
			
			entity.refreshTag();
			entity.shot();
		}
		break;
		case entity instanceof Bullet:
		{
			entity.move();
			const col = entity.collision();
			if(col && col instanceof Ship)
			{
				entity.destroy();
				col.hp -= Math.floor(Math.random()*(entity.pow[1] - entity.pow[0]))+entity.pow[0];
				
				if(entity.special){
					col.effect = {end: new Date().getTime() + 45_000, id: entity.special, shoter: entity.parent};
					col.element.classList.add(['eff-2', false, "eff-4", 'eff-5', false][entity.special-2]);
				}
				
				if(col.hp > 0) col.setTarget(entity);
				else
				{
					if(entity.parent.player) writeComment(`${skins[col.id.substring(1)][1]} został zatopiony.`, '#ff0000')
					col.destroy();
					entity.parent.hp += 20;
					entity.parent.hpLimit += 20;
					entity.parent.oars += 20;
					entity.parent.producers += col.producers;
				}
				
			}
			else if(col && col instanceof Bullet)
			{
				col.destroy();
				entity.destroy();
			}
		}
		break;
		case entity instanceof PowerUp:
		{
			entity.collision();
		}
		break;
	}
}

function stop(){
	clearInterval(timerInterval);
	clearInterval(gameInterval);
	clearComment();
	refreshBars({hp: 0, oars: 0, producers: 0})
	refreshFilterFrame();
	stop_playing();
}

function win()
{
	stop();
	const player = entities.find(el => el instanceof Ship && el.player);
	const screen = document.querySelector("#winning-screen");
		  screen.classList.replace("hidden", "active")
		  
	screen.querySelector("#win-oars").innerText = player.oars;
	screen.querySelector("#win-hp").innerText = player.hp;
	screen.querySelector("#win-producers").innerText = player.producers;
	screen.querySelector("#win-score").innerText = timer(true) * 50 + (player.oars + player.hp) * 10 + player.producers * 100;
	screen.querySelector("h1").innerText = `Wygrywasz rundę ${level}!`
}

function lose()
{
	stop();
	const screen = document.querySelector("#losing-screen")
		  screen.classList.replace("hidden", "active")
		  
	screen.querySelector("#lose-score").innerText = timer(true) * 50;
	screen.querySelector("h1").innerText = `Przegrywasz rundę ${level}!`
}