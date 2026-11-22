'use strict';
const specimen = document.querySelector('.specimen');
const picker = specimen.querySelector('select');
const mode = specimen.querySelector('.mode');
const preview = specimen.querySelector('.specimen-image');
let alternative = false;
function updateSpecimen() {
  const work = data.works[Number(picker.value)];
  const index = Number(alternative);
  preview.src = 'assets/' + (alternative ? work[2].replace('.webp', '-alt.webp') : work[2]);
  preview.alt = work[1] + '，' + data.modes[index];
  specimen.querySelector('output').textContent = data.modes[index];
  mode.textContent = data.commands[index];
  mode.setAttribute('aria-pressed', String(alternative));
}
mode.addEventListener('click', () => {
  alternative = !alternative;
  updateSpecimen();
});
picker.addEventListener('change', updateSpecimen);
