// Pokemon Red-like Game Template

class Pokemon {
    constructor(name, type, hp, attack, defense, speed) {
        this.name = name;
        this.type = type;
        this.maxHP = hp;
        this.currentHP = hp;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.level = 5;
        this.experience = 0;
    }

    takeDamage(damage) {
        this.currentHP = Math.max(0, this.currentHP - damage);
        return this.currentHP <= 0;
    }

    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    isFainted() {
        return this.currentHP <= 0;
    }
}

class Game {
    constructor() {
        this.playerName = "Red";
        this.playerX = 150;
        this.playerY = 150;
        this.currentScreen = "map";
        this.inBattle = false;

        // Create player party
        this.playerParty = [
            new Pokemon("Pikachu", "Electric", 35, 55, 40, 90),
            new Pokemon("Charmander", "Fire", 39, 52, 43, 65),
            new Pokemon("Squirtle", "Water", 44, 48, 65, 43),
        ];

        this.currentPokemon = this.playerParty[0];

        // Create opponent
        this.opponent = new Pokemon("Wild Pidgeot", "Flying", 50, 60, 55, 80);
        this.opponentPokemon = this.opponent;

        this.initializeMap();
        this.setupEventListeners();
    }

    initializeMap() {
        const map = document.getElementById("gameMap");
        map.innerHTML = '';

        // Create simple grass background
        for (let i = 0; i < 50; i++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.style.left = Math.random() * 100 + "%";
            tile.style.top = Math.random() * 100 + "%";
            map.appendChild(tile);
        }

        // Create player
        const player = document.createElement("div");
        player.className = "player";
        player.id = "player";
        player.style.left = this.playerX + "px";
        player.style.top = this.playerY + "px";
        map.appendChild(player);

        // Create NPC
        const npc = document.createElement("div");
        npc.className = "npc";
        npc.style.left = "300px";
        npc.style.top = "150px";
        map.appendChild(npc);

        // Update HUD
        this.updateHUD();
    }

    updateHUD() {
        const teamDiv = document.getElementById("pokemonTeam");
        teamDiv.innerHTML = '';

        this.playerParty.forEach((pokemon, index) => {
            const teamPokemon = document.createElement("div");
            teamPokemon.className = "team-pokemon";
            if (pokemon.isFainted()) {
                teamPokemon.classList.add("fainted");
            }
            teamPokemon.textContent = index + 1;
            teamPokemon.title = pokemon.name + " - " + pokemon.currentHP + "/" + pokemon.maxHP + "HP";
            teamDiv.appendChild(teamPokemon);
        });
    }

    setupEventListeners() {
        document.addEventListener("keydown", (e) => this.handleKeyPress(e));
        document.getElementById("attackBtn").addEventListener("click", () => this.playerAttack());
        document.getElementById("specialBtn").addEventListener("click", () => this.playerSpecial());
        document.getElementById("itemBtn").addEventListener("click", () => this.useItem());
        document.getElementById("switchBtn").addEventListener("click", () => this.switchPokemon());
    }

    handleKeyPress(e) {
        if (this.inBattle) return;

        const moveDistance = 20;
        switch(e.key.toLowerCase()) {
            case "arrowup":
            case "w":
                this.playerY = Math.max(0, this.playerY - moveDistance);
                e.preventDefault();
                break;
            case "arrowdown":
            case "s":
                this.playerY = Math.min(300, this.playerY + moveDistance);
                e.preventDefault();
                break;
            case "arrowleft":
            case "a":
                this.playerX = Math.max(0, this.playerX - moveDistance);
                e.preventDefault();
                break;
            case "arrowright":
            case "d":
                this.playerX = Math.min(300, this.playerX + moveDistance);
                e.preventDefault();
                break;
            case "enter":
            case " ":
                this.checkEncounter();
                e.preventDefault();
                break;
            case "m":
                this.toggleMenu();
                e.preventDefault();
                break;
        }

        const player = document.getElementById("player");
        if (player) {
            player.style.left = this.playerX + "px";
            player.style.top = this.playerY + "px";
        }
    }

