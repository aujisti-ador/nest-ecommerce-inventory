import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LocalAuthenticationGuard } from './localAuthentication.guard';
import { LoginUserDto } from './dto/login.dto';
import { Request, Response } from 'express';
import JwtAuthenticationGuard from './jwt-authentication.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
      const cookie = this.authService.getCookieWithJwtToken(user.id);
      response.setHeader('Set-Cookie', cookie);
      return response.json(user); // Set cookie before sending JSON response
    } catch (error) {
      return response.status(400).json({ message: 'Wrong credentials provided' });
    }
  }

  @UseGuards(JwtAuthenticationGuard)
  @Post('logout')
  async logOut(@Req() request: Request, @Res() response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(200);
  }

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

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
