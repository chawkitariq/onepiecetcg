import type { CardEffectDefinition } from '@onepiecetcg/shared';

export const manualEffectOverrides: readonly CardEffectDefinition[] = [
  {
    cardId: 'OP01-047',
    specialHandlerId: 'trafalgar-law-on-play',
  },
] as const;
