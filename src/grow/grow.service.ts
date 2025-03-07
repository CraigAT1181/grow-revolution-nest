import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class GrowService {
  // Access credentials centrally using ConfigService and pass into SupabaseClient
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async fetchAllProduce() {
    const { data, error } = await this.supabase
      .from('produce')
      .select('*, produce_months(month_id, action)');

    if (error) throw new Error(error.message);

    return data;
  }

  async fetchProduceById(produceId: string) {
    const { data, error } = await this.supabase
      .from('produce')
      .select('*, produce_months(month_id, action)')
      .eq('produce_id', produceId)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data;
  }

  async fetchMonths() {
    const { data, error } = await this.supabase.from('months').select('*');

    if (error) throw new Error(error.message);

    return data;
  }

  async fetchMonthData(monthId: string) {
    try {
      // Request jobs data from the jobs table
      const { data: jobsData, error: jobsError } = await this.supabase
        .from('jobs')
        .select('*')
        .eq('month_id', monthId);

      if (jobsError) throw new Error(jobsError.message);

      // Request sow data from the sow table
      const { data: initialSowData, error: sowError } = await this.supabase
        .from('sow')
        .select('*, sow_produce(produce_id, sow_type)')
        .eq('month_id', monthId);

      if (sowError) throw new Error(sowError.message);

      // Obtain a list of all produce objects sown in the given month
      const sowData = await Promise.all(
        initialSowData.map(async (item) => {
          const produceIds =
            item.sow_produce?.map((produce) => produce.produce_id) || [];

          // If there are no produce entries, return an empty array
          if (produceIds.length === 0) {
            console.warn('No produce_ids for sow entry:', item);
            return { sow_id: item.sow_id, produce: [] };
          }

          // Fetch the details for all produce_ids
          const produceDetails = await Promise.all(
            produceIds.map(
              async (produceId) => await this.fetchProduceById(produceId),
            ),
          );

          // Fetch companions for each item of produce and include companions inside the produce object
          await Promise.all(
            produceDetails.map(async (produce) => {
              const { data: groupData, error: groupError } = await this.supabase
                .from('companion_group')
                .select('group_id')
                .eq('group_name', produce.name)
                .select();

              if (groupError) throw new Error(groupError.message);
              console.log(groupData);

              // If no companion group entry is found for this produce, just return
              if (!groupData || groupData.length === 0) {
                console.warn(`No group found for produce: ${produce.name}`);
                return;
              }
              const groupId = groupData[0].group_id;

              // Fetch the companion group details from produce_companion_groups
              const { data: companionGroups, error: companionGroupsError } =
                await this.supabase
                  .from('produce_companion_groups')
                  .select('produce_id')
                  .eq('group_id', groupId)
                  .neq('produce_id', produce.produce_id);

              if (companionGroupsError)
                throw new Error(companionGroupsError.message);

              // If no companion entries are found, just return
              if (!companionGroups || companionGroups.length === 0) {
                produce.companions = [];
                return;
              }

              // Now fetch the full details of each companion produce item
              const companionProduceDetails = await Promise.all(
                companionGroups.map(async (companion) => {
                  const { data: produceDetails, error: produceDetailsError } =
                    await this.supabase
                      .from('produce')
                      .select('*')
                      .eq('produce_id', companion.produce_id);

                  if (produceDetailsError)
                    throw new Error(produceDetailsError.message);

                  return produceDetails[0];
                }),
              );

              // Assign companions to the current produce item
              produce.companions = companionProduceDetails;
            }),
          );

          // Return the sow item along with its produce details, which includes an array of companions
          return {
            ...item,
            produce: produceDetails,
          };
        }),
      );

      return {
        jobsData,
        sowData,
      };
    } catch (error) {
      console.error(`Error fetching month data: ${error}`);
      throw error;
    }
  }
}
