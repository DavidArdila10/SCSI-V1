<?php
// app/Providers/MiddlewareServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

class MiddlewareServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Registrar middleware de rutas
        Route::aliasMiddleware('role', RoleMiddleware::class);
        Route::aliasMiddleware('permission', PermissionMiddleware::class);
        Route::aliasMiddleware('role_or_permission', RoleOrPermissionMiddleware::class);
    }

    public function register()
    {
        //
    }
}