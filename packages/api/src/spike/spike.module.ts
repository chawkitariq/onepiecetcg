import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpikeController } from './spike.controller';
import { SpikeNote } from './spike-note.entity';
import { SpikeService } from './spike.service';

@Module({
  imports: [TypeOrmModule.forFeature([SpikeNote])],
  controllers: [SpikeController],
  providers: [SpikeService],
})
export class SpikeModule {}
