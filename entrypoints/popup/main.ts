import './style.css';
import { getEnabled, setEnabled } from '@/utils/settings';

const button = document.querySelector<HTMLButtonElement>('#toggle')!;

function render(enabled: boolean) {
  button.textContent = enabled ? 'Deactivate overlay' : 'Activate overlay';
  button.dataset.enabled = String(enabled);
}

const enabled = await getEnabled();
render(enabled);

button.addEventListener('click', async () => {
  const next = button.dataset.enabled !== 'true';
  await setEnabled(next);
  render(next);
});
