import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '../config/config.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly UserService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization kaliti berilmagan');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('JWT kaliti topilmadi');
    }

    try {
      const decodedToken = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_SECRET'),
      ) as jwt.JwtPayload;

      if (!decodedToken.email) {
        throw new UnauthorizedException('Yaroqsiz token');
      }

      let user = null;
      if (!user) {
        user = await this.UserService.FindByEmail(decodedToken.email);
        if (!user) {
          throw new UnauthorizedException('Foydalanuvchi topilmadi');
        }
      }

    //   if (!user.is_active) {
    //     throw new ForbiddenException(
    //       'Sizning akkauntingiz tasdiqlanmagan. Iltimos, adminning tasdiqlashini kuting))',
    //     );
    //   }

      request.user = decodedToken;
      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Yaroqsiz token');
      }

      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Autentifikatsiya xatosi');
    }
  }
}
