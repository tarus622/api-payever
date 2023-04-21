import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService }  from './users.service';
import { RabbitService } from '../rabbitmq/rabbitmq.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UserSchema, UserDocument } from './schemas/user.schema';
import mongoose, { Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { Readable } from 'stream';

// File to be used in "create()" test
const file: Express.Multer.File = {
  fieldname: 'image',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: '/uploads',
  filename: 'test.jpg',
  path: '/uploads/test.jpg',
  buffer: Buffer.from('test'),
  stream: new Readable
}

// Model to create an user
const UserModelCreate = mongoose.model<UserDocument>('User', UserSchema);
const userToCreate = new UserModelCreate({
  name: 'Davi', 
  email: 'davi@gmail.com',
  password:'pantera',
  imageName: file.filename,
  imageFile: file
})

// Model to get an user
const UserModelGet = mongoose.model<UserDocument>('User', UserSchema);
const userToGet = new UserModelGet({
  _id: new Types.ObjectId(),
  name: 'Davi', 
  password:'pantera',
  email: 'davi@gmail.com',
  imageName: 'turtle',
  imageFile: ''
})

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{
        provide: UsersService, 
        useValue: {
          create: jest.fn().mockResolvedValue(userToCreate),
          findOne: jest.fn().mockResolvedValue(userToGet),
          findUserAvatar: jest.fn(),
          remove: jest.fn()
        }
      }, {
        provide: RabbitService,
        useValue: {
          publishEvent: jest.fn()
        }
      },
    {
      provide: MailerService,
      useValue: {
        sendMail: jest.fn()
      }
    }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // create() test
  describe('create', () => {
    it('Should create an user successfully', async () => {
      // Act
      const createUserDto = new CreateUserDto();
      const result = await controller.create(createUserDto, file);
      console.log(result);

      // Assert
      expect(result).toEqual(userToCreate);
    })
  })

  // findOne() test
  describe('findOne', () => {
    it('Should find a user successfully', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await controller.findOne(userId._id);

      // Assert
      expect(result).toEqual(userToGet);
    })
  })
});
