import { User } from '../entities/user';
import { BaseRepository } from './base.repository';
import { AppDataSource } from '../database/source';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(AppDataSource, User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({ where: { email } });
    }
}
