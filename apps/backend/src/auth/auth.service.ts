import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserEntity } from './entities/user.entity';
import { MailService } from '../mail/mail.service';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const JWT_EXPIRES_IN = '7d';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly mailService: MailService,
  ) {
    if (!process.env.JWT_SECRET) {
      this.logger.warn(
        'JWT_SECRET is not set — using an insecure dev default. Set JWT_SECRET in .env for production.',
      );
    }
    if (ADMIN_EMAILS.length === 0) {
      this.logger.warn(
        'ADMIN_EMAILS is not set — no account will have admin access to the Admin Dashboard. ' +
          'Set ADMIN_EMAILS (comma-separated) in .env.',
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
    const role = this.resolveRole(normalizedEmail);
    const user = await this.usersRepository.save(
      this.usersRepository.create({ name: name.trim(), email: normalizedEmail, passwordHash, role }),
    );

    // Best-effort — sendWelcomeEmail handles and logs its own failures,
    // so a broken mail provider never blocks signup.
    await this.mailService.sendWelcomeEmail(user.email, user.name);

    return { user: this.toPublicUser(user), token: this.signToken(user) };
  }

  async login(email: string, password: string): Promise<{ user: PublicUser; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({ where: { email: normalizedEmail } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Re-resolve role on every login so adding an email to ADMIN_EMAILS
    // promotes an existing account the next time they sign in.
    const resolvedRole = this.resolveRole(normalizedEmail, user.role);
    if (resolvedRole !== user.role) {
      user.role = resolvedRole;
      await this.usersRepository.save(user);
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

  private resolveRole(email: string, currentRole: 'user' | 'admin' = 'user'): 'user' | 'admin' {
    return ADMIN_EMAILS.includes(email) ? 'admin' : currentRole;
  }

  private signToken(user: UserEntity): string {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  private toPublicUser(user: UserEntity): PublicUser {
    return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
