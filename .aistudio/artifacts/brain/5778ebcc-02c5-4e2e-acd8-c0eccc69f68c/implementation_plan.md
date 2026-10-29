# Rencana Refaktorisasi Modular ShopShooter

Dokumen ini berisi hasil audit komprehensif source code project ShopShooter, arsitektur modular yang diusulkan, dan rencana implementasi bertahap untuk merestrukturisasi codebase agar setiap file memiliki tanggung jawab tunggal (Single Responsibility Principle) dan berada dalam rentang ideal (<300 baris per file).

---

## 1. Audit Source Code

Berdasarkan analisis file source code (`src/`):

### File Utama & Ukuran Saat Ini:
1. **`src/components/MultiplayerArena.tsx` (2.528 baris)** — **KRITIS**
   - *Tanggung jawab bercampur*: Inisialisasi Firebase & WebSocket, Sinkronisasi Room Firestore, State HUD (skor, waktu, kills, skill aktif, respawn), Input Controller (Desktop WASD/Mouse & Mobile Joystick 360°/Aim Wheel/Shoot), Roster Generator & Bot Spawning, Top Scoreboard Header, Tactical Minimap/Radar, Live Killfeed, Respawn Modal, dan Modal Manager.
   - *Rencana*: Dipecah menjadi hook sinkronisasi networking, hook input handling, generator roster, serta subkomponen HUD dan Controls mandiri. Target file utama: **<280 baris**.

2. **`src/game/rendering/renderTankModel.ts` (491 baris)** — **TINGGI**
   - *Tanggung jawab*: Rendering top-down tank (treads, chassis, visor, dual blaster, weapon skin, accessories seperti crown/horns/halo, dan team neon aura).
   - *Rencana*: Pisahkan helper aksesori dan efek trail ke modul terpisah (`renderTankAccessories.ts`).

3. **`src/components/arena/MultiplayerRoomPanel.tsx` (391 baris)** — **MODERAT**
   - *Tanggung jawab*: Panel waiting room multiplayer (room code, share link, slot selector, player cards, bot manager, host actions).
   - *Rencana*: Ekstraksi subkomponen `RoomPlayerCard` dan `RoomSettingsToolbar`. Target: **<250 baris**.

4. **`src/components/friends/FriendsManagerModal.tsx` (335 baris)** — **MODERAT**
   - *Tanggung jawab*: Manajemen pertemanan (tab Teman, Cari Pemain, Permintaan).
   - *Rencana*: Pertahankan stabilitas (baru saja diperbaiki dari bug React hooks), pisahkan item kartu jika diperlukan.

5. **`src/components/LeaderboardView.tsx` (312 baris)** — **MODERAT**
   - *Tanggung jawab*: Tab peringkat ace, mingguan, dan reward.

6. **`src/components/profile/PlayerProfileModal.tsx` (303 baris)** — **MODERAT**
   - *Tanggung jawab*: Modal profil pemain, bio, statistik, dan save profile.

---

## 2. Struktur Folder Modular yang Diusulkan

```
src/
├── components/
│   ├── arena/
│   │   ├── ArenaLobbyView.tsx             # Panel lobby utama
│   │   ├── MultiplayerRoomPanel.tsx       # Waiting room
│   │   ├── SoloLobbyPanel.tsx             # Panel mode vs AI
│   │   ├── ArenaMatchResultModal.tsx      # Modal kemenangan / kekalahan
│   │   ├── LobbyMapShowcase.tsx           # Showcase kartu map di lobby
│   │   ├── LobbyLightParticles.tsx        # Partikel estetika lobby
│   │   ├── hud/                           # [BARU] Subkomponen HUD Arena
│   │   │   ├── ArenaScoreHeader.tsx       # Scoreboard atas, timer, hp bar
│   │   │   ├── ArenaKillFeedOverlay.tsx   # Animasi killfeed
│   │   │   ├── ArenaRespawnModal.tsx      # Countdown respawn & tombol instan
│   │   │   └── ArenaDesktopControlsBar.tsx# Helper shortcut keyboard desktop
│   │   └── controls/                      # [BARU] Input Controls
│   │       └── ArenaMobileControls.tsx    # Joystick 360°, aim wheel & shoot
│   ├── friends/                           # Fitur Pertemanan
│   ├── profile/                           # Fitur Profil Pemain
│   ├── shooter/                           # Target Practice Mode
│   ├── cart/                              # Checkout & Poin Diskon
│   └── MultiplayerArena.tsx               # Orchestrator ramping (<280 baris)
│
├── game/
│   ├── arena/
│   │   └── rosterGenerator.ts             # [BARU] Logika generate tim & bot
│   ├── hooks/
│   │   ├── useArenaRoomSync.ts            # [BARU] Firestore & WebSocket sync
│   │   └── useArenaInput.ts               # [BARU] Keyboard, mouse, touch aim
│   ├── rendering/
│   │   ├── renderTankModel.ts
│   │   ├── renderTankAccessories.ts       # [BARU] Pembantu aksesori & trail
│   │   ├── renderTacticalRadar.ts
│   │   └── ...
│   └── systems/                           # Game physics & combat systems
```

