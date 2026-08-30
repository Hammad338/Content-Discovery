import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from './entities/user.entity';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const JWT_EXPIRES_IN = '7d';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {
    if (!process.env.JWT_SECRET) {
      this.logger.warn(
        'JWT_SECRET is not set — using an insecure dev default. Set JWT_SECRET in .env for production.',
      );
    }
  }

  async signup(name: string, email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.usersRepository.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersRepository.save(
      this.usersRepository.create({ name: name.trim(), email: normalizedEmail, passwordHash }),
    );

    return { user: this.toPublicUser(user), token: this.signToken(user) };
  }

  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({ where: { email: normalizedEmail } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { user: this.toPublicUser(user), token: this.signToken(user) };
  }

  async getUserFromToken(token: string): Promise<PublicUser> {
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.usersRepository.findOne({ where: { id: payload.sub as string } });
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.toPublicUser(user);
  }

  private signToken(user: UserEntity): string {
    return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  private toPublicUser(user: UserEntity): PublicUser {
    return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  }
}
