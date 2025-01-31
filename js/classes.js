let Ship, Bullet, PowerUp;


const skins = [
	["https://yt3.ggpht.com/bmpZa_qcQDbFsnRqWOZQhQL73tu0t6BsiRNJkMuyL5B9n4LeSYrtaqpd9cqooVb4zhbXuYxV=s48-c-k-c0x00ffffff-no-rj", "NRGeek"],
	["https://www.giantbomb.com/a/uploads/scale_small/0/4647/841577-1861_1.jpg", "Davilex Games"],
	["https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/TAITO_logo.svg/1741px-TAITO_logo.svg.png", "Taito"],
	["https://images.timeextension.com/610981a23ce74/1280x720.jpg", "Delta IV"],
	["https://static.wikia.nocookie.net/videogames/images/0/0b/Mortal_Kombat_Mythologies.jpg/revision/latest?cb=20170408064258&path-prefix=pl","NetherRealm"],
	["https://www.giantbomb.com/a/uploads/scale_medium/0/5327/1267439-blast.png", "Blast"],
	["https://simulam.com/wp-content/uploads/2020/02/small.png", "Simulam"],
	["https://media.indiedb.com/images/groups/1/6/5806/Silden_logo_big_1.jpg","Silden"],
	["https://e7.pngegg.com/pngimages/769/535/png-clipart-midas-logo-midas-logo-icons-logos-emojis-iconic-brands-thumbnail.png", "Midas"],
	["https://yt3.googleusercontent.com/ytc/AGIKgqMYu1h46RHwDecCbfDob4X1iARh-185vJ6_zDHulA=s900-c-k-c0x00ffffff-no-rj", "Jar Head Studio"],
	["https://ih1.redbubble.net/image.782399113.6415/st,small,845x845-pad,1000x1000,f8f8f8.u4.jpg","Cougar Interactive"],
	["https://i.discogs.com/_i0o294QQ1QgL3Eyd0tq2pPT5_z4cu9JtTYBhFEVnMA/rs:fit/g:sm/q:90/h:510/w:510/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTIzNjYy/NDI3LTE2NjgxOTMx/MjUtNjcwNS5qcGVn.jpeg", "Marana Tha"],
	["https://fwcdn.pl/fpo/18/22/611822/7376632.3.jpg","Flare Media"],
	["https://upload.wikimedia.org/wikipedia/en/8/82/Daikatanabox.jpg","Ion Storm"],
	["https://cdn.mobygames.com/cce897e2-bc7e-11ed-bde2-02420a000179.webp","Mirage"],
	["https://static.wikia.nocookie.net/revolt/images/0/06/Acclaim_%28Iguana%29_Studios_London.png","Acclaim"],
	["https://wkduffy.files.wordpress.com/2012/12/2tl.jpg","Orion Games"],
	["https://cdn.mobygames.com/9c2ab4fa-ab6c-11ed-b042-02420a00019f.webp","City Interactive"],
	["https://media.indiedb.com/images/groups/1/9/8502/prev.jpg","DWD Enterprise"],
	["https://upload.wikimedia.org/wikipedia/en/4/4d/LimbooftheLost.jpg","Majestic Studio"]
];
	