---

## 3. Rencana Refaktorisasi Bertahap

### **Tahap 1: Ekstraksi Subkomponen Presentasi Arena HUD & Controls**
- Buat `src/components/arena/hud/ArenaScoreHeader.tsx` (~130 baris)
- Buat `src/components/arena/hud/ArenaKillFeedOverlay.tsx` (~40 baris)
- Buat `src/components/arena/hud/ArenaRespawnModal.tsx` (~55 baris)
- Buat `src/components/arena/hud/ArenaDesktopControlsBar.tsx` (~45 baris)
- Buat `src/components/arena/controls/ArenaMobileControls.tsx` (~120 baris)

### **Tahap 2: Ekstraksi Logika Roster & Bot Spawner**
- Buat `src/game/arena/rosterGenerator.ts` (~160 baris) yang membungkus:
  - Pembagian tim Biru / Merah sesuai mode (VS AI vs Multiplayer).
  - Posisi spawn base masing-masing tim.
  - Harmonisasi warna dan kustomisasi sesuai palet tim.

### **Tahap 3: Ekstraksi Hook Networking & Room Sync**
- Buat `src/game/hooks/useArenaRoomSync.ts` (~250 baris):
  - Inisialisasi Firebase Auth & Firestore listener (`onSnapshot`).
  - WebSocket connection lifecycle & event dispatchers.
  - Aksi: `handleJoinMultiplayerRoom`, `handleLeaveRoom`, `handleDeleteRoom`, `handleAddBot`, `handleKickPlayer`, `handleUpdateBotTeam`, `handleSelectTeam`, `handleSelectMapTheme`, `handleUpdateTotalSlots`.

### **Tahap 4: Ekstraksi Hook Input Controller**
- Buat `src/game/hooks/useArenaInput.ts` (~160 baris):
  - Mouse movement, world-to-screen aim conversion.
  - Keyboard listener (WASD, panah, Space/Shift Dash, F Fullscreen).
  - Virtual joystick & aim touch handlers.
  - Window blur/visibility change input reset guards.

### **Tahap 5: Perampingan `MultiplayerArena.tsx`**
- Hubungkan hook dan subkomponen yang sudah diekstraksi ke dalam `MultiplayerArena.tsx`.
- Pastikan tidak ada props drilling yang rusak, pertahankan 100% perilaku state, ref game loop 60 FPS, dan callback.
- Kurangi ukuran file dari 2.528 baris menjadi <280 baris.

### **Tahap 6: Optimasi File Sekunder (>300 baris)**
- Pecah `src/game/rendering/renderTankModel.ts` untuk memisahkan aksesori tank.
- Rapikan `MultiplayerRoomPanel.tsx`.

---

## 4. Strategi Pengujian & Verifikasi

1. **Static Analysis & Type Checking**:
   - Jalankan `compile_applet` untuk memastikan TypeScript build sukses tanpa ada type mismatch, missing props, atau circular dependencies.
   - Jalankan `lint_applet` untuk memastikan standar code linting terpenuhi.

2. **Functional Integrity Checks**:
   - **Mode Solo VS AI**: Tank pemain spawn di markas tim yang dipilih (Biru di kiri, Merah di kanan), bot spawn di base yang berlawanan dan bertarung secara normal.
   - **Multiplayer TDM Room**: Buat room, share code, tambah bot, ubah tim bot, kick bot, ubah slot pemain, ganti peta, dan start match via Firestore + WebSocket.
   - **In-Game Combat & HUD**:
     - Skor Biru dan Merah bertambah saat eliminasi.
     - Timer 90 detik berjalan lancar.
     - Radar Tactical di kiri atas menampilkan titik dan nama pemain secara realtime.
     - Killfeed menampilkan log eliminasi.
     - Layar Respawn muncul saat pemain gugur dan tombol instan respawn berfungsi.
     - Kontrol Desktop (WASD, mouse aim, Dash spasi) dan Kontrol Mobile (Joystick 360°, Tombol Tembak, Aim Wheel) responsif.
   - **End Match Modal**: Statistik hasil pertandingan (Victory/Defeat/Draw), reward diskon poin, dan navigasi kembali ke lobby.
   - **Kustomisasi & Profil**: Modal kustomisasi karakter dan modal profil pemain tetap terhubung ke penyimpanan lokal.

3. **Performance Assurance**:
   - Canvas game loop tetap 60 FPS menggunakan mutable `simState` ref tanpa re-render React DOM yang tidak perlu saat frame render.
