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
        Schema::table('kenshis', function (Blueprint $table): void {
            $table->boolean('is_atlet_pengkot')->default(false)->index()->after('member_type');
            $table->boolean('is_atlet_pengprov')->default(false)->index()->after('is_atlet_pengkot');
            $table->string('pengkot', 100)->nullable()->index()->after('is_atlet_pengprov');
            $table->string('pengprov', 100)->nullable()->index()->after('pengkot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kenshis', function (Blueprint $table): void {
            $table->dropColumn(['is_atlet_pengkot', 'is_atlet_pengprov', 'pengkot', 'pengprov']);
        });
    }
};
