<?php

namespace App\Providers;

use App\Models\Activity;
use App\Models\Profile;
use App\Policies\ActivityPolicy;
use App\Policies\ProfilePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Activity::class => ActivityPolicy::class,
        Profile::class => ProfilePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}