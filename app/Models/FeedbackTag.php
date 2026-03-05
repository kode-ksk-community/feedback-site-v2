<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedbackTag extends Model
{
    protected $fillable = [
        'feedback_id',
        'tag_id',
    ];
    public function feedback()
    {
        return $this->belongsTo(Feedback::class);
    }

    public function tag()
    {
        return $this->belongsTo(Tag::class);
    }
}
