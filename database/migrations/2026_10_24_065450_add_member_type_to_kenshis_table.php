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
            $table->string('member_type', 30)->default('athlete')->index()->after('rank');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kenshis', function (Blueprint $table): void {
            $table->dropColumn('member_type');
        });
    }
};
