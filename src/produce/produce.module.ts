import { Module } from '@nestjs/common';
import { ProduceController } from './produce.controller';
import { ProduceService } from './produce.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ProduceController],
  providers: [ProduceService],
})
export class ProduceModule {}
