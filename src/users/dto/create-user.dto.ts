export class CreateUserDto {
    readonly name: string;
    readonly password: string;
    readonly email: string;
    readonly imageName: string;
    readonly imageFile: Buffer;
  } 