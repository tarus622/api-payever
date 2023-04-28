import { readFile, unlink } from 'fs/promises';
import { Buffer } from 'buffer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitService } from '../rabbitmq/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { existsSync } from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly rabbitService: RabbitService,
    private readonly mailerService: MailerService
  ) { }

  // Create new User
  async create(createUserDto: CreateUserDto, file: Express.Multer.File): Promise<User> {

    const fileBuffer = await readFile(file.path)

    const createdUser = new this.userModel({
      name: createUserDto.name,
      password: await bcrypt.hash(createUserDto.password, 10),
      email: createUserDto.email,
      imageName: file.filename,
      imageFile: fileBuffer
    });

    
    return await createdUser.save()
    .then(async (result) => {
      await this.mailerService.sendMail({
        to: createdUser.email,
        subject: 'User created!',
        text: 'Congratulations! You successfully register to us site!'
      })
      await this.rabbitService.publishEvent();
        return result;
      })
      .catch((error) => {
        console.error(error);
        throw new Error('Error creating User');
      }
      )
  }

  // Find User by "id"
  async findOne(id: mongoose.Types.ObjectId): Promise<UserResponseDto> {    
    try {
      const user = await this.userModel.findById(id).exec();
      const userToReturn = new UserResponseDto(user);
      return userToReturn;      
    } catch (error) {
      console.error(error.message);
    }
  }

  // Find User image avatar by "id"
  async findUserAvatar(id: mongoose.Types.ObjectId) {
    try {
      const user = await this.userModel.findById(id).exec();
      const buffer = Buffer.from(user.imageFile)
      return buffer.toString('base64');
      
    } catch (error) {
      console.error(error.message);
    }
  }

  // Find User by "id" and remove this User
  async remove(id: mongoose.Types.ObjectId) {

    const user = await this.userModel.findByIdAndRemove(id).exec();

    if (!user) {
      return "Error: User not found 😿";
    }
    if (existsSync(__dirname + `/../../uploads/${user.imageName}`)) {
      unlink(__dirname + `/../../uploads/${user.imageName}`)
    }

    return `This User has been removed of the database:\n\n${user}`;
  }
}
