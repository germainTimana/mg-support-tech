import { Global, Module } from '@nestjs/common';
import { AppLogger } from './app-logger.service';

@Global()
@Module({
  providers: [
    {
      provide: AppLogger,
      useFactory: () =>
        new AppLogger(
          (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' | 'verbose') ||
            'info',
        ),
    },
  ],
  exports: [AppLogger],
})
export class LoggerModule {}
