# Shop Shooter Game

Install the package from this repository:

```sh
bun add github:HNDTechContrib/project-ShopShooter
```

Mount the single-player game canvas in any browser app:

```ts
import {mountShopShooter} from 'shop-shooter-game';

const unmount = mountShopShooter(document.querySelector('#game')!);
// Call unmount() when the host view is removed.
```

Mount the multiplayer canvas by providing the WebSocket server endpoint:

```ts
import {mountShopShooter} from 'shop-shooter-game';

const unmount = mountShopShooter(document.querySelector('#game')!, {
  mode: 'multiplayer',
  webSocketUrl: 'wss://games.example.com/ws',
});
```

`mode` defaults to `shooter`. The multiplayer server must implement the room
protocol used by this project and accept connections at the supplied URL.
`mountShopShooter` returns a cleanup function that unmounts React and removes
the embedded canvas. The game is rendered in a Shadow DOM so its styles remain
isolated from the host project.

Build both the standalone demo and the package with:

```sh
bun run build
```
