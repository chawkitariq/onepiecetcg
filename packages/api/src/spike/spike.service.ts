import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpikeNote } from './spike-note.entity';

@Injectable()
export class SpikeService {
  constructor(
    @InjectRepository(SpikeNote)
    private readonly notes: Repository<SpikeNote>,
  ) {}

  async persistAndRead(label = 'step-0') {
    const saved = await this.notes.save(
      this.notes.create({
        label,
      }),
    );
    const found = await this.notes.findOneByOrFail({ id: saved.id });

    return {
      savedId: saved.id,
      foundLabel: found.label,
    };
  }
}

