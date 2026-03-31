/* =========================================================
   🎮 AIM RHYTHM GAME — FULL CORE SCRIPT (CLEAN VERSION)
   ========================================================= */

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
const volumeSlider = document.getElementById("volume");
const vfxToggle = document.getElementById("vfxToggle");

volumeSlider.value = localStorage.getItem("volume") || 50;
vfxToggle.checked = localStorage.getItem("vfx") === "true";

volumeSlider.oninput = e => {
  localStorage.setItem("volume", e.target.value);
};

vfxToggle.onchange = e => {
  localStorage.setItem("vfx", e.target.checked);
};

/* ================= NAVIGATION ================= */
function openPlay(){ showScreen(screens.play); renderMap(); }
function openSettings(){ showScreen(screens.settings); }
function openLeaderboard(){ showScreen(screens.leaderboard); renderLeaderboard(); }
function backToMenu(){ showScreen(screens.menu); }

/* ================= MAP SYSTEM ================= */
const maps = [
  { name: "Feels", time: 190, file: "assets/music/feels.mp3" },
  { name: "Invincible", time: 280, file: "assets/music/invincible.mp3" },
  { name: "Spoil", time: 220, file: "assets/music/spoil.mp3" }
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

/* ================= CANVAS ================= */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================= CURSOR ================= */
let mouse = { x: 0, y: 0 };

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/* ================= RHYTHM SYSTEM ================= */
let notes = [];
let gameStartTime = 0;
let misses = 0;
let perfectHits = 0;

const hitWindow = 300;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

/* CREATE NOTES */
function spawnNote(delay){
  notes.push({
    spawnTime: gameStartTime + delay,
    hit: false,
    radius: 10,
    maxRadius: 60
  });
}

/* LOAD MAP (TEMP PATTERN) */
function loadMap(){
  notes = [];

  for(let i = 0; i < 60; i++){
    spawnNote(i * (800 / difficultySpeeds[currentDifficulty]));
  }
}

/* ================= GAME LOOP ================= */
function gameLoop(){
  let now = Date.now();

  ctx.clearRect(0,0,canvas.width,canvas.height);

  notes.forEach(note => {
    let timeDiff = now - note.spawnTime;

    if(timeDiff > 0 && !note.hit){
      let progress = timeDiff / 1000;

      note.radius = 10 + progress * 120;

      /* NOTE COLOR SYSTEM */
      let colors = ["crimson","red","#ff4d4d","lightblue","blue","navy","purple"];
      ctx.strokeStyle = colors[Math.floor(Math.random()*colors.length)];

      ctx.beginPath();
      ctx.arc(centerX, centerY, note.radius, 0, Math.PI*2);
      ctx.stroke();

      /* MISS */
      if(note.radius > note.maxRadius){
        note.hit = true;
        misses++;
      }
    }
  });

  /* CURSOR */
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 12, 0, Math.PI*2);
  ctx.fillStyle = "white";
  ctx.fill();

  requestAnimationFrame(gameLoop);
}

/* ================= CLICK SYSTEM ================= */
canvas.addEventListener("click", () => {
  let now = Date.now();

  for(let note of notes){
    if(note.hit) continue;

    let diff = Math.abs(now - note.spawnTime);

    if(diff < hitWindow){
      note.hit = true;

      if(diff < 100){
        perfectHits++;
      }

      break;
    }
  }
});

/* ================= START GAME ================= */
function startGame(){
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  canvas.style.display = "block";

  /* RESET */
  misses = 0;
  perfectHits = 0;

  gameStartTime = Date.now();

  loadMap();
  gameLoop();

  /* MUSIC */
  const map = maps[currentMapIndex];
  const music = new Audio(map.file);
  music.volume = (localStorage.getItem("volume") || 50) / 100;
  music.play();

  setTimeout(endGame, map.time * 1000);
}

/* ================= END GAME ================= */
function endGame(){
  canvas.style.display = "none";

  saveScore();

  alert(`Game Over!\nPerfect Hits: ${perfectHits}\nMisses: ${misses}`);

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
