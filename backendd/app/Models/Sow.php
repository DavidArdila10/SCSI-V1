<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Sow extends Model
{
    use HasFactory;

    protected $primaryKey = 'ticket_sow';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'ticket_sow',
        'cls',
        'opportunity_name',
        'opportunity_id',
        'account_name',
        'delivery_team',
        'ticket_date',
        'sow_description',
        'priority',
        'sow_due_date',
        'effort_due_date',
        'project_id',
        'sow_owner',
        'sow_status',
        'sow_delivery_date',
        'effort_owner',
        'effort_status',
        'effort_delivery_date',
        'comments',
        'sow_link',
        'effort_link',
        'create_at'
    ];

    /**
     * Agregar indexación automática en consultas frecuentes
     */
    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('indexOptimization', function ($query) {
            
        });
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('sow_status', $status);
    }

    /**
     * Scope para filtrar por proyecto
     */
    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    /**
     * Scope para filtrar por cliente
     */
    public function scopeByClient($query, $clientName)
    {
        return $query->where('account_name', 'like', "%{$clientName}%");
    }

    /**
     * Relación con el usuario que creó el SOW
     */
    public function creator()
    {
        return $this->hasOne(SowByUser::class, 'sow_id', 'ticket_sow');
    }
}
