<?php

declare(strict_types=1);

namespace App\Actions\Material;

use App\Models\Dojo;
use App\Models\Material;
use App\Models\Pengurus;
use App\Models\User;
use App\Services\DokuhonPageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class StoreMaterialAction
{
    /**
     * Store material with multi-level organizational scoping and dual-media support.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(array $data, ?User $uploader = null): Material
    {
        $isSuperAdmin = $uploader && $uploader->hasRole('SuperAdmin');
        $isPengprovAdmin = $uploader && $uploader->hasRole('PengprovAdmin');
        $isPengkabAdmin = $uploader && $uploader->hasRole('PengkabAdmin');
        $isSensei = $uploader && $uploader->hasRole('Sensei');

        // Determine scope and organizational IDs
        $requestedScope = $data['scope_type'] ?? 'dojo';
        $scopeType = 'dojo';
        $isOfficialPb = false;
        $pengprovId = null;
        $pengkotId = null;
        $dojoId = null;

        if ($isSuperAdmin) {
            $scopeType = in_array($requestedScope, ['national', 'pengprov', 'pengkot', 'dojo'], true)
                ? $requestedScope
                : 'national';

            $isOfficialPb = ($scopeType === 'national');
            $pengprovId = $data['pengprov_id'] ?? null;
            $pengkotId = $data['pengkot_id'] ?? null;
            $dojoId = $data['dojo_id'] ?? null;
        } elseif ($isPengprovAdmin) {
            $scopeType = 'pengprov';
            $pengprov = Pengurus::where('type', 'pengprov')
                ->where('user_id', $uploader?->id)
                ->first()
                ?? ($data['pengprov_id'] ? Pengurus::find($data['pengprov_id']) : Pengurus::pengprov()->first());

            $pengprovId = $pengprov?->id;
        } elseif ($isPengkabAdmin) {
            $scopeType = 'pengkot';
            $pengkot = Pengurus::where('type', 'pengkot')
                ->where('user_id', $uploader?->id)
                ->first()
                ?? ($data['pengkot_id'] ? Pengurus::find($data['pengkot_id']) : Pengurus::pengkot()->first());

            $pengkotId = $pengkot?->id;
        } else {
            // Sensei or Default Dojo scope
            $scopeType = 'dojo';
            $dojo = $uploader ? Dojo::where('head_sensei_id', $uploader->id)->first() : null;
            if (! $dojo && ! empty($data['dojo_id'])) {
                $dojo = Dojo::find($data['dojo_id']);
            }
            if (! $dojo) {
                $dojo = Dojo::first();
            }
            $dojoId = $dojo?->id;
        }

        // Handle uploaded video file or URL
        $videoUrl = $data['video_url'] ?? null;
        $filePath = null;

        if (isset($data['video_file']) && $data['video_file'] instanceof UploadedFile) {
            $path = $data['video_file']->store('materials/videos', 'public');
            $videoUrl = '/storage/'.$path;
            $filePath = $videoUrl;
        }

        // Handle uploaded PDF file or path
        $pdfPath = $data['pdf_path'] ?? null;
        $pdfPagesCount = $data['pdf_pages_count'] ?? 10;

        if (isset($data['pdf_file']) && $data['pdf_file'] instanceof UploadedFile) {
            $path = $data['pdf_file']->store('materials/pdfs', 'public');
            $pdfPath = '/storage/'.$path;
            if (! $filePath) {
                $filePath = $pdfPath;
            }
        }

        // Determine media type
        $hasVideo = ! empty($videoUrl);
        $hasPdf = ! empty($pdfPath);
        $mediaType = 'video';
        if ($hasVideo && $hasPdf) {
            $mediaType = 'both';
        } elseif ($hasPdf) {
            $mediaType = 'pdf';
        }

        // Prepare interactive Flipbook pages
        // Only generate default Dokuhon philosophy text pages if NO real PDF file is uploaded
        // and the pillar is 'dokuhon'
        $pagesData = $data['pages_data'] ?? null;
        if (empty($pagesData) && empty($pdfPath) && ($data['pillar'] ?? '') === 'dokuhon') {
            $pagesData = DokuhonPageService::getDefaultPages(
                $data['title'],
                $data['summary'] ?? null
            );
            $pdfPagesCount = count($pagesData);
        }

        $material = Material::create([
            'title' => $data['title'],
            'slug' => Str::slug($data['title']).'-'.Str::lower(Str::random(6)),
            'pillar' => $data['pillar'] ?? 'dokuhon',
            'target_rank' => $data['target_rank'] ?? 'minarai',
            'summary' => $data['summary'] ?? null,
            'video_url' => $videoUrl,
            'video_duration' => $data['video_duration'] ?? ($hasVideo ? '12:00' : null),
            'video_chapters' => $data['video_chapters'] ?? [],
            'pdf_path' => $pdfPath,
            'is_official_pb' => $isOfficialPb,
            'scope_type' => $scopeType,
            'pengprov_id' => $pengprovId,
            'pengkot_id' => $pengkotId,
            'dojo_id' => $dojoId,
            'media_type' => $mediaType,
            'file_path' => $filePath,
            'pdf_pages_count' => $pdfPagesCount,
            'pages_data' => $pagesData,
            'uploader_id' => $uploader?->id,
            'is_active' => true,
            'is_public' => $data['is_public'] ?? ($scopeType === 'national'),
            'order_priority' => $data['order_priority'] ?? 0,
        ]);

        activity('curriculum')
            ->performedOn($material)
            ->causedBy($uploader)
            ->withProperties([
                'scope' => $scopeType,
                'media_type' => $mediaType,
                'is_official_pb' => $isOfficialPb,
            ])
            ->log("Materi pembelajaran baru [{$material->title}] berhasil diunggah dengan lingkup [{$scopeType}].");

        return $material;
    }
}
