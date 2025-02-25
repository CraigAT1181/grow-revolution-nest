import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class GrowService {
  // Access credentials centrally using ConfigService and pass into SupabaseClient
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async fetchAllProduce() {
    const { data, error } = await this.supabase.from('produce').select('*');

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

  async fetchMonths() {
    const { data, error } = await this.supabase.from('months').select('*');

    if (error) throw new Error(error.message);

    return data;
  }

  async getJobsByMonth(monthId: string) {
    try {
      const [getProduceJobs, getGeneralJobs] = await Promise.all([
        this.supabase.from('jobs_produce').select('*').eq('month_id', monthId),
        this.supabase.from('jobs_general').select('*').eq('month_id', monthId),
      ]);

      if (getProduceJobs.error) throw new Error(getProduceJobs.error.message);
      if (getGeneralJobs.error) throw new Error(getGeneralJobs.error.message);

      const produceList = await Promise.all(
        getProduceJobs.data.map(async (item) => {
          return this.fetchProduceById(item.produce_id);
        }),
      );

      return {
        produceJobs: getProduceJobs.data,
        generalJobs: getGeneralJobs.data,
        produceList: produceList,
      };
    } catch (error) {
      console.error(`Error fetching jobs: ${error}`);
      throw error;
    }
  }
}
