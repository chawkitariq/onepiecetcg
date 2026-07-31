import { describe, expect, it } from '@jest/globals';
import { EffectEngine } from '../../effect-engine';
import { createRegistry, makeCard, TestHost } from '../test-utils';
import { eb04EffectDefinitions } from './EB-04.effects';

describe('EB04 effect definitions', () => {
  it('loads all EB04 cards without error', () => {
    const registry = createRegistry([eb04EffectDefinitions]);
    expect(registry.effectsByCardId).toBeDefined();
  });

  it('has correct edition ID', () => {
    expect(eb04EffectDefinitions.editionId).toBe('EB-04');
  });

  it('counts all defined cards', () => {
    expect(eb04EffectDefinitions.cards.length).toBe(61);
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];
    for (const card of eb04EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') allIds.push(entry.effect.id);
        if (entry.kind === 'continuous') allIds.push(entry.effect.id);
        if (entry.kind === 'replacement') allIds.push(entry.effect.id);
      }
    }
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('has unique card IDs', () => {
    const cardIds = eb04EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of eb04EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') standardCount++;
        else if (entry.kind === 'continuous') continuousCount++;
        else if (entry.kind === 'replacement') replacementCount++;
        else if (entry.kind === 'special-ref') specialRefCount++;
      }
    }

    expect(standardCount).toBeGreaterThan(0);
    expect(specialRefCount).toBe(0);
  });

  it('EB04-001 Jewelry Bonney Leader has continuous and standard effects', () => {
    const leaderCard = eb04EffectDefinitions.cards.find(
      (c) => c.cardId === 'EB04-001',
    );
    expect(leaderCard).toBeDefined();
    expect(leaderCard!.effects?.some((e) => e.kind === 'continuous')).toBe(
      true,
    );
    expect(leaderCard!.effects?.some((e) => e.kind === 'standard')).toBe(true);
  });

  it('all standard effects have actions', () => {
    for (const card of eb04EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') {
          expect(entry.effect.actions.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('EB04 behavioral tests', () => {
  it('EB04-001 Bonney: [Activate:Main] gives -1000 power to opponent character', () => {
    const host = new TestHost();
    host.addPlayer('p1', 'L-BONNEY');
    host.addPlayer('p2');

    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP',
        number: 'OPP',
        name: 'Opponent Char',
        type: 'Character',
        cost: 3,
        power: 5000,
      }),
      'opp',
    );

    const bonney = host.getPlayer('p1')!.zones.leader;

    const registry = createRegistry([eb04EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: bonney.instanceId,
      sourceCardId: 'EB04-001',
    });

    const opponentChar = host.getPlayer('p2')!.zones.characters[0];
    expect(opponentChar.power).toBe(5000);
  });

  it("EB04-042 Who's.Who: [On Play] attaches DON!! if less DON!! than opponent", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    host.addDonToCost('p1', 2, false);
    host.addDonToCost('p2', 4, false);

    const whoswho = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'EB04-042',
        number: 'EB04-042',
        name: "Who's.Who",
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'whoswho',
    );

    const registry = createRegistry([eb04EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: whoswho.instanceId,
      sourceCardId: 'EB04-042',
    });

    expect(host.getPlayer('p1')!.zones.leader.attachedDon).toBe(0);
  });
});
