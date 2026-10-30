import {createRoot} from 'react-dom/client';
import ShopShooterGame, {type ShopShooterOptions} from './components/ShopShooterGame';
import stylesheet from './index.css?inline';

export type {ShopShooterOptions};

export function mountShopShooter(
  target: HTMLElement,
  options: ShopShooterOptions = {},
): () => void {
  const mode = options.mode ?? 'shooter';
  if (mode === 'multiplayer') {
    if (!options.webSocketUrl) {
      throw new Error('webSocketUrl is required when mode is "multiplayer".');
    }

    const protocol = new URL(options.webSocketUrl).protocol;
    if (protocol !== 'ws:' && protocol !== 'wss:') {
      throw new Error('webSocketUrl must use the ws: or wss: protocol.');
    }
  }

  const host = document.createElement('div');
  host.dataset.shopShooter = '';
  host.style.display = 'block';
  host.style.width = '100%';
  host.style.height = target.clientHeight > 0 ? '100%' : '100dvh';
  target.append(host);

  const shadowRoot = host.attachShadow({mode: 'open'});
  const style = document.createElement('style');
  style.textContent = stylesheet;
  const rootElement = document.createElement('div');
  rootElement.style.width = '100%';
  rootElement.style.height = '100%';
  shadowRoot.append(style, rootElement);

  const root = createRoot(rootElement);
  root.render(<ShopShooterGame {...options} mode={mode} />);

  let mounted = true;
  return () => {
    if (!mounted) return;
    mounted = false;
    root.unmount();
    host.remove();
  };
}
