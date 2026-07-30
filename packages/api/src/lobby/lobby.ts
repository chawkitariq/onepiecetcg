import { matchMaker } from 'colyseus';
import type { DescribedRoomListResponse } from '@onepiecetcg/shared';

const DUEL_ROOM_NAME = 'duel';

type DuelRoomMetadata = {
  description?: unknown;
};

/**
 * Exposes hosted public "described lobbies" (docs/spec.md §5) -- `duel`
 * rooms carrying a host-provided free-text `description` in their Colyseus
 * listing metadata. The description itself is never interpreted here, only
 * stored and relayed, same as card text stays declarative for players.
 *
 * Kept decorator-free (no Nest `@Controller`/`@Injectable`) so it can be
 * unit-tested directly against a real `@colyseus/testing` server without
 * Jest choking on `@thallesp/nestjs-better-auth`'s ESM-only build.
 */
export async function listDescribedDuelRooms(): Promise<DescribedRoomListResponse> {
  const rooms = await matchMaker.query({ name: DUEL_ROOM_NAME });

  const describedRooms = rooms
    .filter((room) => !room.locked && room.clients < room.maxClients)
    .map((room) => {
      const metadata = room.metadata as DuelRoomMetadata | undefined;
      const description =
        typeof metadata?.description === 'string' ? metadata.description : '';

      return {
        roomId: room.roomId,
        description,
        clients: room.clients,
        maxClients: room.maxClients,
      };
    })
    .filter((room) => room.description.length > 0);

  return { rooms: describedRooms };
}
