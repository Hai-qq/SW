import { Controller, Get, Module } from '@nestjs/common';

@Controller()
class HealthController {
  @Get('/health')
  health() {
    return { ok: true };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}