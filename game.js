const width = 20, height = 10, qtdFruits = 60, fruitTime = 1000 * 2;

class Player {
    constructor({ name, color, keyPress, active }) {
        this.name = name;
        this.color = color;
        this.countPoints = 0;
        this.keyPress = keyPress;
        this.position = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height)
        };
        this.active = !!active;
    }

    move(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    addPoint() {
        this.countPoints++;
    }

    removePoint() {
        // not remove if countPoints == 0
        !!this.countPoints && this.countPoints--;
    }

    eventListener() {
        window.addEventListener('keypress', ({ key }) => {
            this.keyPress({
                key, target: this
            });
        })

        return this;
    }
}

class Game {
    miliseconds() {
        return 1000;
    }
    framesPerSecound() {
        return 30;
    }
    getTickRate() {
        return this.miliseconds() / this.framesPerSecound();
    }

    constructor(height, width) {
        this.display = () => document.querySelector('.game');
        this.otherPoits = () => document.querySelector('.other-points');
        this.players = new Map();
        this.fruits = new Map();
        this.height = height;
        this.width = width;
        this.lastUpdate = new Date().getSeconds();
        this.countFrameRate = 0;
        this.qtdFruits = 2;
    }

    start(qtdFruits, fruitTime) {
        this.qtdFruits = qtdFruits ?? this.qtdFruits;

        Array.from({ length: this.qtdFruits }).forEach(() => this.addFruit());
        setInterval(this.update.bind(this), this.getTickRate());
        setInterval(() => {
            this.otherPoits().innerHTML = `${[...this.players].sort((a, b) => {
                if (a[1].countPoints > b[1].countPoints)
                    return -1;
                if (a[1].countPoints < b[1].countPoints)
                    return 1;
                return 0;
            }).map(([, player]) => `<p>${player.name}: ${player.countPoints}</p>`).join('')}`;
        }, 1000)
        setInterval(this.addFruit.bind(this), fruitTime);

        return this;
    }

    update() {
        this.render();

        if (this.lastUpdate === new Date().getSeconds()) {
            return this.countFrameRate++;
        }

        console.log('FPS: ' + this.countFrameRate, this);
        this.countFrameRate = 0;
        this.lastUpdate = new Date().getSeconds();
    }

    addPlayer({ name, color, active }) {
        if (this.players.has(name)) {
            alert('Player already exists');
            return this;
        }

        this.players.set(name, new Player({
            name, color, keyPress: this.keyPress.bind(this), active
        }));

        this.players.get(name).eventListener();

        return this;
    }

    addFruit() {
        let x = Math.floor(Math.random() * this.width);
        let y = Math.floor(Math.random() * this.height);

        this.fruits.set(`${x}-${y}`, {
            x, y,
            color: 'green'
        });

    }

    ruleWalls(x, y) {

        if (x < 0) {
            x = 0;
        }
        if (x > this.width - 1) {
            x = this.width - 1;
        }
        if (y < 0) {
            y = 0;
        }
        if (y > this.height - 1) {
            y = this.height - 1;
        }

        return [x, y];
    }

    ruleColideOtherPlayers(x, y, name) {
        let command = [x, y];

        this.players.forEach(player => {
            if (player.name !== name)
                if (player.position.x === x && player.position.y === y) {
                    command[0] = Math.floor(Math.random() * this.width);
                    command[1] = Math.floor(Math.random() * this.height);
                    player.removePoint();
                }
        })

        return command;
    }

    ruleColideFruits(name, [x, y]) {
        let { color } = this.players.get(name)

        if (this.fruits.has(`${x}-${y}`))
            if (this.fruits.get(`${x}-${y}`).color !== color) {
                this.fruits.get(`${x}-${y}`).color = color;
                this.players.get(name).addPoint();
            }
    }

    ruleGame(x, y, name) {
        let commad = [x, y]
        commad = this.ruleColideOtherPlayers(...commad, name);
        commad = this.ruleWalls(...commad);
        this.ruleColideFruits(name, commad);
        return commad;
    }

    aceptMoves(key, { name }) {
        let { position: { x, y }, active } = { ...this.players.get(name) }
        key = key.toUpperCase();

        if (!!active) {
            if (key === 'A') x = x - 1;
            if (key === 'D') x = x + 1;
            if (key === 'W') y = y - 1;
            if (key === 'S') y = y + 1;
        }
        if (!active) {
            if (key === 'K') x = x - 1;
            if (key === 'Ç') x = x + 1;
            if (key === 'O') y = y - 1;
            if (key === 'L') y = y + 1;
        }

        return this.ruleGame(...[x, y, name]);
    }

    keyPress({ key, target }) {
        this.players.forEach(player => {
            if (player.name === target.name) {
                player.move(...this.aceptMoves(key, player));
            }
        })
    }

    render() {
        let html = `<table cellpadding=0 cellspacing=0>`

        for (let row = 0; row < this.height; row++) {
            html += '<tr>'
            for (let column = 0; column < this.width; column++) {
                const pixelIndex = column + (this.width * row)
                // const fireIntensity = firePixelsArray[pixelIndex]

                let td = '<td>';

                this.players.forEach(player => {
                    if (column === player.position.x && row === player.position.y)
                        td += `<div class="player" style="background-color: ${player.color}; opacity: 0.4;">${player.name}</div>`
                })

                if (this.fruits.has(`${column}-${row}`))
                    td += `<div class="fruit" style="background-color: ${this.fruits.get(`${column}-${row}`).color}; opacity: 0.4;">F</div>`

                html += td;
                html += `<div class="pixel-index"></div>`
                // html += fireIntensity
                html += '</td>'

            }

            html += '</tr>'
        }
        html += '</table>'

        this.display().innerHTML = html;

        return this;
    }
}

new Game(height, width)
    .start(qtdFruits, fruitTime)
    .addPlayer({ name: 'G', color: '#ff00af', active: true })
    .addPlayer({ name: 'V', color: '#00ff00' })
    .addPlayer({ name: 'B', color: '#ff00ff' })
    .addPlayer({ name: 'A', color: '#ffff00' })
    .addPlayer({ name: 'C', color: '#ff0000' })
    .addPlayer({ name: 'D', color: '#ff0ff0' })
    .addPlayer({ name: 'E', color: '#fff00f' })
    .addPlayer({ name: 'F', color: '#ff0000' });