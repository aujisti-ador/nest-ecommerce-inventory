import { Exclude } from "class-transformer"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"
import { Role } from "src/enums/role.enum"

export class CreateUserDto {

    @IsString()
    username: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    phone: string

    @IsNotEmpty()
    @IsString()
    first_name: string

    @IsNotEmpty()
    @IsString()
    last_name: string

    @IsNotEmpty()
    @IsString()
    password: string

    roles: Role
}
