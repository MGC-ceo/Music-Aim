/* ================= GLOBAL ================= */
let currentUser = null;

const screens = {
  login: document.getElementById("loginScreen"),
  menu: document.getElementById("menuScreen"),
  settings: document.getElementById("settingsScreen"),
  play: document.getElementById("playScreen"),
  leaderboard: document.getElementById("leaderboardScreen")
};

function showScreen(screen){
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screen.classList.remove("hidden");
}

/* ================= LOGIN SYSTEM ================= */
function login(){
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if(!user || !pass) return alert("Fill all fields");

  let users = JSON.parse(localStorage.getItem("users") || "{}");

  if(!users[user]){
    users[user] = { password: pass };
  } else {
    if(users[user].password !== pass){
      return alert("Wrong password");
    }
  }

  localStorage.setItem("users", JSON.stringify(users));
  currentUser = user;

  showScreen(screens.menu);
}

/* ================= SETTINGS ================= */
document.getElementById("volume").value =
  localStorage.getItem("volume") || 50;

document.getElementById("vfxToggle").checked =
  localStorage.getItem("vfx") === "true";

document.getElementById("volume").oninput = e => {
  localStorage.setItem("volume", e.target.value);
};

document.getElementById("vfxToggle").onchange = e => {
  localStorage.setItem("vfx", e.target.checked);
};

/* ================= NAVIGATION ================= */
function openPlay(){ showScreen(screens.play); renderMap(); }
function openSettings(){ showScreen(screens.settings); }
function openLeaderboard(){ showScreen(screens.leaderboard); renderLeaderboard(); }
function backToMenu(){ showScreen(screens.menu); }

/* ================= MAP SYSTEM ================= */
const maps = [
  { name: "Feels", time: 190, speed: 1 },
  { name: "Invincible", time: 280, speed: 1 },
  { name: "Spoil", time: 220, speed: 1 }
];

let currentMapIndex = 0;

function renderMap(){
  const map = maps[currentMapIndex];
  document.getElementById("mapDisplay").innerHTML =
    `<h3>${map.name}</h3><p>${map.time}s</p>`;
}

function nextMap(){
  currentMapIndex = (currentMapIndex + 1) % maps.length;
  renderMap();
}

function prevMap(){
  currentMapIndex =
    (currentMapIndex - 1 + maps.length) % maps.length;
  renderMap();
}

/* ================= DIFFICULTY ================= */
const difficultySpeeds = {
  easy: 1,
  normal: 1.5,
  hard: 3,
  impossible: 10
};

let currentDifficulty = "easy";

/* ================= GAME ================= */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let targets = [];
let misses = 0;
let perfectHits = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* CURSOR */
let mouse = { x: 0, y: 0 };

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/* SPAWN TARGETS */
function spawnTarget(){
  targets.push({
    x: Math.random() * canvas.width,
    y: 0,
    size: 20,
    speed: 2
  });
}

/* GAME LOOP */
function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  /* DRAW TARGETS */
  targets.forEach((t, i) => {
    t.y += t.speed * difficultySpeeds[currentDifficulty];

    ctx.fillStyle = "red";
    ctx.fillRect(t.x, t.y, t.size, t.size);

    if(t.y > canvas.height){
      targets.splice(i,1);
      misses++;
    }
  });

  /* DRAW CURSOR (CIRCLE) */
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 15, 0, Math.PI*2);
  ctx.fillStyle = "white";
  ctx.fill();

  requestAnimationFrame(gameLoop);
}

/* CLICK DETECTION */
canvas.addEventListener("click", () => {
  targets.forEach((t, i) => {
    if(
      mouse.x > t.x &&
      mouse.x < t.x + t.size &&
      mouse.y > t.y &&
      mouse.y < t.y + t.size
    ){
      targets.splice(i,1);
      perfectHits++;
    }
  });
});

/* START GAME */
function startGame(){
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  canvas.style.display = "block";

  setInterval(spawnTarget, 800);
  gameLoop();

  setTimeout(endGame, maps[currentMapIndex].time * 1000);
}

/* END GAME */
function endGame(){
  canvas.style.display = "none";

  saveScore();

  alert(`Game Over!\nHits: ${perfectHits}\nMisses: ${misses}`);

  location.reload();
}

/* ================= LEADERBOARD ================= */
function saveScore(){
  let data = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  data.push({
    user: currentUser,
    hits: perfectHits,
    misses: misses
  });

  localStorage.setItem("leaderboard", JSON.stringify(data));
}

function renderLeaderboard(){
  let data = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  let html = "";

  data.forEach(d => {
    html += `<p>${d.user} | Hits: ${d.hits} | Misses: ${d.misses}</p>`;
  });

  document.getElementById("leaderboard").innerHTML = html;
}
