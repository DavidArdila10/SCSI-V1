<?php

use App\Http\Controllers\Api\Admin\RolController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\SowController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\Admin\CronometroController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\GoogleSheetsSyncController;
use App\Http\Controllers\Api\Admin\ImportController;

Route::prefix('v1')->group(function () {
    // AUTH ROUTES
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login');
    Route::post('/password/reset-request', [PasswordResetController::class, 'requestReset']);

    Route::get('/sheets/read', [GoogleSheetsSyncController::class, 'read']);
    Route::post('/sheets/write', [GoogleSheetsSyncController::class, 'write']);
    Route::post('/sync-sows', [GoogleSheetsSyncController::class, 'sync']);

    // PRIVATE ROUTES
    Route::group(['middleware' => 'auth:sanctum'], function () {
        // LOGOUT ROUTE
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        
        // ADMIN ROUTES
        Route::group(['middleware' => ['auth:sanctum', 'role:admin|writer']], function () {
            // USER ROUTES
            Route::get('/admin/totalUsers', [UserController::class, 'countTotalUsers']);
            Route::get('/admin/totalSows', [SowController::class, 'countTotalSows']);
            Route::get('/admin/userCount', [UserController::class, 'countUsersByRole']);
            Route::get('/admin/sowStatus', [SowController::class, 'countState']);
            Route::get('/admin/user/{id}', [UserController::class, 'getUserById']);
            Route::apiResource('/admin/user', UserController::class);
            Route::get('/admin/user-roles', [UserController::class, 'getAllUsersWithRoles']);
            Route::post('/admin/user/create', [UserController::class, 'store']);
            Route::get('/api/v1/admin/sows/{sow_id}/creator', [SowController::class, 'getCreator']);
            Route::get('admin/sow-all', [SowController::class, 'getAll']);
            Route::post('/admin/import/sows', [ImportController::class, 'importSows'])->middleware(['auth:sanctum']);

            // PASSWORD RESET ROUTES
            Route::get('/admin/reset-requests', [PasswordResetController::class, 'getResetRequests']);
            Route::post('/admin/reset-requests/approve/{id}', [PasswordResetController::class, 'approveRequest']);
            Route::post('/admin/reset-requests/cancel', [PasswordResetController::class, 'cancelRequest']);
        });

        // NUEVO GRUPO que permite admin|writer|reader para las rutas /admin/sow
        Route::group(['middleware' => ['auth:sanctum', 'role:admin|writer|reader']], function () {
            // SOW ROUTES (con admin|writer|reader)
            Route::get('/admin/sows/{ticket_sow}/creator', [SowController::class, 'getCreatorInfo']);
            Route::apiResource('/admin/sow', SowController::class);
            Route::post('/admin/sows/create', [SowController::class, 'create']);

            // SEARCH ROUTE FOR SOWS
            Route::get('/search/sows', [SowController::class, 'search'])->name('sows.search');
            Route::get('/admin/sow/search', [SowController::class, 'search']);

            // ROLES ROUTE
            Route::get('/admin/roles', [RolController::class, 'index']);
        });

        // **NUEVO GRUPO EXCLUSIVO PARA PM**
Route::group(['middleware' => ['auth:sanctum', 'role:admin|pm']], function () {
    // Rutas de cronómetros para admin y pm
    Route::get('/admin/cronometros', [CronometroController::class, 'index']);
    Route::get('/admin/cronometros/{id}', [CronometroController::class, 'show']);
    Route::post('/admin/cronometros', [CronometroController::class, 'store']);
    Route::put('/admin/cronometros/{id}', [CronometroController::class, 'update']);
    Route::delete('/admin/cronometros/{id}', [CronometroController::class, 'destroy']);
    Route::put('/admin/cronometros/{id}/elapsed-time', [CronometroController::class, 'updateElapsedTime']);
    Route::put('/pm/cronometros/{id}/elapsed-time', [CronometroController::class, 'updateElapsedTime']); 


    
    Route::get('/pm/cronometros', [CronometroController::class, 'index']);
    Route::get('/pm/cronometros/{id}', [CronometroController::class, 'show']);
    Route::post('/pm/cronometros', [CronometroController::class, 'store']);
    Route::put('/pm/cronometros/{id}', [CronometroController::class, 'update']);
    Route::delete('/pm/cronometros/{id}', [CronometroController::class, 'destroy']); 
});


        // WRITER ROUTES
        Route::group(['middleware' => 'role:writer'], function () {
            Route::get('/writer/sow', [SowController::class, 'index']);  
            Route::get('/writer/sow/{id}', [SowController::class, 'show']);
            Route::post('/writer/sows/create', [SowController::class, 'create']);
            Route::put('/writer/sow/{id}', [SowController::class, 'update']);
            
            // SEARCH ROUTE FOR SOWS (Writer role)
            Route::get('/search/sows', [SowController::class, 'search'])->name('sows.search');
        });

        // READER ROUTES
        Route::group(['middleware' => 'role:reader'], function () {
            Route::get('/reader/sows', [SowController::class, 'index']);
            Route::get('/reader/sow/{id}', [SowController::class, 'show']);
            
            // SEARCH ROUTE FOR SOWS (Reader role)
            Route::get('/search/sows', [SowController::class, 'search'])->name('sows.search');
        });

        // ENUM OPTIONS ROUTE
        Route::get('/enums/{field}', [SowController::class, 'getEnumOptions']);

        // EXPORT ROUTES
        Route::get('/export/xlsx', [ExportController::class, 'exportXlsx']);
        Route::get('/export/csv', [ExportController::class, 'exportCsv']);
    });
});

// USER ROUTE (SANCTUM AUTH)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
