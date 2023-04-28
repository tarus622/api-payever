import { readFile, unlink } from 'fs/promises';
import { Buffer } from 'buffer';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitService } from '../rabbitmq/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { UserResponseGetDto } from './dto/response-user-get.dto';
import { UserResponsePostDto } from './dto/response-user-post.dto';
import { User } from './schemas/user.schema';
import { Image } from './schemas/image.schema';
import * as bcrypt from 'bcrypt';
import { existsSync } from 'fs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Image.name) private imageModel: Model<Image>,
    private readonly rabbitService: RabbitService,
    private readonly mailerService: MailerService
  ) { }

  // Create new User
  async create(createUserDto: CreateUserDto, createImageDto: CreateImageDto, file: Express.Multer.File): Promise<UserResponsePostDto> {

    const fileBuffer = await readFile(file.path)

    const userToCreate = new this.userModel({
      name: createUserDto.name,
      password: await bcrypt.hash(createUserDto.password, 10),
      email: createUserDto.email
    });

    const userCreated = await userToCreate.save();

    const createdImage = new this.imageModel({
      userId: userCreated._id,
      imageName: createImageDto.imageName,
      base64: fileBuffer
    })

    
    return await createdImage.save()
    .then(async () => {
      await this.mailerService.sendMail({
        to: userCreated.email,
        subject: 'User created!',
        text: 'Congratulations! You successfully register to us site!'
      })
      await this.rabbitService.publishEvent();
        return new UserResponsePostDto({
          name: userCreated.name,
          password: userCreated.password,
          email: userCreated.email,
          imageName: createdImage.imageName
        });
      })
      .catch((error) => {
        console.error(error);
        throw new Error('Error creating User');
      }
      )
  }

  // Find User by "id"
  async findOne(id: mongoose.Types.ObjectId): Promise<UserResponseGetDto> {
    try {
      const user = await this.userModel.findById(id).exec();
      const userToReturn = new UserResponseGetDto(user);
      return userToReturn;
    } catch (error) {
      console.error(error.message);
    }
  }

  // Find User image avatar by "id"
  async findUserAvatar(id: mongoose.Types.ObjectId) {
    try {
      const image = await this.imageModel.findOne({ userId: id }).exec();
      const buffer = Buffer.from(image.base64);
      return buffer.toString('base64');

    } catch (error) {
      console.error(error.message);
    }
  }

  // Find User by "id" and remove the avatar of this User
  async remove(id: mongoose.Types.ObjectId) {

    // const user = await this.userModel.findByIdAndRemove(id).exec();
    const image = await this.imageModel.findOneAndDelete({userId: id}).exec();

    if (!image) {
      return "Error: User not found 😿";
    }

    if (existsSync(__dirname + `/../../uploads/${image.imageName}`)) {
      unlink(__dirname + `/../../uploads/${image.imageName}`)
    }

    return `This Avatar has been removed of the database:\n\n${image}`;
  }
}
