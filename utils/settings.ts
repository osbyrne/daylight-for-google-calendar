export const ENABLED_KEY = 'daytimeEnabled';

export async function getEnabled(): Promise<boolean> {
  const result = await browser.storage.local.get(ENABLED_KEY);
  return result[ENABLED_KEY] !== false;
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await browser.storage.local.set({ [ENABLED_KEY]: enabled });
}
