<?php

namespace App\Http\Controllers\Api;

use App\Models\Sow;
use App\Exports\SowsExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function exportXlsx()
    {
        return  Excel::download(new SowsExport(), 'sows.xlsx');
    }

    public function exportCsv()
    {
        return  Excel::download(new SowsExport(), 'sows.csv');
    }
}
