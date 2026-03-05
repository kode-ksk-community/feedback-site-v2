<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    protected $fillable = [
        'app_name',
        'logo',
        'primary_color',
        'shift_morning_start',
        'shift_morning_end',
        'shift_afternoon_start',
        'shift_afternoon_end',
    ];
}
