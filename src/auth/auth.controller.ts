import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { Response } from 'express';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { UsersService } from 'src/users/users.service';
import JwtRefreshGuard from './jwt-refresh.guard';
import RequestWithUser from './dto/requestWithUser.interface';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('signin')
  async signIn(@Req() request: RequestWithUser, @Res() response: Response) {
    try {
      const { user } = request;
      const accessTokenCookie = this.authService.getCookieWithJwtToken(user.id);
      const refreshTokenCookie = this.authService.getCookieWithJwtRefreshToken(
        user.id,
      );

      await this.usersService.setCurrentRefreshToken(
        refreshTokenCookie.token,
        user.id,
      );

      // Create a combined array of cookies
      const cookies = [accessTokenCookie, refreshTokenCookie.cookie];

      // Set multiple cookies at once
      response.setHeader('Set-Cookie', cookies);

      // Omit the 'password' field from the user response
      const userWithRefreshToken = await this.usersService.findOneById(user.id);
      delete userWithRefreshToken.password;

      return response.json(userWithRefreshToken); // Set cookies before sending JSON response
    } catch (error) {
      return response
        .status(400)
        .json({ message: 'Wrong credentials provided' });
    }
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() request: RequestWithUser, @Res() response: any) {
    try {
      const { user } = request;
      const refreshToken = request.cookies['Refresh'];

      await this.usersService.getUserIfRefreshTokenMatches(
        refreshToken,
        user.id,
      );

      const accessTokenCookie = this.authService.getCookieWithJwtToken(user.id);

      // Set the new access token cookie
      response.setHeader('Set-Cookie', accessTokenCookie);

      // Omit the 'password' field from the user response
      const userWithoutPassword = { ...request.user };
      delete userWithoutPassword.password;

      return response.json(userWithoutPassword);
    } catch (error) {
      // Handle any errors here and return an appropriate response
      return response.status(500).json({ message: 'Internal server error' });
    }
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  async logOut(@Req() request: RequestWithUser, @Res() response: Response) {
    await this.usersService.removeRefreshToken(request.user.id);
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(200);
  }

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
