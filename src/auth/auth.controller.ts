import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { LoginUserDto } from './dto/login.dto';
import { Request, Response } from 'express';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import { UsersService } from 'src/users/users.service';
import JwtRefreshGuard from './jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }


  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('signin')
  async signIn(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      const loginUserDto: LoginUserDto = request.body;
      const user = await this.authService.getAuthenticatedUser(
        loginUserDto.email,
        loginUserDto.password,
      );
      const accessTokenCookie = this.authService.getCookieWithJwtToken(user.id);
      const refreshTokenCookie = this.authService.getCookieWithJwtRefreshToken(user.id);

      await this.usersService.setCurrentRefreshToken(refreshTokenCookie.token, user.id);

      // Create a combined array of cookies
      const cookies = [accessTokenCookie, refreshTokenCookie.cookie];

      // Set multiple cookies at once
      response.setHeader('Set-Cookie', cookies);

      // Omit the 'password' field from the user response
      const userWithRefreshToken = await this.usersService.findOne(user.id);
      delete userWithRefreshToken.password;

      return response.json(userWithRefreshToken); // Set cookies before sending JSON response
    } catch (error) {
      return response.status(400).json({ message: 'Wrong credentials provided' });
    }
  }

  @Get('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(@Req() request: any, @Res() response: any) {
    try {
      const { user } = request;
      const refreshToken = request.cookies['Refresh'];
  
      await this.usersService.getUserIfRefreshTokenMatches(refreshToken, user.id);
  
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
  async logOut(@Req() request: any, @Res() response: Response) {
    await this.usersService.removeRefreshToken(request.user.id);
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(200);
  }

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }
  s
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
