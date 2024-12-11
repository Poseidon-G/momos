//generate hashpassword

import * as bcrypt from 'bcrypt';
import Config from '../config';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, Config.SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}