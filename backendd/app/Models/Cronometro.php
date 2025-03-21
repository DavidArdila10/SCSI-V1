<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cronometro extends Model
{
    use HasFactory;

    protected $table = 'cronometros'; // Nombre de la tabla

    protected $fillable = [
        'PM',
        'description',
        'EAC',
        'ETC',
        'STATUS',
        'TE',
        'TPC',
        'TPI',
        'date',
        'start_date',
        'accumulated_hours',
        'accumulated_days',
        'is_active',
        'is_running_te',
        'is_running_tpc',
        'is_running_tpi',
        'elapsed_te',
        'elapsed_tpc',
        'elapsed_tpi',
        'last_updated_te',
        'last_updated_tpc',
        'last_updated_tpi',
        // Nueva columna
        'PM_assigned',
    ];

    protected $casts = [
        // Para que al serializar a JSON sean int
        'elapsed_te' => 'integer',
        'elapsed_tpc' => 'integer',
        'elapsed_tpi' => 'integer',
        'is_running_te' => 'boolean',
        'is_running_tpc' => 'boolean',
        'is_running_tpi' => 'boolean',

        // Convierte last_updated_xxx a instancias Carbon
        'last_updated_te' => 'datetime',
        'last_updated_tpc' => 'datetime',
        'last_updated_tpi' => 'datetime',

        // Cast opcional para la nueva columna (si lo deseas):
        // 'PM_assigned' => 'string',
    ];

    // Valores predeterminados si son necesarios
    protected $attributes = [
        'is_active' => 1,
        'accumulated_hours' => 0,
        'accumulated_days' => 0,
        'is_running_te' => false,
        'is_running_tpc' => false,
        'is_running_tpi' => false,
        // Ojo: elapsed_xxx por defecto 0
        'elapsed_te' => 0,
        'elapsed_tpc' => 0,
        'elapsed_tpi' => 0,

        // Puedes establecer un valor por defecto para la nueva columna
        // 'PM_assigned' => null,
    ];
}
