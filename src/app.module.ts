import { APP_INTERCEPTOR, APP_FILTER, APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule} from 'nestjs-redis';
import { Module } from '@nestjs/common';

import configuration from './config/configuration';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { ValidationPipe } from './shared/validation.pipe';
import { AllExceptionFilter } from './shared/exception.filter';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AssetModule } from './asset/asset.module';
import { GlobalJwtModule } from './shared/jwt.module';
import { OccupationModule } from './occupation/occupation.module';
import { CompanyModule } from './company/company.module';
import { BranchModule } from './branch/branch.module';
import { VerificationModule } from './verification/verification.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';
import { TagModule } from './tag/tag.module';
import { ReferenceModule } from './reference/reference.module';
import { ContactModule } from './contact/contact.module';
import { NotificationModule } from './notification/notification.module';
import { AddressModule } from './address/address.module';
import { ReportModule } from './report/report.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { OfferModule } from './offer/offer.module';
import { InterviewModule } from './interview/interview.module';
import { FileModule } from './file/file.module';
import { JobLogModule } from './job-log/job-log.module';
import { DegreeModule } from './degree/degree.module';
import { EmploymentModule } from './employment/employment.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
      isGlobal: true,
    }),

    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get('isProd') ? [] : [
          {
            rootPath: configService.get('uploadDir'),
            serveRoot: '/public',
          },
        ]
      }
    }),

    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 15,
      ignoreUserAgents: [
        /googlebot/gi,
        /bingbot/gi,
        /DuckDuckGo/gi,
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('typeorm'),
    }),

    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('redis'),
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('mail'),
    }),

    GlobalJwtModule,

    ScheduleModule.forRoot(),

    AuthModule,

    UserModule,

    AssetModule,

    OccupationModule,

    CompanyModule,

    BranchModule,

    VerificationModule,

    JobModule,

    ApplicationModule,

    TagModule,

    ReferenceModule,

    ContactModule,

    NotificationModule,

    AddressModule,

    ReportModule,

    SubscriptionModule,

    OfferModule,

    InterviewModule,

    FileModule,

    JobLogModule,

    DegreeModule,

    EmploymentModule,

    SupportModule,
  ],

  providers: [
    ...(process.env.NODE_ENV === 'production' ? [] : [{
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    }]),
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})

export class AppModule {}