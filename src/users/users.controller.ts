import { Controller, Get, Post, Body, UseInterceptors, Param, Delete, UploadedFile } from '@nestjs/common';
import * as fs from 'fs/promises';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import mongoose from 'mongoose';
import { User } from './schemas/user.schema';

// Interface to define the shape of the request body for creating a user
interface CreateUserRequest {
  name: string;
  password: string;
  email: string;
  imageName: string;
  imageFile: Buffer;
}

@Controller('api/users')

export class UsersController {

  constructor(private readonly usersService: UsersService) { }

  // Route handler to create a new user
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


  async create(@Body() body: CreateUserRequest, @UploadedFile() file: Express.Multer.File): Promise<User> {

    // Call usersService.create() method with extracted data to create a new user

    try {
      // Set the image name and read the file from disk
      body.imageName = file.filename;
      body.imageFile = await fs.readFile(file.path);
      // Validate and create a new user using the CreateUserDto class
      const createUserDto = new CreateUserDto(body);
      return await this.usersService.create(createUserDto, file)
    } catch (error) {
      // If there was an error creating the user, delete the uploaded file and log the error
      fs.unlink(file.path)
      console.error(error.message)
      return error.message;
    }
  }



  // Route handler to get a single user by id
  @Get(':id')
  async findOne(@Param('id') id: mongoose.Types.ObjectId) {
    return await this.usersService.findOne(id);
  }

  // Route handler to get a user's avatar as a base64-encoded string
  @Get(':id/avatar')
  async findUserAvatar(@Param('id') id: mongoose.Types.ObjectId) {
    return this.usersService.findUserAvatar(id);
  }

  // Route handler to delete a user by id
  @Delete(':id') async remove(@Param('id') id: mongoose.Types.ObjectId) {
    return this.usersService.remove(id);
  }
}