Ship = class Ship {
	constructor(x,y)
	{
		this.id = 's' + idGivers.ship();
		this.player = this.id == 's0';
		this.boss = idGivers.ship(true) > 1 && idGivers.ship(true)%5 == 0;
		this.shotCooldown = 0;
		this.speed = this.boss ? 0.75 : 1;
		this.rotation = 0;
		this.x = x ?? 5;
		this.y = y ?? 5;
		this.w = this.boss ? 80 : 60;
		this.h = this.boss ? 40 : 30;
		this.hp = this.boss ? 250 : 100;
		this.hpLimit = this.boss ? 250 : 100;
		this.oars = this.boss ? 250 : 100;
		this.producers = this.player ? 0 : 5;
		this.target = false;
		this.special = false;
		this.effect = false;
		
		{
			const element = document.createElement("div");
					element.classList.add("ship", (this.player ? 'player' : 'enemy'));
					element.style.width = this.w + 'px';
					element.style.height = this.h + 'px';
					element.style.position = 'absolute';
					element.style.top = this.y + 'px';
					element.style.left = this.x + 'px';
					element.style.transform = `rotate(${this.rotation}deg)`;
		
			board.appendChild(element);
			entities.push(this);
			this.element = element;
		}
		
		{
			const skin = skins[idGivers.ship(true)] || ["https://cdn-icons-png.flaticon.com/512/4123/4123763.png", "Gall Anonim"],
					element = document.createElement("div");
					element.classList.add("tag");
					element.style.position = 'absolute';
					element.style.top = this.y + (this.y < 81 ? 80 : -80) + 'px';
					element.style.left = this.x + (this.x < 41 ? 40 : -40) + 'px';
					element.innerHTML = `<img src='${skin[0]}'><div class='info'>${(this.boss ? '<span style="color: red;">[BOSS]</span> ' : '') + skin[1]}<br/>HP: <span class='health'>100</span>/<span class='healthLimit'>${this.hpLimit}</span><br/>Wiosła: <span class='oars'>100</span>/${this.boss ? 250 : 100}</div>`
					
			board.appendChild(element);
			this.tag = element;
		}
		
		return this;
	}
	
	rotate(left)
	{
		if(this.effect?.id == 4) return;
		
		this.rotation += left ? -this.speed : this.speed;
		
		if(this.rotation < 0) this.rotation = 360;
		else if(this.rotation > 360) this.rotation = 0;
		
		this.element.style.transform = `rotate(${this.rotation}deg)`;
		
		return this;
	}
	
	move()
	{
		if(this.special && this.special.end < new Date().getTime()){
			this.special = false;
			this.speed = 1;
		} else
			if(this.special && this.special.id == 3 && this.speed != 2) this.speed = 2;
			else if(this.special && this.special.id == 6 && this.hp < this.hpLimit && Math.floor((this.special.end - new Date().getTime())/10)*10 % 1000 == 0)
			{
				if(this.hp + 10 > this.hpLimit) this.hp = this.hpLimit+0;
				else this.hp += 10;
			}
		
		if(this.effect && this.effect.end < new Date().getTime()){
			this.element.classList.remove(['eff-2', false, "eff-4", 'eff-5', false][this.effect.id-2])
			this.effect = false;
		} else if(this.effect && Math.floor((this.effect.end - new Date().getTime())/10)*10 % 1000 == 0)
			if(this.effect.id == 2 || this.effect.id == 5)
			{
				this.hp -= this.effect.id == 2 ? 2 : 4;
				if(this.hp <= 0){
					if(entities.some(el => el == this.effect.shoter))
					{
						this.effect.shoter.producers += this.producers;
						this.effect.shoter.hp += 20;
						this.effect.shoter.hpLimit += 20;
						this.effect.shoter.oars += 20;
					}
					this.destroy();
				}
			}
		
		const 
			dx = this.speed * Math.cos(Math.radians(this.rotation)), 
			dy = this.speed * Math.sin(Math.radians(this.rotation));
		
		if((this.x > 0 || dx > 0) && (this.x < avWidth || dx < 0)) this.x += dx;
		if((this.y > 0 || dy > 0) && (this.y < avHeight || dy < 0)) this.y += dy;
		
		this.element.style.top = this.y + 'px';
		this.element.style.left = this.x + 'px';
		
		this.tag.style.top = this.y + (this.y < 81 ? 80 : -80) + 'px';
		this.tag.style.left = this.x + (this.x < 41 ? 40 : -40) + 'px';
		
		return this;
	}
	
	shot(){
		if(this.effect?.id == 4) return;
		
		if(this.oars <= 0 || this.shotCooldown > new Date().getTime() || this.target instanceof PowerUp) return this;
		this.shotCooldown = this.shotCooldown = new Date().getTime() + (this.player ? 500 : 1000);
		this.oars--;
		new Bullet(this);
	}
	
	setTarget(player){
		if(difficulty == 0)
		{
			if(this.player) return this;
			if(player)
				this.target = player;
			else
				this.target = entities.filter(el => (el instanceof Ship || el instanceof PowerUp) && el != this).sort((a,b) => distance(a, this) - distance(b, this))[0];
		}
		else
		{
			if(player && (player instanceof PowerUp || player instanceof Ship && player.player)) this.target = player;
			else
			{
				this.target = entities.filter(el => el instanceof Ship && el.player || el instanceof PowerUp).sort((a,b) => distance(a,this) - distance(b, this))[0];
			}
		}
		return this;
	}
	
	refreshTag()
	{
		this.tag.querySelector(".health").innerText = this.hp;
		this.tag.querySelector(".healthLimit").innerText = this.hpLimit;
		this.tag.querySelector(".oars").innerText = this.oars;
		return this;
	}
	
	destroy()
	{
		try
		{
			board.removeChild(this.element);
			board.removeChild(this.tag);
			
			entities = entities.filter(el => el.id != this.id);
			if(gameInterval && timerInterval && Math.floor(Math.random()*2) == 0) new PowerUp(this.x, this.y);

			return this;
		}
		catch(error){}
	}
}

