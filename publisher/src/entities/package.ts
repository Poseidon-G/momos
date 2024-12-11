import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user';
import { Media } from './media';
import { BaseModel } from './base';
import { PackageStatus } from '../shared/types';

@Entity('packages')
export class Package extends BaseModel {
    @ManyToOne(() => User, (user) => user.packages, { onDelete: 'CASCADE' })
    user!: User;

    @Column('text')
    title!: string;

    @Column('text')
    description!: string;

    @Column({ type: 'enum', enum: PackageStatus })
    status!: PackageStatus;

    @OneToMany(() => Media, (media) => media.package)
    media!: Media[];
}
