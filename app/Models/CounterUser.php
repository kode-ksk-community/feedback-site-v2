<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CounterUser extends Model
{
    protected $fillable = [
        'counter_id',
        'user_id',
        'start_time',
        'end_time',
        'is_active',
        'expires_at',
    ];
    public function counter()
    {
        return $this->belongsTo(Counter::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
