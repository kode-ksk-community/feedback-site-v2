<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model; 
use Illuminate\Support\Facades\Hash;

class Counter extends Model
{
    protected $fillable = [
        'branch_id',
        'name',
        'is_active',
        'fixed_qr_token',
        'pin',
        'device_uuid',
        'last_heartbeat_at',

    ];
    public function setPinAttribute($value)
    {
        $this->attributes['pin'] = Hash::make($value);
    }
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
