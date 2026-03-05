<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'color',
        'level',
        'description',
        'category',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function feedbacks()
    {
        return $this->belongsToMany(Feedback::class, 'feedback_tags');
    }
}
