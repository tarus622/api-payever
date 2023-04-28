import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type ImageDocument = HydratedDocument<Image>;

@Schema()
export class Image {
  @Prop({type: String, ref: 'User', required: true })
  userId: ObjectId;
  
  @Prop()
  imageName: string;

  @Prop()
  base64: Buffer;
}

export const ImageSchema = SchemaFactory.createForClass(Image);