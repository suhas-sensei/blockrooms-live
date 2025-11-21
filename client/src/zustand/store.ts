import { create } from "zustand";
import { persist } from "zustand/middleware";

enum GamePhase {
  UNINITIALIZED = "uninitialized",
  INITIALIZED = "initialized",
  ACTIVE = "active",
  COMPLETED = "completed",
  GAME_OVER = "game_over",
}

// Local game types (no blockchain)
interface Player {
  player_id: string;
  position: { x: number; y: number };
  current_room: number;
  health: number;
  max_health: number;
  shards: number;
  rooms_cleared: number;
  is_alive: boolean;
  game_active: boolean;
  has_key: boolean;
  has_shard_one: boolean;
  has_shard_two: boolean;
  has_shard_three: boolean;
  special_ability_cooldown: number;
}

interface PlayerStats {
  player_id: string;
  games_played: number;
  games_won: number;
  total_shards_collected: number;
}

interface GameSession {
  session_id: string;
  start_time: number;
  rooms_cleared: number;
  victory_achieved: boolean;
  session_complete: boolean;
}

interface GameConfig {
  grid_size: number;
  starting_health: number;
  entity_spawn_rate: number;
  door_detection_range: number;
}

interface Entity {
  entity_id: string;
  entity_type: string;
  room_id: number;
  position: { x: number; y: number };
  health: number;
  is_alive: boolean;
  damage_per_turn: number;
}

interface Room {
  room_id: number;
  initialized: boolean;
  cleared: boolean;
  entity_count: number;
  has_treasure: boolean;
}

interface ShardLocation {
  shard_id: string;
  room_id: number;
  numbered_shard: string;
  collected: boolean;
}

interface AppState {
  // Core player data (local)
  player: Player | null;
  playerStats: PlayerStats | null;
  gameSession: GameSession | null;
  gameConfig: GameConfig | null;

  // Current room and world state
  currentRoom: Room | null;
  rooms: Map<string, Room>;
  entities: Entity[];
  shardLocations: ShardLocation[];

  // Door state
  nearbyDoors: any[];

  // Game state
  gamePhase: GamePhase;
  isPlayerInitialized: boolean;
  canTakeActions: boolean;
  actionsThisTurn: number;
  maxActionsPerTurn: number;

  // UI/UX state
  isLoading: boolean;
  error: string | null;
  lastTransaction: string | null;
  actionInProgress: boolean;
  connectionStatus: "connected" | "connecting" | "disconnected";

  // Game statistics
  gameStats: {
    currentHealth: number;
    maxHealth: number;
    currentShards: number;
    roomsCleared: number;
    turnNumber: number;
    dodgeActiveTurns: number;
    hasAllNumberedShards: boolean;
    hasKey: boolean;
    isAlive: boolean;
    gameActive: boolean;
    movementLocked: boolean;
    specialAbilityCooldown: number;
  };

  // UI/Game state for 3D game compatibility
  gameStarted: boolean;
  showWarning: boolean;
  showGun: boolean;
  showTalkieIntro: boolean;
  showCrosshair: boolean;
  showMapTracker: boolean;
  position: { x: number; y: number; z: number };
  rotation: number;
  moving: boolean;
  velocity: { x: number; y: number; z: number };
  activeWeapon: "pistol" | "shotgun";
}

// Define actions interface
interface AppActions {
  // Core state setters
  setPlayer: (player: Player | null) => void;
  setPlayerStats: (stats: PlayerStats | null) => void;
  setGameSession: (session: GameSession | null) => void;
  setGameConfig: (config: GameConfig | null) => void;

  // World state management
  setCurrentRoom: (room: Room | null) => void;
  updateRoom: (room: Room) => void;
  setRooms: (rooms: Room[]) => void;
  setNearbyDoors: (doors: any[]) => void;
  setEntities: (entities: Entity[]) => void;
  updateEntity: (entity: Entity) => void;
  removeEntity: (entityId: string) => void;
  setShardLocations: (locations: ShardLocation[]) => void;
  updateShardLocation: (location: ShardLocation) => void;

  // Game state management
  setGamePhase: (phase: GamePhase) => void;
  setPlayerInitialized: (initialized: boolean) => void;
  setCanTakeActions: (can: boolean) => void;
  setActionsThisTurn: (count: number) => void;
  incrementActionsThisTurn: () => void;
  resetActionsThisTurn: () => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastTransaction: (txHash: string | null) => void;
  setActionInProgress: (inProgress: boolean) => void;
  setConnectionStatus: (status: "connected" | "connecting" | "disconnected") => void;

