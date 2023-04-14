import { Controller, Get, Post, Body, UseInterceptors, Param, Delete, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ObjectId } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices'
import { RabbitService } from 'src/rabbitmq/rabbitmq.service';

@Controller('api/users')
export class UsersController {
  private readonly client: ClientProxy;

  constructor(private readonly usersService: UsersService, private readonly rabbitService: RabbitService){}
  
  @Post()
  @UseInterceptors(FilesInterceptor('file', 1, {
    storage: diskStorage({
      destination: './uploads', // Set the destination folder for the uploaded files
      filename: (req, file, cb) => {
        const date = Date.now();
        const filename = date + file.originalname; // Generate a unique filename using the uuid library
        cb(null, filename);
      },
    }) 
  })) // Attach FilesInterceptor middleware to handle file uploads  

  async create(@Body() createUserDto: CreateUserDto, @UploadedFiles() file: Express.Multer.File) {

    // Call usersService.create() method with extracted data to create a new user
    const createdUser =  await this.usersService.create(createUserDto, file);
    this.rabbitService.publishEvent();

    return createdUser;
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId) {
    return this.usersService.findOne(id);
  }

  @Get(':id/avatar')
  async findUserAvatar(@Param('id') id: ObjectId) {
    return this.usersService.findUserAvatar(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: ObjectId) {
    return this.usersService.remove(id);
  }
}
