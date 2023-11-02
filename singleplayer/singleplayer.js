const canvas = document.querySelector('canvas');
const canvasContent = canvas.getContext("2d");
let winCondition = false;
let winner = 'Nope';
let computerPlayersCount = 3;
let scoresForWin = 8;

class Sprite {
    constructor({position, imageSrc}) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw() {
        canvasContent.drawImage(this.image, this.position.x, this.position.y);
    }

    update() {
        this.draw();
    }
}

class Player {
    constructor({position, angle, velocity}, imageSrc) {
        this.position = position;
        this.angle = angle;
        this.velocity = velocity;
        this.width = 25;
        this.height = 16;
        this.key = [0,0,0,0];
        this.points = [];
        this.id = 1;
        this.score = 0;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    crashHandler(e) {
        if (e == this.id) {
        this.velocity.m = -this.velocity.m;
        }
    }

    collisionHandler(e, eid) {
        for (let i = 0; i < e.length; ++i){
            if (e[i].x >= this.points[i].x - 3 && e[i].x <= this.points[i].x + 3 && e[i].y >= this.points[i].y - 3 && e[i].y <= this.points[i].y + 3){
                this.velocity.m = -this.velocity.m;
                window.dispatchEvent(new CustomEvent('crash', {
                    detail: {
                        id: eid
                    }
                }));
            }
        }
    }

    eventHandler(e) {
        if (e == this.id) {
            console.log(this.score);
            ++this.score;
        }
    }

    inputHandler(x, to) {
        switch (x) {
            case 'w':
                this.key[0] = to;
                break;
            case 'd':
                this.key[1] = to;
                break;
            case 'a':
                this.key[2] = to;
                break;
            case 's':
                this.key[3] = to;
                break;
        }
    }

    movement() {
        if (this.key[0] == 1){
            this.velocity.m += 0.3;
        }
        else {
            this.slowdown();
        }

        if (this.key[3] == 1){
            this.velocity.m -= 0.3;
        }
        else {
            this.slowdown();
        }

        if (this.key[1] == 1){
            this.angle.alpha += 4;
        }

        if (this.key[2] == 1){
            this.angle.alpha -= 4;
        }
    }

    slowdown() {
        this.velocity.m *= 0.93;
    }

    draw() {
        canvasContent.save();
        canvasContent.translate(this.position.x, this.position.y);
        canvasContent.rotate(this.angle.alpha * (Math.PI/180));
        canvasContent.drawImage(this.image, 0, -this.height/2);
        canvasContent.restore();
    }

    point_rotation(x_old, y_old) {
        let x = x_old * Math.cos(this.angle.alpha* (Math.PI/180)) - y_old * Math.sin(this.angle.alpha* (Math.PI/180));
        let y = x_old * Math.sin(this.angle.alpha* (Math.PI/180)) + y_old * Math.cos(this.angle.alpha* (Math.PI/180));
        return {x, y};
    }

    collision() {

        let x = this.position.x;
        let y = this.position.y;

        let p1 = {x, y};

        let newx = this.width;
        let newy = this.height/2;

        let p2 = this.point_rotation(newx, newy);

        p2.x += this.position.x;
        p2.y += this.position.y;

        newy = -this.height/2;

        let p3 = this.point_rotation(newx, newy);

        p3.x += this.position.x;
        p3.y += this.position.y;

        newx = 0;
        newy = 0;

        let p4 = this.point_rotation(newx, newy);

        p4.x += this.position.x;
        p4.y += this.position.y;

        let points = [p1, p2, p3, p4];
        return points;
    }

    collision_checker(points) {
        for (let i = 0; i < points.length; ++i) {
            if (points[i].x >= canvas.width - 8) {
                this.velocity.m = 0;
                this.position.x = this.position.x - 2;
                return true;
            }
            else if (points[i].y >= canvas.height - 10) {
                this.velocity.m = 0;
                this.position.y = this.position.y - 2;
                return true;
            }
            else if (points[i].x <= 12) {
                this.velocity.m = 0;
                this.position.x = this.position.x + 2;
                return true;
            }
            else if (points[i].y <= 5) {
                this.velocity.m = 0;
                this.position.y = this.position.y + 2;
                return true;
            }
        }
    }

    axis_corel() {
        if(this.angle.alpha <= 90 && this.angle.alpha > 0){
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;
        }
        else if (this.angle.alpha <= 180 && this.angle.alpha > 90){
            this.position.y += this.velocity.y;
            this.position.x -= this.velocity.x;
        }
        else if (this.angle.alpha <= 270 && this.angle.alpha > 180){
            this.position.y -= this.velocity.y;
            this.position.x -= this.velocity.x;
        }
        else if (this.angle.alpha <= 360 && this.angle.alpha > 270 || this.angle.alpha == 0){
            this.position.y -= this.velocity.y;
            this.position.x += this.velocity.x;
        }
    }

    angle_loop() {
        if (this.angle.alpha >= 361) {
            this.angle.alpha = 1;
        }
        else if (this.angle.alpha <= -1) {
            this.angle.alpha = 359;
        }
    }

    velocity_corel() {
        this.velocity.y = this.velocity.m * Math.abs(Math.cos((90-this.angle.alpha)*(Math.PI/180)));
        this.velocity.x = this.velocity.m * Math.abs(Math.cos(this.angle.alpha*(Math.PI/180)));
    }

    update() {
        this.angle_loop();
        this.draw();
        this.movement();
        this.points = this.collision();
        this.velocity_corel();
        this.collision_checker(this.points);
        this.axis_corel();
        window.dispatchEvent(new CustomEvent('my_points', {
            detail: {
                points: this.points,
                id: this.id
            }
        }));
    }
}

class Coin {
    constructor({position}) {
        this.position = position;
        this.image = new Image();
        this.image.src = "../multiplayer/images/coin.png";
    }

