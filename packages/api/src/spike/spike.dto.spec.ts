import { validate } from 'class-validator';
import { SpikeTypeormQueryDto } from './spike.dto';

describe('spike DTO validation', () => {
  it('accepts an optional typeorm spike label', async () => {
    const dto = new SpikeTypeormQueryDto();
    dto.label = 'step-0';

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects oversized labels', async () => {
    const dto = new SpikeTypeormQueryDto();
    dto.label = 'x'.repeat(81);

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toContain('label');
  });
});
