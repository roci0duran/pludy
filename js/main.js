var DEFAULT_SECONDS = 180;
var DESTRUCTION_SECONDS = 60;
var selectedSeconds = null;
var remaining = DEFAULT_SECONDS;
var timerInterval = null;
var state = 'start'; // 'start' | 'countdown' | 'done'
var phase = 'construccion'; // 'construccion' | 'destruccion'
var isPaused = false;
var dulceScore = 0;
var plucheScore = 0;

var appEl = document.getElementById('app');
var morphBtn = document.getElementById('morphBtn');
var morphLabel = document.getElementById('morphLabel');
var normalBtn = document.getElementById('normalBtn');
var quickBtn = document.getElementById('quickBtn');
var pauseBtn = document.getElementById('pauseBtn');
var stopBtn = document.getElementById('stopBtn');
var restartHint = document.getElementById('restartHint');
var phaseBtn = document.getElementById('phaseBtn');
var doneLine1 = document.getElementById('doneLine1');
var doneLine2 = document.getElementById('doneLine2');

var dulceScoreEl = document.getElementById('dulceScoreEl');
var plucheScoreEl = document.getElementById('plucheScoreEl');
var dulceMinus = document.getElementById('dulceMinus');
var dulcePlus = document.getElementById('dulcePlus');
var plucheMinus = document.getElementById('plucheMinus');
var pluchePlus = document.getElementById('pluchePlus');

var PAUSE_ICON = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
var PLAY_ICON = '<path d="M7 4.5v15l13-7.5z"/>';

function formatTime(totalSeconds){
  var m = Math.floor(totalSeconds / 60);
  var s = totalSeconds % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function setState(name){
  state = name;
  appEl.classList.remove('state-start', 'state-countdown', 'state-done');
  appEl.classList.add('state-' + name);
}

function selectOption(btn, seconds){
  normalBtn.classList.remove('selected');
  quickBtn.classList.remove('selected');
  btn.classList.add('selected');
  selectedSeconds = seconds;
  morphLabel.textContent = formatTime(seconds);
}

normalBtn.addEventListener('click', function(){
  selectOption(normalBtn, parseInt(normalBtn.dataset.seconds, 10));
});

quickBtn.addEventListener('click', function(){
  selectOption(quickBtn, parseInt(quickBtn.dataset.seconds, 10));
});

function updateScores(){
  dulceScoreEl.textContent = dulceScore;
  plucheScoreEl.textContent = plucheScore;
}

dulcePlus.addEventListener('click', function(){
  dulceScore += 1;
  updateScores();
});
dulceMinus.addEventListener('click', function(){
  dulceScore = Math.max(0, dulceScore - 1);
  updateScores();
});
pluchePlus.addEventListener('click', function(){
  plucheScore += 1;
  updateScores();
});
plucheMinus.addEventListener('click', function(){
  plucheScore = Math.max(0, plucheScore - 1);
  updateScores();
});

function showResult(){
  if (dulceScore === plucheScore){
    doneLine1.textContent = '¡EMPATE!';
    doneLine2.textContent = dulceScore + ' - ' + plucheScore;
  } else if (dulceScore > plucheScore){
    doneLine1.textContent = 'TEAM DULCE GANÓ';
    doneLine2.textContent = dulceScore + ' - ' + plucheScore;
  } else {
    doneLine1.textContent = 'TEAM PELUCHE GANÓ';
    doneLine2.textContent = plucheScore + ' - ' + dulceScore;
  }
}

function tick(){
  remaining -= 1;
  if (remaining <= 0){
    clearInterval(timerInterval);
    morphLabel.textContent = '0:00';
    setTimeout(function(){
      showResult();
      // El botón para pasar a destrucción solo aparece al terminar la
      // fase de construcción; si ya estábamos en destrucción, se oculta.
      phaseBtn.style.display = (phase === 'construccion') ? '' : 'none';
      setState('done');
    }, 300);
    return;
  }
  morphLabel.textContent = formatTime(remaining);
}

function setPauseIcon(paused){
  pauseBtn.innerHTML = paused
    ? '<svg viewBox="0 0 24 24" fill="var(--pink)">' + PLAY_ICON + '</svg>'
    : '<svg viewBox="0 0 24 24" fill="#111111">' + PAUSE_ICON + '</svg>';
}

function startCountdown(){
  phase = 'construccion';
  remaining = selectedSeconds !== null ? selectedSeconds : DEFAULT_SECONDS;
  // Set the label to the real starting time BEFORE morphing, so the
  // circle already shows the correct number as it grows into the pill.
  morphLabel.textContent = formatTime(remaining);

  isPaused = false;
  pauseBtn.classList.remove('paused');
  setPauseIcon(false);

  dulceScore = 0;
  plucheScore = 0;
  updateScores();

  setState('countdown');

  clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}

function startDestructionPhase(){
  phase = 'destruccion';
  remaining = DESTRUCTION_SECONDS;
  morphLabel.textContent = formatTime(remaining);

  isPaused = false;
  pauseBtn.classList.remove('paused');
  setPauseIcon(false);

  // Los puntos de la fase de construcción se mantienen: no se reinician.
  setState('countdown');

  clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
}

morphBtn.addEventListener('click', function(){
  if (state !== 'start') return;
  startCountdown();
});

phaseBtn.addEventListener('click', function(){
  if (state !== 'done') return;
  startDestructionPhase();
});

pauseBtn.addEventListener('click', function(){
  if (state !== 'countdown') return;
  isPaused = !isPaused;
  if (isPaused){
    clearInterval(timerInterval);
    pauseBtn.classList.add('paused');
    setPauseIcon(true);
  } else {
    timerInterval = setInterval(tick, 1000);
    pauseBtn.classList.remove('paused');
    setPauseIcon(false);
  }
});

function resetApp(){
  clearInterval(timerInterval);
  phase = 'construccion';
  isPaused = false;
  pauseBtn.classList.remove('paused');
  setPauseIcon(false);
  selectedSeconds = null;
  normalBtn.classList.remove('selected');
  quickBtn.classList.remove('selected');
  morphLabel.textContent = 'START';
  dulceScore = 0;
  plucheScore = 0;
  updateScores();
  phaseBtn.style.display = '';
  setState('start');
}

stopBtn.addEventListener('click', function(){
  if (state !== 'countdown') return;
  resetApp();
});

restartHint.addEventListener('click', resetApp);
