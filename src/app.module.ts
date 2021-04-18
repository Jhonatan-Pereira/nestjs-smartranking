import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JogadoresModule } from './jogadores/jogadores.module';
import { ConfigModule } from '@nestjs/config';
import { environment } from './environments/environment'
@Module({
  imports: [
    JogadoresModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${environment.mongo_user}:${environment.mongo_password}@${environment.mongo_host}/${environment.mongo_database}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      }
    )
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