    drawCircle() {
        canvasContent.drawImage(this.image, this.position.x, this.position.y);
      }

    eventHandler(e, id_e) {
        for (let i = 0; i < e.length; ++i){
            if (e[i].x >= this.position.x - 3 && e[i].x <= this.position.x + 28 && e[i].y >= this.position.y - 3 && e[i].y <= this.position.y + 28){
                window.dispatchEvent(new CustomEvent('take_coin', {
                    detail: {
                        id: id_e
                    }
                }));
            }
        }
    }

    update() {
        this.drawCircle();
        coin.x = this.position.x;
        coin.y = this.position.y;
    }
}

class ComputerPlayer {
    constructor({position, angle, velocity}, id, imageSrc) {
        this.position = position;
        this.angle = angle;
        this.velocity = velocity;
        this.width = 25;
        this.height = 16;
        this.key = [0,0,0,0];
        this.points = [];
        this.ai = [];
        this.ip = id;
        this.score = 0;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    crashHandler(e) {
        if (e == this.id) {
            this.velocity.m = -this.velocity.m;
        }
    }

    collisionHandler(e, eid) {
        for (let i = 0; i < e.length; ++i){
            for (let j = 0; j < e.length; ++j){
                if (e[j].x >= this.points[i].x - 10 && e[j].x <= this.points[i].x+ 10 && e[j].y >= this.points[i].y - 10 && e[j].y <= this.points[i].y + 10){
                    this.velocity.m = -this.velocity.m;
                    window.dispatchEvent(new CustomEvent('crash', {
                        detail: {
                            id: eid
                        }
                    }));
                }
            }
        }
    }
    

    eventHandler(e) {
        if (e == this.id) {
            ++this.score;
        }
    }

    inputHandler(x, to) {
        switch (x) {
            case 'w':
                this.key[0] = to;
                break;
            case 'd':
                this.key[1] = to;
                break;
            case 'a':
                this.key[2] = to;
                break;
            case 's':
                this.key[3] = to;
                break;
        }
    }

    movement() {
        if (this.key[0] == 1){
            this.velocity.m += 0.3;
        }
        else {
            this.slowdown();
        }

        if (this.key[3] == 1){
            this.velocity.m -= 0.3;
        }
        else {
            this.slowdown();
        }

        if (this.key[1] == 1){
            this.angle.alpha += 4;
        }

        if (this.key[2] == 1){
            this.angle.alpha -= 4;
        }
    }

    slowdown() {
        this.velocity.m *= 0.93;
    }

    draw() {
        canvasContent.save();
        canvasContent.translate(this.position.x, this.position.y);
        canvasContent.rotate(this.angle.alpha * (Math.PI/180));
        canvasContent.drawImage(this.image, 0, -this.height/2);
        canvasContent.restore();
    }

    point_rotation(x_old, y_old) {
        let x = x_old * Math.cos(this.angle.alpha* (Math.PI/180)) - y_old * Math.sin(this.angle.alpha* (Math.PI/180));
        let y = x_old * Math.sin(this.angle.alpha* (Math.PI/180)) + y_old * Math.cos(this.angle.alpha* (Math.PI/180));
        return {x, y};
    }

    collision() {
        let x = this.position.x;
        let y = this.position.y;
        let p1 = {x, y};
        let newx = this.width;
        let newy = this.height/2;
        let p2 = this.point_rotation(newx, newy);

        p2.x += this.position.x;
        p2.y += this.position.y;

        newy = -this.height/2;

        let p3 = this.point_rotation(newx, newy);

        p3.x += this.position.x;
        p3.y += this.position.y;

        newx = 0;
        newy = 0;

        let p4 = this.point_rotation(newx, newy);

        p4.x += this.position.x;
        p4.y += this.position.y;
        this.ai = [[p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], [p4.x, p4.y]];
        let points = [p1, p2, p3, p4];
        return points;
    }

    collision_checker(points) {
        for (let i = 0; i < points.length; ++i) {
            if (points[i].x >= canvas.width - 8) {
                this.velocity.m = 0;
                this.position.x = this.position.x - 2;
                return true;
            }
            else if (points[i].y >= canvas.height - 10) {
                this.velocity.m = 0;
                this.position.y = this.position.y - 2;
                return true;
            }
            else if (points[i].x <= 12) {
                this.velocity.m = 0;
                this.position.x = this.position.x + 2;
                return true;
            }
            else if (points[i].y <= 5) {
                this.velocity.m = 0;
                this.position.y = this.position.y + 2;
                return true;
            }
        }
    }

    axis_corel() {
        if(this.angle.alpha <= 90 && this.angle.alpha > 0){
            this.position.y += this.velocity.y;
            this.position.x += this.velocity.x;
        }
        else if (this.angle.alpha <= 180 && this.angle.alpha > 90){
            this.position.y += this.velocity.y;
            this.position.x -= this.velocity.x;
        }
        else if (this.angle.alpha <= 270 && this.angle.alpha > 180){
            this.position.y -= this.velocity.y;
            this.position.x -= this.velocity.x;
        }
        else if (this.angle.alpha <= 360 && this.angle.alpha > 270 || this.angle.alpha == 0){
            this.position.y -= this.velocity.y;
            this.position.x += this.velocity.x;
        }
    }

    angle_loop() {
        if (this.angle.alpha >= 361) {
            this.angle.alpha = 1;
        }
        else if (this.angle.alpha <= -1) {
            this.angle.alpha = 359;
        }
    }

    velocity_corel() {
        this.velocity.y = this.velocity.m * Math.abs(Math.cos((90-this.angle.alpha)*(Math.PI/180)));
        this.velocity.x = this.velocity.m * Math.abs(Math.cos(this.angle.alpha*(Math.PI/180)));
    }

    update() {
        this.angle_loop();
        this.draw();
        this.movement();
        this.points = this.collision();
        this.velocity_corel();
        this.collision_checker(this.points);
        this.axis_corel();
        window.dispatchEvent(new CustomEvent('my_points', {
            detail: {
                points: this.points,
                id: this.id
            }
        }));
    }
}

function check(x, y) {
    return Math.sqrt(Math.pow((x - coin.position.x), 2) + Math.pow((y - coin.position.y), 2));
}

function ai(dummy) {
    if (Math.floor(check(dummy.ai[1][0], dummy.ai[1][1]) - check(dummy.ai[3][0], dummy.ai[3][1])) == 0){
        dummy.key[0] = 1;
        dummy.key[2] = 0;
        dummy.key[1] = 0;
    }
    if (check(dummy.ai[1][0], dummy.ai[1][1]) - check(dummy.ai[3][0], dummy.ai[3][1]) > 0) {
        dummy.key[2] = 1;
        dummy.key[1] = 0;
    }
    else if (check(dummy.ai[1][0], dummy.ai[1][1]) - check(dummy.ai[3][0], dummy.ai[3][1]) < 0){
        dummy.key[2] = 0;
        dummy.key[1] = 1;
    }
    if (dummy.score >= scoresForWin) {
        winCondition = true;
        winner = dummy.id;
    }
}

const player = new Player({
    position:{
        x: 300,
        y: 300
    },
    angle: {
        alpha: 0
    },
    velocity: {
        m: 0,
        x: 0,
        y: 0
    }
}, "../multiplayer/images/player1.png");

let computerPlayers = [];

for (let index = 1; index <= computerPlayersCount; index++) {
    computerPlayers.push(new ComputerPlayer({
        position:{
            x: 500 - 100 * index,
            y: 500 - 100 * index
        },
        angle: {
            alpha: 0
        },
        velocity: {
            m: 0,
            x: 0,
            y: 0
        }
    }, index + 1, `../multiplayer/images/player${index + 1}.png`));
}

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    imageSrc: "../multiplayer/images/playing_field.png"
});