Bullet = class Bullet {
	constructor(parent)
	{
		this.id =  'o' + idGivers.oar();
		this.rotation = parent.rotation;
		this.direction = parent.rotation;
		this.w = 25;
		this.h = 10;
		// Experimenting on spawn point for oars.

		const
			angle = parent.rotation,
			bulletOffsetX = (parent.w - this.w)/2,
			bulletOffsetY = (parent.h - this.h)/2;

		this.x = parent.x + Math.cos(Math.radians(angle))*bulletOffsetX;
		this.y = parent.y + Math.sin(Math.radians(angle))*bulletOffsetY;
		
		this.parent = parent;
		this.speed = parent.speed * 2;
		this.pow = [15, 35];
		this.special = parent.special?.id;
		if(this.special == 3) this.special = false;
		
		if(this.special == 1) this.pow = [100,200];
		if(this.special == 2 || this.special == 4) this.pow = [10,20];
		
		{
			const element = document.createElement("div");
					element.classList.add("oar");
					element.style.position = 'absolute';
					element.style.left = this.x + 'px';
					element.style.top = this.y + 'px';
					element.style.transform = `rotate(${this.rotation}deg)`;
					element.style.width = this.w + 'px';
					element.style.height = this.h + 'px';
					
			if(this.special && this.special != 3) element.classList.add([
				'eff-1',
				'eff-2',
				false,
				'eff-4',
				'eff-5',
				false
			][this.special-1]);
				
			board.appendChild(element)
			this.element = element;
		}
		entities.push(this);
		return this;
	}
	
	move()
	{	
		this.rotation++;
		if(this.rotation>360) this.rotation = 0;
		
		const 
			dx = this.speed * Math.cos(Math.radians(this.direction)), 
			dy = this.speed * Math.sin(Math.radians(this.direction));
		
		if(this.x < 0 || this.x > avWidth || this.y < 0 || this.y > avHeight) return this.destroy();
		
		this.x += dx;
		this.y += dy;
		
		this.element.style.transform = `rotate(${this.rotation}deg)`;
		this.element.style.top = this.y + dy + 'px';
		this.element.style.left = this.x + dx + 'px';
		
		return this;
	}
	
	collision()
	{
		const col = entities.find(el => el.id != this.id && el.id != this.parent.id && distance(this, el) < el.w/2);
		if(!col) return false;
		else return col;
	}
	
	destroy()
	{
		try
		{
			entities = entities.filter(el => el.id != this.id);
			board.removeChild(this.element);
			return this;
		}
		catch(error){}
	}
}

PowerUp = class PowerUp {
	constructor(x, y)
	{
		const type = Math.floor(Math.random()*6)+1;
		
		this.id = 'p' + idGivers.pwrUp()
		this.x = x;
		this.y = y;
		this.w = 20;
		this.h = 20;
		this.img = "./res/pwr-up-" + type + '.png';
		this.type = type;
		{
			const element = document.createElement("div");
					element.classList.add("power-up")
					element.style.backgroundImage = `url("${this.img}")`;
					element.style.position = 'absolute';
					element.style.top = y + 'px';
					element.style.left = x + 'px';
					element.style.width = this.w + 'px';
					element.style.height = this.h + 'px';
			this.element = element;
			board.appendChild(this.element);
		}
		
		entities.push(this);
		entities
			.filter(el => el instanceof Ship && !el.player)
			.sort((a,b) => distance(a,this) - distance(b,this))
			.slice(0, 2)
			.map(el => el?.setTarget(this));
		return this;
	}
	
	collision()
	{
		const col = entities.find(el => el instanceof Ship && distance(this, el) < el.w/2);
		if(col)
		{
			col.special = {end: new Date().getTime() + 30_000, id: this.type.toString()}

			const 
				special_data = [
					{
						name: 'wiosła pożogi',
						audio: './res/sfx/granat.mp3'
					},
					{
						name: 'ogniste wiosła'
					},
					{
						name: 'nitro do przecągów',
						audio: './res/sfx/przecag.mp3'
					},
					{
						name: 'mrożące wiosła cringe\'u'
					},
					{
						name: 'wiosła nasączone kwaśnym g*wnem'
					},
					{
						name: 'dowóz apteczek ŻUKami',
						audio: './res/sfx/zuki.mp3'
					}
				][this.type-1]

			if(col.player) writeComment(`NRGeek zdobywa <span style="color:#f00;">${special_data.name}</span>!`, '#000', special_data.audio);
			return this.destroy();
		}
		return false;
	}
	
	destroy()
	{
		try
		{
			entities = entities.filter(el => el.id != this.id);
			board.removeChild(this.element);
			return this;
		}
		catch(error){}
	}
}