  // Game lifecycle
  initializeGame: () => void;
  startNewGame: () => void;
  endGame: () => void;
  respawnPlayer: () => void;
  resetGame: () => void;

  // UI/Game actions for 3D game compatibility
  startGame: () => void;
  hideWarning: () => void;
  setShowWarning: (show: boolean) => void;
  setShowGun: (show: boolean) => void;
  setShowTalkieIntro: (show: boolean) => void;
  setShowCrosshair: (show: boolean) => void;
  setShowMapTracker: (show: boolean) => void;
  updatePosition: (position: { x: number; y: number; z: number }) => void;
  updateRotation: (rotation: number) => void;
  setMoving: (moving: boolean) => void;
  setVelocity: (velocity: { x: number; y: number; z: number }) => void;
  setActiveWeapon: (weapon: "pistol" | "shotgun") => void;

  // Utility getters
  canMove: () => boolean;
  canAttack: () => boolean;
  canCollectShard: (roomId: string, shardId: string) => boolean | undefined;
  getEntitiesInCurrentRoom: () => Entity[];
  getShardsInCurrentRoom: () => ShardLocation[];
  getRoomById: (roomId: string) => Room | null;
  getEntityById: (entityId: string) => Entity | null;
  isRoomCleared: (roomId: string) => boolean;
  getActionsRemaining: () => number;
}

// Combine state and actions
type AppStore = AppState & AppActions;

// Helper to update game stats from player data
const updateGameStats = (player: Player | null): AppState["gameStats"] => {
  if (!player) {
    return {
      currentHealth: 0,
      maxHealth: 0,
      currentShards: 0,
      roomsCleared: 0,
      turnNumber: 0,
      dodgeActiveTurns: 0,
      hasAllNumberedShards: false,
      hasKey: false,
      isAlive: false,
      gameActive: false,
      movementLocked: false,
      specialAbilityCooldown: 0,
    };
  }

  return {
    currentHealth: Number(player.health),
    maxHealth: Number(player.max_health),
    currentShards: Number(player.shards),
    roomsCleared: Number(player.rooms_cleared),
    turnNumber: 1,
    dodgeActiveTurns: 0,
    hasAllNumberedShards: player.has_shard_one && player.has_shard_two && player.has_shard_three,
    hasKey: player.has_key,
    isAlive: player.is_alive,
    gameActive: player.game_active,
    movementLocked: false,
    specialAbilityCooldown: Number(player.special_ability_cooldown),
  };
};

// Helper to determine game phase based on state
const determineGamePhase = (player: Player | null, gameSession: GameSession | null): GamePhase => {
  if (!player) return GamePhase.UNINITIALIZED;
  if (!player.is_alive) return GamePhase.GAME_OVER;
  if (gameSession?.victory_achieved) return GamePhase.COMPLETED;
  if (gameSession?.session_complete && !gameSession.victory_achieved) return GamePhase.GAME_OVER;
  if (player.game_active) return GamePhase.ACTIVE;
  return GamePhase.INITIALIZED;
};

// Create default player for local game
const createDefaultPlayer = (): Player => ({
  player_id: "local-player",
  position: { x: 400, y: 400 },
  current_room: 0,
  health: 100,
  max_health: 100,
  shards: 0,
  rooms_cleared: 0,
  is_alive: true,
  game_active: true,
  has_key: false,
  has_shard_one: false,
  has_shard_two: false,
  has_shard_three: false,
  special_ability_cooldown: 0,
});

const createDefaultPlayerStats = (): PlayerStats => ({
  player_id: "local-player",
  games_played: 0,
  games_won: 0,
  total_shards_collected: 0,
});

const createDefaultGameSession = (): GameSession => ({
  session_id: "local-session",
  start_time: Date.now(),
  rooms_cleared: 0,
  victory_achieved: false,
  session_complete: false,
});

const createDefaultGameConfig = (): GameConfig => ({
  grid_size: 800,
  starting_health: 100,
  entity_spawn_rate: 2,
  door_detection_range: 50,
});

