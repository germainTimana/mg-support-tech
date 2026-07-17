import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EquiposModule } from './equipos/equipos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { PagosModule } from './pagos/pagos.module';
import { EventsModule } from './events/events.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    EquiposModule,
    ServiciosModule,
    PagosModule,
    EventsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
