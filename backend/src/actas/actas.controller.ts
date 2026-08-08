import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { actasMulterOptions } from './actas.multer-options';
import { ActaUploadResponseDto } from './dto/acta-upload-response.dto';

@Controller('actas')
export class ActasController {
  @Post('upload')
  @Roles(Role.ADMIN, Role.TRANSCRIPTOR)
  @UseInterceptors(FileInterceptor('file', actasMulterOptions()))
  upload(@UploadedFile() file?: Express.Multer.File): ActaUploadResponseDto {
    if (!file)
      throw new BadRequestException('Debe adjuntar una imagen del acta');
    return { url: `/uploads/actas/${file.filename}` };
  }
}
