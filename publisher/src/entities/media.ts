import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Package } from './package';
import { BaseModel } from './base';
import { MediaStatus, MediaType } from '../shared/types';


@Entity('media')
export class Media extends BaseModel {
    @ManyToOne(() => Package, (pkg) => pkg.media, { onDelete: 'CASCADE' })
    package!: Package;

    @Column('text')
    originalUrl!: string;

    @Column('text', { nullable: true })
    filename?: string; // Nullable field for the filename

    @Column('text', { nullable: true })
    newUrl?: string; // Nullable field for the processed URL

    @Column({ type: 'enum', enum: MediaType })
    mediaType!: MediaType;

    @Column({ type: 'enum', enum: MediaStatus })
    status!: MediaStatus;

    @Column('text', { nullable: true })
    errorMessage?: string; // Nullable field for error messages

}
