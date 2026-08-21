import './style.css';
import { ext } from '@/utils/runtime';

const slider = document.querySelector<HTMLInputElement>('#opacity')!;
const value = document.querySelector<HTMLOutputElement>('#opacity-value')!;
const toggle = document.querySelector<HTMLButtonElement>('#toggle')!;

void ext()
  .runtime.sendMessage({ type: 'daytime-get' })
  .then((response) => {
    const settings = response as { enabled?: boolean; opacity?: number } | undefined;
    updateOpacity(settings?.opacity ?? 1);
    updateEnabled(settings?.enabled !== false);
  });

slider.addEventListener('input', () => {
  const opacity = Number(slider.value) / 100;
  updateOpacity(opacity);
  void ext().runtime.sendMessage({ type: 'daytime-set-opacity', opacity });
});

toggle.addEventListener('click', () => {
  const enabled = toggle.dataset.enabled !== 'true';
  updateEnabled(enabled);
  void ext().runtime.sendMessage({ type: 'daytime-set', enabled });
});

function updateOpacity(opacity: number) {
  const percentage = Math.round(opacity * 100);
  slider.value = String(percentage);
  value.value = `${percentage}%`;
  value.textContent = `${percentage}%`;
}

function updateEnabled(enabled: boolean) {
  toggle.dataset.enabled = String(enabled);
  toggle.textContent = enabled ? 'Deactivate overlay' : 'Activate overlay';
}
