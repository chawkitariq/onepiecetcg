import { DataSource } from 'typeorm';
import { getApiConfig } from '../runtime-config';
import { SpikeNote } from './spike-note.entity';

describe('TypeORM PostgreSQL spike', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    const config = getApiConfig();

    dataSource = new DataSource({
      type: 'postgres',
      host: config.database.host,
      port: config.database.port,
      username: config.database.user,
      password: config.database.password,
      database: config.database.name,
      entities: [SpikeNote],
      synchronize: true,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('persists and reads a minimal entity', async () => {
    const notes = dataSource.getRepository(SpikeNote);
    const label = `step-0-${Date.now()}`;

    const saved = await notes.save(
      notes.create({
        label,
      }),
    );
    const found = await notes.findOneByOrFail({ id: saved.id });

    expect(found.label).toBe(label);
  });
});
