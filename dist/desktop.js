'use strict';
const data = JSON.parse(document.querySelector('#data').textContent);
const viewer = document.querySelector('#viewer');
const body = document.querySelector('.dialog-body');
const dialogTitle = document.querySelector('#dialog-title');
const start = document.querySelector('.start');
const startMenu = document.querySelector('#startmenu');
const audio = document.querySelector('#audio');
let currentTrack = 0;
let currentWork = 0;

function toggleStart(open) {
  startMenu.hidden = !open;
  start.setAttribute('aria-expanded', String(open));
}
function showWindow(id) {
  const window = document.getElementById(id);
  document.querySelectorAll('.expanded').forEach(item => setExpanded(item, false));
  window.hidden = false;
  window.scrollIntoView({ block: 'start' });
}
function setExpanded(window, on) {
  window.classList.toggle('expanded', on);
  const button = window.querySelector('[data-max]');
  button.setAttribute('aria-pressed', String(on));
  button.title = on ? '还原窗口' : '最大化';
}
function dialog(title, html) {
  dialogTitle.textContent = title;
  body.innerHTML = html;
  viewer.setAttribute('aria-labelledby', 'dialog-title');
  if (!viewer.open) viewer.showModal();
  viewer.scrollTop = 0;
}
function showWork(index) {
  currentWork = (index + data.works.length) % data.works.length;
  const [name, kind, pic, description] = data.works[currentWork];
  const sound = audio ? '<button class="raised audio-link" data-listen>在播放器中试听</button>' : '';
  dialog(name + ' — 作品查看器', `<img class="dialog-art" src="assets/${pic}" alt="${name}"><h2 lang="en">${name}</h2><strong>${kind}</strong><p>${description}</p>${sound}<hr><div class="controls"><button class="raised" data-step="-1">上一件</button><span>${currentWork + 1} / ${data.works.length}</span><button class="raised" data-step="1">下一件</button></div>`);
}
function showContact() {
  dialog('联系 — 合作简报.txt', `<h2>合作简报</h2><p>写下想和 ${data.name} 一起做的项目。示例会把简报保存为本地文本。</p><form><label>你的称呼<input name="author" required maxlength="80" autocomplete="name"></label><label>项目想法<textarea name="idea" required maxlength="4000"></textarea></label><button type="submit" class="raised">保存简报.txt</button><output aria-live="polite"></output></form>`);
  const form = body.querySelector('form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = new FormData(form);
    const note = [data.name + ' · 合作简报', fields.get('author'), '', fields.get('idea')].join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + note], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = data.name + '-合作简报.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    form.querySelector('output').textContent = '简报已生成。';
  });
}
function act(action) {
  if (action === 'home' || action === 'works') showWindow(action);
  if (action === 'about') dialog('关于 — Readme.txt', '<h2>' + data.name + '</h2><p>' + data.about + '</p>');
  if (action === 'services') dialog('服务 — Services.txt', '<h2>工作范围</h2><dl>' + data.services.map(([title,copy]) => '<dt>' + title + '</dt><dd>' + copy + '</dd>').join('') + '</dl>');
  if (action === 'contact') showContact();
  if (action === 'firstsong') {
    if (currentTrack === 0 && !audio.paused) audio.pause();
    else playTrack(0);
  }
}
function time(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  return Math.floor(total / 60) + ':' + String(total % 60).padStart(2,'0');
}
function playerState() {
  const playing = !audio.paused && !audio.ended;
  const play = document.querySelector('#play');
  play.textContent = playing ? 'Ⅱ' : '▶';
  play.setAttribute('aria-label', (playing ? '暂停 ' : '播放 ') + data.works[currentTrack][0]);
  document.querySelector('[data-action="firstsong"]').lastChild.textContent = playing && currentTrack === 0 ? '暂停第一首' : '播放第一首';
  const elapsed = document.querySelector('#elapsed');
  elapsed.textContent = time(audio.currentTime) + ' / ' + (Number.isFinite(audio.duration) ? time(Math.round(audio.duration)) : data.works[currentTrack][1].split(' / ')[1]);
}
async function playTrack(index) {
  if (currentTrack !== index) {
    currentTrack = index;
    audio.src = 'assets/track' + (index + 1) + '.mp3';
  }
  document.querySelector('#songname').textContent = data.works[index][0];
  document.querySelector('#album').src = 'assets/' + data.works[index][2];
  try { await audio.play(); }
  catch (error) {
    if (error.name !== 'AbortError') document.querySelector('#elapsed').textContent = '请点击重试';
  }
}
if (audio) {
  ['timeupdate','loadedmetadata','play','pause','ended'].forEach(type => audio.addEventListener(type, playerState));
  document.querySelector('#play').addEventListener('click', () => audio.paused ? playTrack(currentTrack) : audio.pause());
  document.querySelector('#nextsong').addEventListener('click', () => playTrack((currentTrack + 1) % data.works.length));
}
start.addEventListener('click', () => toggleStart(startMenu.hidden));
document.addEventListener('click', event => {
  const target = event.target.closest('button,a');
  if (!start.contains(event.target)) toggleStart(false);
  if (!target) {
    if (event.target === viewer) {
      const {left,right,top,bottom} = viewer.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) viewer.close();
    }
    return;
  }
  if (target.matches('[data-action]')) act(target.dataset.action);
  if (target.matches('[data-work]')) showWork(Number(target.dataset.work));
  if (target.matches('[data-step]')) showWork(currentWork + Number(target.dataset.step));
  if (target.matches('.close')) viewer.close();
  if (target.matches('[data-hide]')) {
    const window = document.getElementById(target.dataset.hide);
    setExpanded(window,false);
    window.hidden = true;
    start.focus();
  }
  if (target.matches('[data-max]')) {
    const window = document.getElementById(target.dataset.max);
    setExpanded(window,!window.classList.contains('expanded'));
  }
  if (target.matches('[data-listen]')) {
    viewer.close();
    showWindow('home');
    playTrack(currentWork);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !viewer.open) {
    if (!startMenu.hidden) { toggleStart(false); start.focus(); }
    document.querySelectorAll('.expanded').forEach(item => setExpanded(item,false));
  }
  if (viewer.open && body.querySelector('[data-step]') && ['ArrowLeft','ArrowRight'].includes(event.key)) {
    event.preventDefault();
    showWork(currentWork + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
function clock() {
  document.querySelector('#clock').textContent = new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
}
clock();
setInterval(clock, 15000);
