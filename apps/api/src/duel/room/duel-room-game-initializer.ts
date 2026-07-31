import type { DuelState } from '@onepiecetcg/shared';

/**
 * Dependencies required to bootstrap the authoritative duel state once both
 * players have joined the room.
 */
export type DuelRoomGameInitializerDeps<TRuntime> = {
  state: DuelState;
  createRuntime: () => TRuntime;
  initializeRuntimeGame: (runtime: TRuntime) => void;
  adoptRuntime: (runtime: TRuntime) => void;
  lockRoom: () => Promise<void> | void;
};

/**
 * Runs the room-level game bootstrap sequence: initialize the isolated
 * gameplay runtime, adopt the runtime, then lock the room.
 */
export class DuelRoomGameInitializer<TRuntime extends { state: DuelState }> {
  public constructor(
    private readonly deps: DuelRoomGameInitializerDeps<TRuntime>,
  ) {}

  /**
   * Initializes the duel and promotes the prepared runtime to the live room.
   */
  public async initialize(): Promise<void> {
    const runtime = this.deps.createRuntime();

    this.deps.initializeRuntimeGame(runtime);
    this.deps.adoptRuntime(runtime);
    void this.deps.lockRoom();
  }
}
