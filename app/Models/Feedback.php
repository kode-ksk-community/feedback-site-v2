<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'branch_id',
        'counter_id',
        'user_id',
        'servicer_id',
        'rating',
        'comment',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function counter()
    {
        return $this->belongsTo(Counter::class);
    }

    public function servicer()
    {
        return $this->belongsTo(User::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        // return $this->hasMany(FeedbackTag::class);
        return $this->belongsToMany(Tag::class, 'feedback_tags', 'feedback_id', 'tag_id');
    }
}
