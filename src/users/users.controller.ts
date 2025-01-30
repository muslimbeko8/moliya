import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LogInUserDto } from './dto/user-login.dto';
import { ConfigService } from 'src/common/config/config.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as jwt from 'jsonwebtoken';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 10000);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new BadRequestException('Only image files are allowed!'), false);
  }
  callback(null, true);
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('photo', { 
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async create(
    @UploadedFile() photo: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      if (photo) {
        createUserDto.photo = photo.filename;
      }
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error.message === 'Bu email bilan xodim allaqachon mavjud.') {
        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: error.message,
        }, HttpStatus.CONFLICT);
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Registration failed',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() loginUserDto: LogInUserDto) {
    try {
      return await this.usersService.login(loginUserDto);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', { 
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    try {
      if (photo) {
        updateUserDto.photo = photo.filename;
      }
      return await this.usersService.update(+id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Update failed',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id/photo')
  @UseInterceptors(FileInterceptor('photo', { 
    storage,
    fileFilter: imageFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async updatePhoto(
    @Param('id') id: string,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    if (!photo) {
      throw new BadRequestException('Photo file is required');
    }

    try {
      return await this.usersService.update(+id, { photo: photo.filename });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Photo update failed',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(+id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: 'User deleted successfully' };
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const result = await this.usersService.refreshToken(refreshToken);
      return {
        message: 'Token refreshed successfully',
        ...result,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Get('me')
  async getMe(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const decoded: any = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_SECRET'),
      );
      return await this.usersService.getMe(decoded.userId);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}