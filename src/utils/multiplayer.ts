import { ArenaPlayer, ArenaBullet, ArenaBotEnemy } from '../types';

type MessageHandler = (data: any) => void;

class MultiplayerManager {
  private ws: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<MessageHandler> = new Set();
  public isConnected: boolean = false;
  public roomCode: string | null = null;
  public myPlayerId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('shop_shooter_multiplayer_channel');
      this.broadcastChannel.onmessage = (event) => {
        this.dispatch(event.data);
      };
    }
  }

  public connect(roomCode: string, player: ArenaPlayer) {
    this.roomCode = roomCode.toUpperCase();
    this.myPlayerId = player.id;

    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.send({
          type: 'join-room',
          roomCode: this.roomCode,
          player,
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.dispatch(msg);
        } catch {}
      };

      this.ws.onerror = () => {
        // Fallback to BroadcastChannel
        this.isConnected = true;
      };

      this.ws.onclose = () => {
        this.isConnected = false;
      };
    } catch {
      this.isConnected = true;
    }

    // Broadcast join event through BroadcastChannel as well
    this.broadcastChannel?.postMessage({
      type: 'player-joined-channel',
      roomCode: this.roomCode,
      player,
    });
  }

  public send(data: any) {
    const payload = { ...data, senderId: this.myPlayerId, roomCode: this.roomCode };

    // Send via WebSocket if open
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }

    // Also send via BroadcastChannel for multi-tab zero latency
    try {
      this.broadcastChannel?.postMessage(payload);
    } catch {}
  }

  public sendPlayerUpdate(updates: Partial<ArenaPlayer>) {
    this.send({
      type: 'player-update',
      updates,
    });
  }

  public sendBulletFired(bullet: ArenaBullet) {
    this.send({
      type: 'player-shoot',
      bullet,
    });
  }

  public sendBotHit(botId: string, damage: number, scorerId: string, points: number) {
    this.send({
      type: 'bot-hit',
      botId,
      damage,
      scorerId,
      points,
    });
  }

  public sendStartMatch() {
    this.send({
      type: 'start-match',
    });
  }

  public onMessage(handler: MessageHandler) {
    this.listeners.add(handler);
    return () => {
      this.listeners.delete(handler);
    };
  }

  private dispatch(data: any) {
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.error('Multiplayer dispatch error:', err);
      }
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.roomCode = null;
  }
}

export const multiplayerManager = new MultiplayerManager();
