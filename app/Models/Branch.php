<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'name',
        'address',
    ];

    public function counters()
    {
        return $this->hasMany(Counter::class);
    }

}
