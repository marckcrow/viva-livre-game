import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting daily progress update...')

    // Get all users with progress tracking
    const { data: progressRecords, error: progressError } = await supabaseAdmin
      .from('progress_tracking')
      .select('id, user_id, days_clean, start_date, last_check_in')

    if (progressError) {
      console.error('Error fetching progress records:', progressError)
      throw progressError
    }

    console.log(`Found ${progressRecords?.length || 0} progress records to update`)

    // Get yesterday's date to check for consumption
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    for (const progress of progressRecords || []) {
      console.log(`Processing user ${progress.user_id}`)

      // Check if user had any consumption yesterday
      const { data: consumptions, error: consumptionError } = await supabaseAdmin
        .from('consumption_log')
        .select('id')
        .eq('user_id', progress.user_id)
        .eq('consumption_date', yesterdayStr)
        .limit(1)

      if (consumptionError) {
        console.error(`Error checking consumption for user ${progress.user_id}:`, consumptionError)
        continue
      }

      let newDaysClean = progress.days_clean
      let newStartDate = progress.start_date

      if (consumptions && consumptions.length > 0) {
        // User had consumption yesterday - reset progress
        console.log(`User ${progress.user_id} had consumption yesterday, resetting progress`)
        newDaysClean = 0
        newStartDate = new Date().toISOString()
      } else {
        // No consumption - increment days clean
        newDaysClean += 1
        console.log(`User ${progress.user_id} stayed clean, incrementing to ${newDaysClean} days`)
      }

      // Update progress
      const { error: updateError } = await supabaseAdmin
        .from('progress_tracking')
        .update({
          days_clean: newDaysClean,
          start_date: newStartDate,
          last_check_in: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', progress.id)

      if (updateError) {
        console.error(`Error updating progress for user ${progress.user_id}:`, updateError)
        continue
      }

      // Check and unlock achievements
      const { data: achievements, error: achievementsError } = await supabaseAdmin
        .from('achievements')
        .select('id, days_required')
        .lte('days_required', newDaysClean)

      if (achievementsError) {
        console.error(`Error fetching achievements:`, achievementsError)
        continue
      }

      // Get already unlocked achievements
      const { data: unlockedAchievements, error: unlockedError } = await supabaseAdmin
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', progress.user_id)

      if (unlockedError) {
        console.error(`Error fetching unlocked achievements:`, unlockedError)
        continue
      }

      const unlockedIds = new Set(unlockedAchievements?.map(ua => ua.achievement_id) || [])

      // Unlock new achievements
      for (const achievement of achievements || []) {
        if (!unlockedIds.has(achievement.id)) {
          console.log(`Unlocking achievement ${achievement.id} for user ${progress.user_id}`)
          
          const { error: unlockError } = await supabaseAdmin
            .from('user_achievements')
            .insert({
              user_id: progress.user_id,
              achievement_id: achievement.id
            })

          if (unlockError) {
            console.error(`Error unlocking achievement:`, unlockError)
          }
        }
      }
    }

    console.log('Daily progress update completed successfully')

    return new Response(
      JSON.stringify({ success: true, message: 'Progress updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in update-progress function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
