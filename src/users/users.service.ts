import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogInUserDto } from './dto/user-login.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './users.modul';
import { ConfigService } from 'src/common/config/config.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users) private readonly usersModel: typeof Users,
    private readonly configService: ConfigService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersModel.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new Error('Bu email bilan xodim allaqachon mavjud.');
    }
    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashPassword;
    await this.usersModel.create(createUserDto);

    const user = await this.FindByEmail(createUserDto.email);

    const accessToken = this.generateAccessToken({
      email: user.email,
      userId: user.id,
    });
    const refreshToken = this.generateRefreshToken({
      email: user.email,
      userId: user.id,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(loginUserDto: LogInUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.FindByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.dataValues.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = this.generateAccessToken({
      email: user.dataValues.email,
      userId: user.dataValues.id,
    });
    const refreshToken = this.generateRefreshToken({
      email: user.dataValues.email,
      userId: user.dataValues.id,
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  findAll() {
    return this.usersModel.findAll();
  }

  findOne(id: number) {
    return this.usersModel.findByPk(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const [updated] = await this.usersModel.update(updateUserDto, {
      where: { id },
    });

    if (updated === 0) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return this.findOne(id);
  }

  remove(id: number) {
    return this.usersModel.destroy({ where: { id } });
  }

  FindByEmail(email: string) {
    return this.usersModel.findOne({
      where: { email },
    });
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const decoded = jwt.verify(
        oldRefreshToken,
        this.configService.get('JWT_REFRESH_SECRET'),
      );

      const accessToken = this.generateAccessToken({
        email: decoded.email,
        userId: decoded.userId,
      });

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateAccessToken(data: { email: string; userId: number }) {
    return jwt.sign(data, this.configService.get('JWT_ACCESS_SECRET'), {
      expiresIn: '1h',
    });
  }

  private generateRefreshToken(data: { email: string; userId: number }) {
    return jwt.sign(data, this.configService.get('JWT_REFRESH_SECRET'), {
      expiresIn: '8h',
    });
  }
}
