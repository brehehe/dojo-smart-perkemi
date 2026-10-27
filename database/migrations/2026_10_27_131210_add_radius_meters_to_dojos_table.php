<?php

declare(strict_types=1);

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
        Schema::table('dojos', function (Blueprint $table): void {
            $table->unsignedInteger('radius_meters')->default(150)->after('longitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dojos', function (Blueprint $table): void {
            $table->dropColumn('radius_meters');
        });
    }
};
