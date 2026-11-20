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
        Schema::table('materials', function (Blueprint $table): void {
            $table->string('scope_type', 20)->default('national')->after('is_official_pb')->index();
            $table->foreignUuid('pengprov_id')->nullable()->after('scope_type')->constrained('pengurus')->nullOnDelete();
            $table->foreignUuid('pengkot_id')->nullable()->after('pengprov_id')->constrained('pengurus')->nullOnDelete();
            $table->string('media_type', 20)->default('video')->after('pengkot_id')->index();
            $table->string('file_path', 500)->nullable()->after('media_type');
            $table->unsignedInteger('pdf_pages_count')->nullable()->after('file_path');
            $table->json('pages_data')->nullable()->after('pdf_pages_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('materials', function (Blueprint $table): void {
            $table->dropForeign(['pengprov_id']);
            $table->dropForeign(['pengkot_id']);
            $table->dropColumn([
                'scope_type',
                'pengprov_id',
                'pengkot_id',
                'media_type',
                'file_path',
                'pdf_pages_count',
                'pages_data',
            ]);
        });
    }
};
