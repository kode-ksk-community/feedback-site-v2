<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class Counter extends Model
{

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->uuid) {
                $model->uuid = Str::uuid();
            }
        });
    }

    protected $fillable = [
        'branch_id',
        'uuid',
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
