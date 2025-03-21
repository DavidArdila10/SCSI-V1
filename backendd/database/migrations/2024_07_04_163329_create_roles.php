<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        
        $role1 = Role::create(['name' => 'admin']);
       $role2 = Role::create(['name' => 'writer']);
       $role3 = Role::create(['name' => 'reader']);

       Permission::create(['name' => 'user.module'])->assignRole($role1);

       Permission::create(['name' => 'admin.sow.index'])->syncRoles([$role1, $role2, $role3]);
       Permission::create(['name' => 'admin.sow.create'])->syncRoles([$role2,$role1]);  
       Permission::create(['name' => 'admin.sow.edit'])->syncRoles([$role2,$role1]);
       Permission::create(['name' => 'admin.sow.delete'])->syncRoles([$role2,$role1]);


       $user = User::find(1);
       $user->assignRole('admin');
    }   

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
       
    }
};