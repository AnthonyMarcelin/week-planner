<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = [
        'label',
        'day_of_week',
        'start_time',
        'end_time',
        'type',
        'user_id',
        'profile_id',
        'week_index',
        'group_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function profile()
    {
    return $this->belongsTo(Profile::class);
    }
}
