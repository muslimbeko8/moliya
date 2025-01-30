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
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('JWT token is missing');
    }

    try {
      const decodedToken = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_SECRET'),
      ) as jwt.JwtPayload;

      if (!decodedToken.email || !decodedToken.userId) {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.UserService.FindByEmail(decodedToken.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Add user details to the request for downstream processing
      request.user = {
        id: decodedToken.userId,
        email: decodedToken.email,
      };

      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }

      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Authentication error');
    }
  }
}
