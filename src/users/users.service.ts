import { readFile } from 'fs/promises';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { RabbitService } from '../rabbitmq/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';
import mongoose, { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

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
    
    await this.rabbitService.publishEvent();

    await createdUser.save()
      .then(await this.mailerService.sendMail({
        to: createdUser.email,
        subject: 'User created!',
        text: 'Congratulations! You successfully register to us site!'
      }))
      .catch((error) => {
        console.error(error);
        throw new Error('Error creating User');
      }
      )

    return createdUser;

  }


  // Find User by "id"
  async findOne(id: mongoose.Types.ObjectId) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      return "Error: user not found 😿"
    }

    return user;
  }

  // Find User image avatar by "id"
  async findUserAvatar(id: mongoose.Types.ObjectId) {
    const user = await this.userModel.findById(id).exec();
    const userAvatar = user.imageFile;

    if (!userAvatar) {
      return "Error: user avatar not found 😿";
    }

    const base64Image = userAvatar.toString('base64');
    return base64Image;
  }

  // Find User by "id" and remove this User
  async remove(id: mongoose.Types.ObjectId) {

    const user = await this.userModel.findByIdAndRemove(id).exec();


    if (!user) {
      return "Error: User not found 😿";
    }
    return `This User has been removed of the database:\n\n${user}`;
  }
}
