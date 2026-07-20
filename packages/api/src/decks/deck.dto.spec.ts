import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DeckIdParamDto, DeckPayloadDto, ImportDeckTextDto } from './deck.dto';

describe('deck DTO validation', () => {
  it('accepts a structurally valid deck payload', async () => {
    const dto = plainToInstance(DeckPayloadDto, {
      name: 'Red deck',
      leaderCardId: 'ST01-001',
      cards: [{ cardId: 'ST01-002', quantity: 4 }],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects malformed deck payloads before service validation', async () => {
    const dto = plainToInstance(DeckPayloadDto, {
      name: '',
      leaderCardId: 42,
      cards: [{ cardId: 'ST01-002', quantity: 1.5 }],
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['leaderCardId', 'cards']),
    );
  });

  it('validates deck text import payloads', async () => {
    const dto = plainToInstance(ImportDeckTextDto, {
      text: '1xST01-001\n4xST01-002',
      name: 'Import',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('validates deck id route params as UUIDs', async () => {
    const dto = plainToInstance(DeckIdParamDto, {
      id: '1b10c4ba-7280-4d3b-a74e-15fbdbde0168',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
