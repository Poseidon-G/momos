import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseModel } from './base';
import { Package } from './package';

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseModel {
    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'varchar', length: 255 , default: 'user' })
    role!: string;

    @OneToMany(() => Package, (pkg) => pkg.user)
    packages!: Package[];
}