// Initial state
const initialState: AppState = {
  player: null,
  playerStats: null,
  gameSession: null,
  gameConfig: null,
  currentRoom: null,
  rooms: new Map(),
  entities: [],
  shardLocations: [],
  nearbyDoors: [],
  gamePhase: GamePhase.UNINITIALIZED,
  isPlayerInitialized: false,
  canTakeActions: false,
  actionsThisTurn: 0,
  maxActionsPerTurn: 3,
  isLoading: false,
  error: null,
  lastTransaction: null,
  actionInProgress: false,
  connectionStatus: "disconnected",
  gameStats: {
    currentHealth: 0,
    maxHealth: 0,
    currentShards: 0,
    roomsCleared: 0,
    turnNumber: 0,
    dodgeActiveTurns: 0,
    hasAllNumberedShards: false,
    hasKey: false,
    isAlive: false,
    gameActive: false,
    movementLocked: false,
    specialAbilityCooldown: 0,
  },
  gameStarted: false,
  showWarning: true,
  showGun: false,
  showTalkieIntro: false,
  showCrosshair: true,
  showMapTracker: true,
  position: { x: 400, y: 1.5, z: 400 },
  rotation: 0,
  moving: false,
  velocity: { x: 0, y: 0, z: 0 },
  activeWeapon: "pistol",
};

