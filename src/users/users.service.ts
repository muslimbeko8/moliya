import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
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
      throw new ConflictException('Bu email bilan xodim allaqachon mavjud.');
    }

    const hashPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashPassword;
    
    const newUser = await this.usersModel.create(createUserDto);
    const { password, ...userWithoutPassword } = newUser.get({ plain: true });

    const accessToken = this.generateAccessToken({
      email: userWithoutPassword.email,
      userId: userWithoutPassword.id,
    });
    
    const refreshToken = this.generateRefreshToken({
      email: userWithoutPassword.email,
      userId: userWithoutPassword.id,
    });

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(loginUserDto: LogInUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.FindByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.dataValues.password,
    );
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user.dataValues;

    const accessToken = this.generateAccessToken({
      email: userWithoutPassword.email,
      userId: userWithoutPassword.id,
    });

    const refreshToken = this.generateRefreshToken({
      email: userWithoutPassword.email,
      userId: userWithoutPassword.id,
    });

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async findAll() {
    const users = await this.usersModel.findAll();
    return users.map(user => {
      const { password, ...userWithoutPassword } = user.get({ plain: true });
      return userWithoutPassword;
    });
  }

  async findOne(id: number) {
    const user = await this.usersModel.findByPk(id);
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user.get({ plain: true });
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // First check if user exists
    const user = await this.usersModel.findByPk(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    await this.usersModel.update(updateUserDto, {
      where: { id },
    });

    // Fetch and return updated user
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found after update`);
    }

    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.usersModel.findByPk(id);
    if (!user) {
      return false;
    }
    await user.destroy();
    return true;
  }

  async FindByEmail(email: string) {
    return this.usersModel.findOne({
      where: { email },
    });
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const decoded: any = jwt.verify(
        oldRefreshToken,
        this.configService.get('JWT_REFRESH_SECRET'),
      );

      // Verify user still exists
      const user = await this.findOne(decoded.userId);
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      const accessToken = this.generateAccessToken({
        email: decoded.email,
        userId: decoded.userId,
      });

      return { accessToken };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: number) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private generateAccessToken(data: { email: string; userId: number }) {
    return jwt.sign(data, this.configService.get('JWT_ACCESS_SECRET'), {
      expiresIn: '12h',
    });
  }

  private generateRefreshToken(data: { email: string; userId: number }) {
    return jwt.sign(data, this.configService.get('JWT_REFRESH_SECRET'), {
      expiresIn: '24h',
    });
  }
}