import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
