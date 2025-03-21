<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SowByUser extends Model
{
    protected $fillable = ['sow_id', 'created_by', 'created_at','user_name'];
    protected $table = 'create_sows_by_user'; 
    // Relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sow()
    {
        return $this->belongsTo(Sow::class, 'sow_id');
    }
}
