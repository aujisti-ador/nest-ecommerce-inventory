import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { Role } from 'src/enums/role.enum';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsEnum(Role)
  @IsOptional()
  roles: Role;
}
