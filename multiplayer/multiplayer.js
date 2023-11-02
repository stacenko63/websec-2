let authorizationButton = document.querySelector('#authorization_button');
let errorBlock = document.querySelector('#error');
let authorizationSection = document.querySelector('#signin');
let rating = document.querySelector('#rating');
let playersStatistics = document.getElementsByClassName('menu-item');
let key = [0, 0, 0, 0];
let socket = io();
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

const coinWidth = 25;
const coinHeight = 25;
const carWidth = 25;
const carHeight = 16;

authorizationButton.onclick = () => {
    let login = document.getElementById('login').value;
    socket.emit('login', login);

    socket.on('login exist', () => {
        errorBlock.innerHTML = 'УКАЗАННЫЙ ЛОГИН УЖЕ ЗАНЯТ';
        return;
    });

    socket.on('max players count', () => {
        errorBlock.innerHTML = 'ДОСТИГНУТО МАКСИМАЛЬНОЕ КОЛИЧЕСТВО ИГРОКОВ';
        return;
    });

    errorBlock.innerHTML = '';

    socket.on("successful", () => {
        authorizationSection.remove();
        document.body.appendChild(canvas);
        rating.style.display = 'block';
        setInterval(() => { socket.emit('key', key) }, 10);
    });
}

const background = new Image(600, 600);
background.src = 'images/playing_field.png';

canvas.width = 600;
canvas.height = 600;
canvas.style.position = "absolute";
canvas.style.top = "50%";
canvas.style.left = "50%";
canvas.style.marginRight = "-50%";
canvas.style.transform = "translate(-50%, -50%)";
canvas.style.background = "white";
canvas.style.margin = "0 auto";

const carImages = [];

for (let i = 1; i < 11; i++) {
    let car = new Image(carWidth, carHeight);
    car.src = `images/player${i}.png`;
    carImages.push(car);
}

const coinImage = new Image(coinWidth, coinHeight);
coinImage.src = 'images/coin.png';

document.addEventListener('keydown', (event) => {
    var name = event.key;
    switch (name) {
        case 'w':
            key[0] = 1;
            break;
        case 'd':
            key[1] = 1;
            break;
        case 'a':
            key[2] = 1;
            break;
        case 's':
            key[3] = 1;
            break;
    }
}, false);


document.addEventListener('keyup', (event) => {
    var name = event.key;
    switch (name) {
        case 'w' || 'ц':
            key[0] = 0;
            break;
        case 'd' || 'в':
            key[1] = 0;
            break;
        case 'a' || 'ф':
            key[2] = 0;
            break;
        case 's' || 'ы':
            key[3] = 0;
            break;
    }
}, false);


let draw = 1;
let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

socket.on('redraw', (data) => {
    ctx.drawImage(background, 0, 0);
    const players = data[0];
    draw = 1;
    arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let player of players) {
        arr[draw - 1] = { name: player.login, score: player.score };
        ctx.save();
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.translate(player.position.x, player.position.y);
        ctx.rotate(0 * Math.PI / 180);
        ctx.fillText(player.login, -15, -25, 60);
        ctx.restore();
        ctx.save();
        ctx.translate(player.position.x, player.position.y);
        ctx.rotate(player.angle.alpha * (Math.PI / 180));
        ctx.drawImage(carImages[draw - 1], 0, -8);
        ctx.restore();
        draw++;
    }
    arr.sort((a, b) => a['score'] > b['score'] ? -1 : 1);
    for (let i = 1; i <= playersStatistics.length - 1; ++i) {
        if (i > players.length) {
            playersStatistics[i].style.display = 'none';
        }
        else {
            playersStatistics[i].style.display = 'block';
            playersStatistics[i].innerHTML = `${i}. ${arr[i - 1].name} ${arr[i - 1].score}`;
        }
    }
    const coin = data[1];
    ctx.drawImage(coinImage, coin.x, coin.y, coinWidth, coinHeight);
})