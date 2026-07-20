import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'spike_notes' })
export class SpikeNote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  label!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