function getRandomValue(max) {
    return Math.floor(Math.random() * max + 50);
}

let coin = new Coin({
    position: {
        x: getRandomValue(490),
        y: getRandomValue(490)
    }
});

let flag = true;

function animationProcess() {
    if (winCondition === true) {
        console.log('The winner is: ', winner);
    }
    else {
        window.requestAnimationFrame(animationProcess);
        background.update();
        player.update();
        if (player.score >= scoresForWin) {
            winCondition = true;
            winner = player.id;
        }

        computerPlayers.forEach(function(computerPlayer) {
            computerPlayer.update();
            ai(computerPlayer);
        });

        if (flag){
            coin.update();
        }
        else {
            coin = new Coin({
                position: {
                    x: getRandomValue(490),
                    y: getRandomValue(490)
                }
            });
            flag = true;
        }
    }
}

animationProcess();

window.addEventListener('keydown', (event) => {
    player.inputHandler(event.key, 1);
});

window.addEventListener('keyup', (event) => {
    player.inputHandler(event.key, 0);
});

window.addEventListener('my_points', function(event) {
    coin.eventHandler(event.detail.points, event.detail.id);
    player.collisionHandler(event.detail.points, event.detail.id);

    computerPlayers.forEach(function(computerPlayer) {
        computerPlayer.collisionHandler(event.detail.points, event.detail.id);
    });
});

window.addEventListener('crash', function(event) {
    player.crashHandler(event.detail.id);

    computerPlayers.forEach(function(computerPlayer) {
        computerPlayer.crashHandler(event.detail.id);
    });
});

window.addEventListener('take_coin', function(event) {
    flag = false;
    player.eventHandler(event.detail.id);
});