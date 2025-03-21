<?php

namespace App\Exports;

use App\Models\Sow;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class SowsExport implements FromQuery, WithHeadings
{
    use Exportable;

    public function query()
    {
        return Sow::query();
    }

    public function headings(): array
    {
        return collect(Sow::first())->keys()->toArray();
    }
  
}
