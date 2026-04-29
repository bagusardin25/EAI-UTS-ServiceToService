<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    // Menonaktifkan timestamps sesuai desain database
    public $timestamps = false; 

    protected $fillable = [
        'user_id',
        'label',
        'street',
        'city',
        'province',
        'postal_code',
        'is_primary',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
