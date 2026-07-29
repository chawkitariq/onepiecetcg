/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import type { SpecialHandlerDefinition } from '../../types/effect-registry';

/**
 * Handles Vegapunk:
 * If you have a total of 2 or more given DON!! cards, this Character gains [Blocker].
 *
 * "Given DON!! cards" means DON!! cards attached to this character.
 * [Blocker] is player-declared per the spec and not enforced server-side.
 */
export const op13112SpecialHandler: SpecialHandlerDefinition = {
  id: 'op13-112-special',
  cardId: 'OP13-112',
  resolve(event, engine) {
    if (event.type !== 'onPlay' && event.type !== 'onDonAttached') return;

    const anyEngine = engine as any;
    const host = anyEngine.host;
    const source = host.getCard(event.sourceInstanceId);
    if (!source) return;

    const attachedDon = source.attachedDon ?? 0;
    if (attachedDon >= 2) {
      host.addLog(`[Vegapunk] ${attachedDon} given DON!! — gains [Blocker].`);
    }
  },
};
