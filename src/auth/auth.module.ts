import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtRefreshTokenStrategy } from './strategy/jwt.RefreshTokenStrategy';

@Module({
  imports: [TypeOrmModule.forFeature([User]),
    UsersModule,
    PassportModule,
    ConfigModule,
  JwtModule.registerAsync({
    imports: [ConfigModule.forRoot()],
    inject: [ConfigService],
    useFactory: async () => ({
    })
  })
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, LocalStrategy, JwtStrategy, JwtRefreshTokenStrategy],
})
export class AuthModule { }
