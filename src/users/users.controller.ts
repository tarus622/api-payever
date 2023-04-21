import { Controller, Get, Post, Body, UseInterceptors, Param, Delete, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ClientProxy } from '@nestjs/microservices'
import * as rabbitmqService from '../rabbitmq/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';
import mongoose from 'mongoose';

@Controller('api/users')
export class UsersController {
  private readonly client: ClientProxy;

  constructor(private readonly usersService: UsersService, private readonly rabbitService: rabbitmqService.RabbitService, 
    private readonly mailerService: MailerService){}
  
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
    await this.rabbitService.publishEvent();
    await this.mailerService.sendMail({
      to: createdUser.email,
      subject: 'User created!',
      text: 'Congratulations! You successfully register to us site!'
    })

    return createdUser;
  }

  // Find user by id
  @Get(':id')
  async findOne(@Param('id') id: mongoose.Types.ObjectId
  ) {
    return this.usersService.findOne(id);
  }

  // Get avatar base64 
  @Get(':id/avatar')
  async findUserAvatar(@Param('id') id: mongoose.Types.ObjectId
  ) {
    return this.usersService.findUserAvatar(id);
  }

  // Delete user 
  @Delete(':id')
  async remove(@Param('id') id: mongoose.Types.ObjectId
  ) {
    return this.usersService.remove(id);
  }
}
