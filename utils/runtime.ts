type Ext = {
  runtime: {
    sendMessage: (msg: unknown) => Promise<unknown>;
    getURL?: (path: string) => string;
    onMessage: {
      addListener: (
        cb: (
          msg: unknown,
          sender: unknown,
          sendResponse: (response?: unknown) => void,
        ) => void,
      ) => void;
    };
  };
  action?: {
    onClicked: { addListener: (cb: () => void) => void };
    setIcon: (details: { path: string }) => Promise<void>;
    setTitle: (details: { title: string }) => Promise<void>;
  };
  storage?: {
    local: {
      get: (keys: string | string[]) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
  };
  tabs?: {
    query: (query: { url: string }) => Promise<Array<{ id?: number }>>;
    sendMessage: (tabId: number, msg: unknown) => Promise<unknown>;
  };
};

export function ext(): Ext {
  const chromeApi = (globalThis as { chrome?: Ext }).chrome;
  const browserApi = (globalThis as { browser?: Ext }).browser;
  const api = chromeApi ?? browserApi;
  if (!api?.runtime) throw new Error('extension runtime unavailable');
  return api;
}

export function isEnabledMessage(
  msg: unknown,
): msg is {
  type: 'daytime-changed' | 'daytime-get' | 'daytime-set' | 'daytime-set-opacity';
  enabled?: boolean;
  opacity?: number;
} {
  if (!msg || typeof msg !== 'object' || !('type' in msg)) return false;
  const type = (msg as { type: unknown }).type;
  return (
    type === 'daytime-changed' ||
    type === 'daytime-get' ||
    type === 'daytime-set' ||
    type === 'daytime-set-opacity'
  );
}