    checkEncounter() {
        const npcX = 300;
        const npcY = 150;
        const distance = Math.sqrt(Math.pow(this.playerX - npcX, 2) + Math.pow(this.playerY - npcY, 2));

        if (distance < 50) {
            this.startBattle();
        }
    }

    startBattle() {
        this.inBattle = true;
        this.showScreen("battle");
        this.updateBattleUI();
    }

    updateBattleUI() {
        document.getElementById("playerPokemonName").textContent = 
            this.currentPokemon.name + " Lv." + this.currentPokemon.level;
        document.getElementById("opponentName").textContent = 
            this.opponentPokemon.name + " Lv." + this.opponentPokemon.level;

        const playerHPPercent = (this.currentPokemon.currentHP / this.currentPokemon.maxHP) * 100;
        const opponentHPPercent = (this.opponentPokemon.currentHP / this.opponentPokemon.maxHP) * 100;

        document.getElementById("playerHP").style.width = playerHPPercent + "%";
        document.getElementById("opponentHP").style.width = opponentHPPercent + "%";

        this.updateHPBarColor(document.getElementById("playerHP"), playerHPPercent);
        this.updateHPBarColor(document.getElementById("opponentHP"), opponentHPPercent);
    }

    updateHPBarColor(element, percent) {
        element.classList.remove("damaged", "critical");
        if (percent < 25) {
            element.classList.add("critical");
        } else if (percent < 50) {
            element.classList.add("damaged");
        }
    }

    playerAttack() {
        if (!this.inBattle) return;

        const damage = Math.floor(Math.random() * 15 + 10);
        this.messageBox("Your " + this.currentPokemon.name + " used Tackle!");

        setTimeout(() => {
            const fainted = this.opponentPokemon.takeDamage(damage);
            this.updateBattleUI();

            if (fainted) {
                this.endBattle(true);
            } else {
                setTimeout(() => this.opponentAttack(), 1000);
            }
        }, 800);
    }

    opponentAttack() {
        if (!this.inBattle) return;

        const damage = Math.floor(Math.random() * 12 + 8);
        this.messageBox("Opponent's " + this.opponentPokemon.name + " attacked!");

        setTimeout(() => {
            const fainted = this.currentPokemon.takeDamage(damage);
            this.updateBattleUI();

            if (fainted) {
                this.endBattle(false);
            }
        }, 800);
    }

    playerSpecial() {
        this.messageBox(this.currentPokemon.name + " used Special Attack!");
        this.currentPokemon.takeDamage(5); // Special takes health too
        this.updateBattleUI();
    }

    useItem() {
        this.messageBox("Used Potion!");
        this.currentPokemon.heal(20);
        this.updateBattleUI();
    }

    switchPokemon() {
        const available = this.playerParty.find(p => !p.isFainted() && p !== this.currentPokemon);
        if (available) {
            this.currentPokemon = available;
            this.messageBox("Switched to " + available.name);
            this.updateBattleUI();
        }
    }

    endBattle(playerWon) {
        this.inBattle = false;
        if (playerWon) {
            this.messageBox("You won the battle!");
        } else {
            this.messageBox("You lost the battle!");
        }

        setTimeout(() => {
            this.showScreen("map");
        }, 2000);
    }

    messageBox(text) {
        document.getElementById("messageText").textContent = text;
    }

    toggleMenu() {
        if (this.currentScreen === "map") {
            this.showScreen("menu");
        } else {
            this.showScreen("map");
        }
    }

    showScreen(screenName) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        document.getElementById(screenName + "Screen").classList.add("active");
        this.currentScreen = screenName;
    }

    showPokemonParty() {
        alert("Pokemon: " + this.playerParty.map(p => p.name).join(", "));
    }

    showBag() {
        alert("Bag: 5 Potions, 3 Pokeballs");
    }

    showPokedex() {
        alert("Pokedex: 3 Pokemon discovered");
    }

    closeMenu() {
        this.showScreen("map");
    }
}

// Initialize game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    window.game = game;
});
