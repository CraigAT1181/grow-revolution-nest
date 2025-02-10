import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ProduceService {
  // Access credentials centrally using ConfigService and pass into SupabaseClient
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async fetchAllProduce() {
    const { data, error } = await this.supabase.from('produce').select('*');

    if (error) throw new Error(error.message);

    return data;
  }

  async checkProduceMonthExists(produceId: string, monthId: string) {
    const { data, error } = await this.supabase
      .from('produce_months')
      .select('*')
      .eq('produce_id', produceId)
      .eq('month_id', monthId)
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  async fetchProduceById(produceId: string) {
    const { data, error } = await this.supabase
      .from('produce')
      .select('*')
      .eq('produce_id', produceId)
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  async getProduceForMonth(monthId: string) {
    const { data, error } = await this.supabase
      .from('produce_months')
      .select('produce_id')
      .eq('month_id', monthId);

    if (error) throw new Error(error.message);

    if (!data.length) return [];

    const produceList = await Promise.all(
      data.map(async (entry) => {
        return this.fetchProduceById(entry.produce_id);
      }),
    );

    return produceList;
  }
}
