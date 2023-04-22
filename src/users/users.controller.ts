import { Controller, Get, Post, Body, UseInterceptors, Param, Delete, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import mongoose from 'mongoose';
import { User } from './schemas/user.schema';

@Controller('api/users')
export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads', // Set the destination folder for the uploaded files
      filename: (req, file, cb) => {
        const date = Date.now();
        const filename = date + file.originalname; // Generate a unique filename using the uuid library
        cb(null, filename);
      },
    })
  })) // Attach FilesInterceptor middleware to handle file uploads  
  
  async create(@Body() createUserDto: CreateUserDto, @UploadedFile() file: Express.Multer.File): Promise<User> {

    // Call usersService.create() method with extracted data to create a new user
    return await this.usersService.create(createUserDto, file);

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
