import { ApiProperty } from "@nestjs/swagger";

export class UserResponsePostDto {
  @ApiProperty()
  name: string;
  
  @ApiProperty()
  password: string

  @ApiProperty()
  email: string;

  @ApiProperty()
  imageName: string



  constructor(data: any) {
    this.name = data.name,
    this.password = data.password,
    this.email = data.email,
    this.imageName = data.imageName
  }
}
