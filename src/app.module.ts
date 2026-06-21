import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { JwtGuard } from './common/guards/jwt.guard';
import { PlaylistsModule } from './playlists/playlists.module';
import { TracksModule } from './tracks/tracks.module';
import { SocialModule } from './social/social.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [AuthModule,    
     JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    PrismaModule,
    UserModule,
    PlaylistsModule,
    TracksModule,
    SocialModule,
    SyncModule,

  
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: 'APP_GUARD',
      useClass: JwtGuard,
    }
    
  ],
})
export class AppModule {}