// Create the store
const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPlayer: (player) =>
        set((state) => {
          const gameStats = updateGameStats(player);
          const gamePhase = determineGamePhase(player, state.gameSession);
          const canTakeActions = player?.game_active && player?.is_alive;
          const isPlayerInitialized = player !== null || state.playerStats !== null;
          return { player, gameStats, gamePhase, canTakeActions: canTakeActions || false, isPlayerInitialized };
        }),

      setPlayerStats: (playerStats) =>
        set((state) => {
          const isPlayerInitialized = playerStats !== null || state.player !== null;
          return { playerStats, isPlayerInitialized };
        }),

      setGameSession: (gameSession) =>
        set((state) => {
          const gamePhase = determineGamePhase(state.player, gameSession);
          return { gameSession, gamePhase };
        }),

      setGameConfig: (gameConfig) => set({ gameConfig, maxActionsPerTurn: 3 }),

      setCurrentRoom: (currentRoom) => set({ currentRoom }),

      updateRoom: (room) =>
        set((state) => {
          const newRooms = new Map(state.rooms);
          newRooms.set(room.room_id.toString(), room);
          const currentRoom = state.currentRoom?.room_id.toString() === room.room_id.toString() ? room : state.currentRoom;
          return { rooms: newRooms, currentRoom };
        }),

      setRooms: (rooms) =>
        set(() => {
          const roomMap = new Map(rooms.map((r) => [r.room_id.toString(), r]));
          return { rooms: roomMap };
        }),

      setNearbyDoors: (nearbyDoors) => set({ nearbyDoors }),

      setEntities: (entities) => set(() => ({ entities })),

      updateEntity: (entity) =>
        set((state) => {
          const entityId = entity.entity_id.toString();
          const entities = state.entities.filter((e) => e.entity_id.toString() !== entityId);
          return { entities: [...entities, entity] };
        }),

      removeEntity: (entityId) =>
        set((state) => ({
          entities: state.entities.filter((e) => e.entity_id.toString() !== entityId.toString()),
        })),

      setShardLocations: (locations) => set(() => ({ shardLocations: locations })),

      updateShardLocation: (location) =>
        set((state) => {
          const shardId = location.shard_id.toString();
          const shards = state.shardLocations.filter((s) => s.shard_id.toString() !== shardId);
          return { shardLocations: [...shards, location] };
        }),

      setGamePhase: (gamePhase) => set({ gamePhase }),
      setPlayerInitialized: (isPlayerInitialized) => set({ isPlayerInitialized }),
      setCanTakeActions: (canTakeActions) => set({ canTakeActions }),
      setActionsThisTurn: (actionsThisTurn) => set({ actionsThisTurn }),
      incrementActionsThisTurn: () => set((state) => ({ actionsThisTurn: state.actionsThisTurn + 1 })),
      resetActionsThisTurn: () => set({ actionsThisTurn: 0 }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setLastTransaction: (lastTransaction) => set({ lastTransaction }),
      setActionInProgress: (actionInProgress) => set({ actionInProgress }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

      initializeGame: () =>
        set({
          gamePhase: GamePhase.INITIALIZED,
          error: null,
          isLoading: true,
        }),

      startNewGame: () =>
        set({
          gamePhase: GamePhase.ACTIVE,
          error: null,
          actionsThisTurn: 0,
        }),

      endGame: () =>
        set({
          gamePhase: GamePhase.COMPLETED,
          canTakeActions: false,
        }),

      respawnPlayer: () =>
        set({
          gamePhase: GamePhase.ACTIVE,
          error: null,
          actionsThisTurn: 0,
        }),

      resetGame: () =>
        set({
          ...initialState,
          connectionStatus: get().connectionStatus,
        }),

      startGame: () =>
        set(() => {
          // Initialize local game state
          const player = createDefaultPlayer();
          const playerStats = createDefaultPlayerStats();
          const gameSession = createDefaultGameSession();
          const gameConfig = createDefaultGameConfig();
          const gameStats = updateGameStats(player);

          return {
            gameStarted: true,
            showWarning: false,
            gamePhase: GamePhase.ACTIVE,
            player,
            playerStats,
            gameSession,
            gameConfig,
            gameStats,
            isPlayerInitialized: true,
            canTakeActions: true,
            connectionStatus: "connected",
          };
        }),

      hideWarning: () => set({ showWarning: false }),
      setShowWarning: (showWarning) => set({ showWarning }),
      setShowGun: (showGun) => set({ showGun }),
      setShowTalkieIntro: (showTalkieIntro) => set({ showTalkieIntro }),
      setShowCrosshair: (showCrosshair) => set({ showCrosshair }),
      setShowMapTracker: (showMapTracker) => set({ showMapTracker }),

      updatePosition: (position) =>
        set((state) => {
          if (state.player) {
            return {
              position,
              player: {
                ...state.player,
                position: {
                  x: Math.round(position.x),
                  y: Math.round(position.z),
                },
              },
            };
          }
          return { position };
        }),

      updateRotation: (rotation) => set({ rotation }),
      setMoving: (moving) => set({ moving }),
      setVelocity: (velocity) => set({ velocity }),
      setActiveWeapon: (activeWeapon) => set({ activeWeapon }),

      canMove: () => {
        const state = get();
        return (
          state.canTakeActions &&
          !state.actionInProgress &&
          !state.gameStats.movementLocked &&
          state.gamePhase === GamePhase.ACTIVE &&
          state.actionsThisTurn < state.maxActionsPerTurn
        );
      },

      canAttack: () => {
        const state = get();
        return (
          state.canTakeActions &&
          !state.actionInProgress &&
          state.gamePhase === GamePhase.ACTIVE &&
          state.actionsThisTurn < state.maxActionsPerTurn
        );
      },

      canCollectShard: (roomId: string, shardId: string) => {
        const state = get();
        const shard = state.shardLocations.find((s) => s.shard_id.toString() === shardId);
        return (
          state.canTakeActions &&
          !state.actionInProgress &&
          state.gamePhase === GamePhase.ACTIVE &&
          shard &&
          !shard.collected &&
          shard.room_id.toString() === roomId &&
          state.actionsThisTurn < state.maxActionsPerTurn
        );
      },

      getEntitiesInCurrentRoom: () => {
        const state = get();
        if (!state.currentRoom) return [];
        return state.entities.filter(
          (entity) => entity.room_id.toString() === state.currentRoom?.room_id.toString() && entity.is_alive
        );
      },

      getShardsInCurrentRoom: () => {
        const state = get();
        if (!state.currentRoom) return [];
        return state.shardLocations.filter(
          (shard) => shard.room_id.toString() === state.currentRoom?.room_id.toString() && !shard.collected
        );
      },

      getRoomById: (roomId: string) => {
        const state = get();
        return state.rooms.get(roomId) || null;
      },

      getEntityById: (entityId: string) => {
        const state = get();
        return state.entities.find((e) => e.entity_id.toString() === entityId) || null;
      },

      isRoomCleared: (roomId: string) => {
        const state = get();
        const room = state.rooms.get(roomId);
        return room?.cleared || false;
      },

      getActionsRemaining: () => {
        const state = get();
        return Math.max(0, state.maxActionsPerTurn - state.actionsThisTurn);
      },
    }),
    {
      name: "blockrooms-store",
      partialize: (state) => ({
        player: state.player,
        playerStats: state.playerStats,
        gameSession: state.gameSession,
        gameConfig: state.gameConfig,
        currentRoom: state.currentRoom,
        isPlayerInitialized: state.isPlayerInitialized,
        gameStats: state.gameStats,
        gamePhase: state.gamePhase,
        gameStarted: state.gameStarted,
        position: state.position,
      }),
    }
  )
);

export default useAppStore;
export { GamePhase };
export type { AppState, AppActions, AppStore, Player, PlayerStats, GameSession, GameConfig, Entity, Room, ShardLocation };
