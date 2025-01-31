{
	const [main_menu, menu, controls, options, credits, game] = ["main-menu", "menu", "controls", "options", "credits", "game"].map(el => document.getElementById(el)),
		  navi_buttons = [...menu.querySelectorAll(".menu-opt"), ...main_menu.querySelectorAll(".addi-opt")],
		  cont_buttons = Array.from(controls.querySelectorAll(".menu-opt")),
		  opti_inputs = Array.from(options.querySelectorAll(".menu-opt")).filter(el => !el.classList.contains("addi-opt")),
		  endi_buttons = Array.from(game.querySelectorAll(".menu-opt")),
		  credits_lines = [
			"<h2>Źródła:</h2>",
			"Obrazki wyszukiwał - ParrotCore<br />",
			"Głos podkłada - NRGeek<br />",
			"<h2>Realizacja</h2>",
			"Niedopatrzenia i błędy - ParrotCore<br />",
			"Grafika gorsza niż w 90's - ParrotCore<br />",
			"Grafiki statku i wiosła - Maxxie<br />",
			"Kod - ParrotCore<br />",
			"<h2>Pytanie za milion:</h2>",
			"Czy ktoś to w ogóle tetował?",
			"<h2>Hasło dnia</h2>",
			"Wszyscy, którzy przyłożyli<br />",
			"swoje brudne łapska do tego g*wna<br />",
			"powinni zap***dalać na<br />",
			"galerze po wsze czasy.<br />",
			"Napromieniowanej k***a uranem.<br />",
			"Aby dopiero po 30-stu latach w końcu<br />",
			"dostać wiosła.",
			"<h2>Tetowanie:</h2>",
			"Teter nr 1 - ParrotCore<br />",
			"Teter nr 2 - Maxxie<br />",
			"<h2>ParrotCore Enterprise</h2>",
			"<h2>Dziękujemy za grę</h2>",
			"<h2>Wróć do nas raz jeszcze!</h2>",
		  ];
	
	let interval,
		selected;
	
	for(let button of navi_buttons)
	{
		let target = button.id ? eval(button.id.substring(4)) : menu,
			parent = target == game ? main_menu : button.parentNode;
		
		button.addEventListener("click", () => {
			parent.classList.replace("active", "hidden");
			target.classList.replace("hidden", "active");
			
			if(target == game) return initializeGame();
			if(interval)
			{
				clearInterval(interval);
				interval = undefined;
			}
			if(target.id == 'credits')
			{	
				let i = 2,
					credits = document.querySelector("#credits-desc");
				
				credits.innerHTML = [credits_lines[i-2],credits_lines[i-1],credits_lines[i]].join("")
				interval = setInterval(() => {
					if(i != credits_lines.length)
					{
						credits.innerHTML = [credits_lines[i-2], credits_lines[i-1], credits_lines[i]].join("");
						i++;

						if(i == 9 || i == 11)
						{
							let audio = new Audio();
							audio.src = i == 9 ? './res/sfx/tetowanko.mp3' : './res/sfx/powinnosc.mp3';
							audio.volume = settings.volume.sounds;
							audio.play();
							
						}
					}
					else
					{
						clearInterval(interval);
						interval = undefined;
					}
				},1000)
			}
		})
	}
	
	const handleClick = (ev) => {
			if(selected == ev.target) return;
			
			selected?.removeEventListener("keydown", handleKey)
			selected?.classList.remove("selected");
			
			ev.target.classList.add("selected");
			ev.target.addEventListener("keydown", handleKey);
			
			selected = ev.target;
		  },
		  handleKey = (ev) => {
			let key = ev.key == ' ' ? "space" : ev.key.toLowerCase();
			if(key.startsWith("arrow")) key = key.substring(5);
			if(!/^([0-9]|[a-z]|escape|space|up|left|right|down)$/.test(key) || Array.from(Object.values(keybindings)).includes(key)) return;
			keybindings[selected.id.substring(8)] = key;
			selected.innerHTML = selected.innerHTML.split("-")[0] + '- ' + keybindings[selected.id.substring(8)].toUpperCase();
			
			selected.classList.remove("selected");
			selected.removeEventListener("keydown", handleKey);
			selected = undefined;
		  }
	
	for(let button of cont_buttons)
		if(button.classList.contains("addi-opt"))
			button.addEventListener("click", () => {
				if(!selected) return;
				selected.removeEventListener("keydown", handleKey);
				selected.classList.remove("selected");
				selected = undefined;
			})
		else
		{
			button.innerHTML = button.innerHTML.split("-")[0] + '- ' + keybindings[button.id.substring(8)].toUpperCase();
			button.addEventListener("click", handleClick);
		}
		
	for(let button of opti_inputs)
	{
		if(button.tagName.toLowerCase() == 'div')
		{
			let range = button.querySelector("input"),
				label = button.querySelector(".little-label");
				
			range.addEventListener("input", (ev) => {
				if(range.id != 'difficulty'){
					label.innerText = range.value;
					settings.volume[range.id] = range.value/100;
				}
				else
				{
					label.innerText = ['Łatwy', 'Wszyscy cię nienawidzą'][range.value];
					settings.difficulty = Number(range.value);
				}
			})
		}
	}
	
	endi_buttons[0].addEventListener("click", (ev) => {
		level++;
		timerInterval = false;
		gameInterval = false;
		entities.map(el => el.destroy());
		game.querySelector("#winning-screen").classList.replace("active", "hidden");
		initializeGame();
	})
	
	endi_buttons[1].addEventListener("click", (ev) => {
		level = 1;
		timerInterval = false;
		gameInterval = false;
		entities.map(el => el.destroy());
		game.querySelector("#losing-screen").classList.replace("active", "hidden");
		game.classList.replace("active", "hidden");
		main_menu.classList.replace("hidden", "active");
	})
}