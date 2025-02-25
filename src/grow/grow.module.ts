import { Module } from '@nestjs/common';
import { GrowController } from './grow.controller';
import { GrowService } from './grow.service';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [GrowController],
  providers: [GrowService],
})
export class GrowModule {}
