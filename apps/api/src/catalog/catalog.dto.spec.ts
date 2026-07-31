import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CatalogCardParamDto, CatalogSearchQueryDto } from './catalog.dto';

describe('catalog DTO validation', () => {
  it('accepts supported search filters and transforms cost', async () => {
    const dto = plainToInstance(CatalogSearchQueryDto, {
      q: 'luffy',
      set: 'OP01',
      type: 'Character',
      color: 'Red',
      cost: '3',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.cost).toBe(3);
  });

  it('rejects unsupported enum values and invalid numeric filters', async () => {
    const dto = plainToInstance(CatalogSearchQueryDto, {
      type: 'Monster',
      color: 'Orange',
      cost: '-1',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['type', 'color', 'cost']),
    );
  });

  it('validates card id route params', async () => {
    const dto = plainToInstance(CatalogCardParamDto, { id: 'OP01-001' });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });
});
