import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }

  // Create new User
  async create(createUserDto: CreateUserDto, file: Express.Multer.File) {
    console.log(file[0])
    const { name, email, password } = createUserDto;


    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    const createdUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      imageName: file[0].filename,
      imageFile: file
    });

    return (await createdUser.save()
      .catch((error) => {
        console.error(error);
        throw new Error('Error creating User');

      }
      )
    )
  }


  // Find User by "id"
  async findOne(id: ObjectId) {
    const user = await this.userModel.findById(id).exec();
    
    return user;
  }

  // Find User image avatar by "id"
  async findUserAvatar(id: ObjectId) {
    const user = await this.userModel.findById(id).exec();
    const userAvatar = user.imageFile;

    if (!userAvatar) {
      return "Error: user avatar not found 😿";
    }
    
    const base64Image = userAvatar.toString('base64');
    return base64Image;
  }

  // Find User by "id" and remove this User
  async remove(id: ObjectId) {

    const user = await this.userModel.findByIdAndRemove(id).exec();


    if (!user) {
      return "Error: User not found 😿";
    }
    return `This User has been removed of the database:\n\n${user}`;
  }
}
