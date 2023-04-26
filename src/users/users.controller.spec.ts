import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema, UserDocument } from './schemas/user.schema';
import mongoose, { Types } from 'mongoose';
import { Readable } from 'stream';

// File to be used in "create()" test
const file: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'tartaruga.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './uploads',
  filename: '1681419398706tartaruga.jpg',
  path: 'uploads\\1681419398706tartaruga.jpg',
  size: 68906,
  stream: new Readable,
  buffer: undefined
}

// Create "CreateUserRequest" interface
interface CreateUserRequest {
  name: string;
  password: string;
  email: string;
  imageName: string;
  imageFile: Buffer;
}


// Model to create an user
//const UserModelCreate = mongoose.model<UserDocument>('User', UserSchema);
const userToCreate: CreateUserRequest = {
  name: 'Davi',
  password: 'Pantera622',
  email: 'davi@gmail.com',
  imageName: file.filename,
  imageFile: file.buffer
}

// Model to get an user
const UserModelGet = mongoose.model<UserDocument>('User', UserSchema);
const userToGet = new UserModelGet({
  _id: new Types.ObjectId(),
  name: 'Davi',
  password: 'Pantera622',
  email: 'davi@gmail.com',
  imageName: 'turtle',
  imageFile: file.buffer
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
          findUserAvatar: jest.fn().mockResolvedValue(userToGet.imageFile),
          remove: jest.fn().mockResolvedValue(userToGet)
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
      const result = await controller.create(userToCreate, file);
      expect(result).toEqual(userToCreate);
    })
  })

  // findOne() test
  describe('findOne', () => {
    it('Should find a user successfully', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await controller.findOne(userId);

      // Assert
      expect(result).toEqual(userToGet);
    })
  })

  // findUserAvatar() test
  describe('findUserAvatar', () => {
    it('Should find a user avatar successfully', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await controller.findUserAvatar(userId);

      // Assert
      expect(result).toEqual(userToGet.imageFile);
    }
    )
  })

  // remove() test
  describe('remove', () => {
    it('Should find a user and delete it', async () => {
      // Arrange
      const userId = userToGet._id; // ObjectId of the user

      // Act
      const result = await controller.remove(userId);

      // Assert
      expect(result).toEqual(userToGet);
    })
  })
});
