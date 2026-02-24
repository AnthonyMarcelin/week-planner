<?php

namespace App\Console\Commands;

use App\Models\Activity;
use App\Models\Profile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateOrphanedActivities extends Command
{
    protected $signature = 'activities:migrate-orphaned {--dry-run : Show what would be migrated without actually doing it}';
    
    protected $description = 'Migrate orphaned activities to user profiles';

    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('🔍 DRY RUN MODE - No changes will be made');
        } else {
            $this->warn('⚠️  This will permanently migrate orphaned activities');
            if (!$this->confirm('Do you want to continue?')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        // Get all users with orphaned activities
        $usersWithOrphans = DB::table('activities')
            ->whereNull('profile_id')
            ->distinct()
            ->pluck('user_id');

        if ($usersWithOrphans->isEmpty()) {
            $this->info('✅ No orphaned activities found.');
            return 0;
        }

        $totalMigrated = 0;

        foreach ($usersWithOrphans as $userId) {
            $userProfiles = Profile::where('user_id', $userId)->get();
            
            if ($userProfiles->isEmpty()) {
                $this->warn("User {$userId} has no profiles - skipping");
                continue;
            }

            $defaultProfile = $userProfiles->first();
            $orphanedCount = Activity::where('user_id', $userId)
                ->whereNull('profile_id')
                ->count();

            if ($dryRun) {
                $this->line("User {$userId}: {$orphanedCount} activities would be migrated to profile '{$defaultProfile->name}'");
                $totalMigrated += $orphanedCount;
                continue;
            }

            // Perform the migration
            $migrated = Activity::where('user_id', $userId)
                ->whereNull('profile_id')
                ->update(['profile_id' => $defaultProfile->id]);

            $this->info("✅ User {$userId}: {$migrated} activities migrated to profile '{$defaultProfile->name}'");
            $totalMigrated += $migrated;
        }

        if ($dryRun) {
            $this->info("📊 Total activities that would be migrated: {$totalMigrated}");
        } else {
            $this->info("🎉 Migration completed! {$totalMigrated} activities migrated successfully.");
        }

        return 0;
    }
}
