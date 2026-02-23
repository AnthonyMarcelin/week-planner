<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::table('activities', function (Blueprint $table) {
        // On ajoute profile_id (nullable d'abord pour ne pas casser les données existantes s'il y en a)
        $table->foreignId('profile_id')->nullable()->constrained()->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations
     */
public function down(): void
{
    Schema::table('activities', function (Blueprint $table) {
        $table->dropForeign(['profile_id']);
        $table->dropColumn('profile_id');
    });
}
};
