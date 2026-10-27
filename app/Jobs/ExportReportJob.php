<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Attendance;
use App\Models\CoachEvaluation;
use App\Models\Dojo;
use App\Models\IndependentTraining;
use App\Models\Kenshi;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ExportReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public array $backoff = [10, 30, 60];

    /**
     * Create a new job instance.
     *
     * @param  array<string, mixed>  $filters
     */
    public function __construct(
        public string $type,
        public string $format,
        public string $exportId,
        public ?string $userId = null,
        public array $filters = []
    ) {}

    /**
     * Execute the job to generate report asynchronously in the background.
     */
    public function handle(): void
    {
        Log::info("Starting background export for [{$this->type}] in format [{$this->format}], export ID: {$this->exportId}");

        $dir = 'exports';
        Storage::disk('local')->makeDirectory($dir);

        $timestamp = now()->format('Y-m-d_His');
        $ext = $this->format === 'excel' ? 'csv' : 'html';
        $filename = "laporan_{$this->type}_{$timestamp}_{$this->exportId}.{$ext}";
        $path = "{$dir}/{$filename}";

        $fullPath = Storage::disk('local')->path($path);
        $handle = fopen($fullPath, 'w');

        if (! $handle) {
            throw new \RuntimeException("Unable to open export path: {$fullPath}");
        }

        if ($this->format === 'excel') {
            fwrite($handle, "\xEF\xBB\xBF"); // UTF-8 BOM
            $this->generateExcelCsv($handle);
        } else {
            $this->generatePrintableHtml($handle);
        }

        fclose($handle);

        // Record completed export metadata in Cache for 24 hours
        Cache::put("export_job_{$this->exportId}", [
            'status' => 'completed',
            'type' => $this->type,
            'format' => $this->format,
            'filename' => $filename,
            'path' => $path,
            'created_at' => now()->toIso8601String(),
            'user_id' => $this->userId,
        ], now()->addHours(24));

        Log::info("Background export completed: {$filename}");
    }

    /**
     * Generate CSV content for Excel.
     *
     * @param  resource  $handle
     */
    private function generateExcelCsv($handle): void
    {
        $user = $this->userId ? User::find($this->userId) : null;
        $isKenshiOnly = $user && $user->hasRole('Kenshi') && ! $user->hasAnyRole(['SuperAdmin', 'PengprovAdmin', 'PengkabAdmin', 'Sensei']);
        $selfKenshi = $isKenshiOnly ? $user->kenshi : null;

        if ($this->type === 'dojo') {
            fputcsv($handle, ['No', 'Kode Dojo', 'Nama Dojo', 'Pengprov', 'Pengkab', 'Kota', 'Latitude', 'Longitude', 'Sensei Kepala', 'Telepon', 'Email', 'Status', 'Total Kenshi']);
            $query = Dojo::with('headSensei')->withCount('kenshis');
            if ($selfKenshi && $selfKenshi->dojo_id) {
                $query->where('id', $selfKenshi->dojo_id);
            }
            $dojos = $query->latest()->get();
            foreach ($dojos as $idx => $d) {
                fputcsv($handle, [
                    $idx + 1,
                    $d->code,
                    $d->name,
                    $d->pengprov,
                    $d->pengkab,
                    $d->city ?? '-',
                    $d->latitude ?? '-',
                    $d->longitude ?? '-',
                    $d->headSensei?->name ?? '-',
                    $d->contact_phone ?? '-',
                    $d->contact_email ?? '-',
                    $d->status->label(),
                    $d->kenshis_count ?? 0,
                ]);
            }
        } elseif ($this->type === 'attendance') {
            fputcsv($handle, ['No', 'Tanggal', 'Sesi Latihan', 'Dojo', 'NIK Kenshi', 'Nama Kenshi', 'Tingkatan', 'Status Kehadiran', 'Waktu Presensi', 'Jarak (Meter)', 'Terverifikasi GPS']);
            $query = Attendance::with(['kenshi', 'schedule.dojo']);
            if ($selfKenshi) {
                $query->where('kenshi_id', $selfKenshi->id);
            }
            $attendances = $query->latest()->limit(500)->get();
            foreach ($attendances as $idx => $a) {
                fputcsv($handle, [
                    $idx + 1,
                    $a->schedule?->date?->format('Y-m-d') ?? '-',
                    $a->schedule?->title ?? '-',
                    $a->schedule?->dojo?->name ?? '-',
                    $a->kenshi?->id_card_number ?? '-',
                    $a->kenshi?->full_name ?? '-',
                    $a->kenshi?->rank?->label() ?? '-',
                    $a->status->label(),
                    $a->check_in_at?->format('H:i') ?? '-',
                    $a->distance_meters ? "{$a->distance_meters}m" : '-',
                    $a->is_within_radius ? 'Valid Tatami' : 'Di Luar Geofence',
                ]);
            }
        } elseif ($this->type === 'evaluation') {
            fputcsv($handle, ['No', 'Tanggal Penilaian', 'NIK Kenshi', 'Nama Kenshi', 'Dojo Asal', 'Sensei Penilai', 'Teknik (Goho & Juho)', 'Embu (Koreografi)', 'Randori (Respon Tarung)', 'Fisik & Daya Tahan', 'Disiplin & Etika Reigi', 'Nilai Rata-Rata', 'Predikat', 'Rekomendasi UKT', 'Catatan Evaluasi']);
            $query = CoachEvaluation::with(['kenshi.dojo', 'coach']);
            if ($selfKenshi) {
                $query->where('kenshi_id', $selfKenshi->id);
            }
            $evaluations = $query->latest('evaluation_date')->get();
            foreach ($evaluations as $idx => $ev) {
                fputcsv($handle, [
                    $idx + 1,
                    $ev->evaluation_date?->format('Y-m-d') ?? (is_string($ev->evaluation_date) ? $ev->evaluation_date : '-'),
                    $ev->kenshi?->id_card_number ?? '-',
                    $ev->kenshi?->full_name ?? '-',
                    $ev->kenshi?->dojo?->name ?? '-',
                    $ev->coach?->name ?? 'Sensei',
                    $ev->technique_score,
                    $ev->embu_score,
                    $ev->randori_score,
                    $ev->physical_score,
                    $ev->discipline_score,
                    $ev->overall_score,
                    $ev->grade,
                    $ev->recommendation ?? '-',
                    $ev->notes ?? '-',
                ]);
            }
        } elseif ($this->type === 'independent') {
            fputcsv($handle, ['No', 'Tanggal Latihan', 'NIK Kenshi', 'Nama Kenshi', 'Dojo Asal', 'Tipe Drill Waza', 'Judul Sesi Mandiri', 'Durasi (Menit)', 'Intensitas', 'Repetisi / Siklus', 'Estimasi Kalori (Kkal)', 'Status Verifikasi', 'Catatan Logbook']);
            $query = IndependentTraining::with(['kenshi.dojo', 'verifier']);
            if ($selfKenshi) {
                $query->where('kenshi_id', $selfKenshi->id);
            }
            $trainings = $query->latest('training_date')->get();
            foreach ($trainings as $idx => $tr) {
                fputcsv($handle, [
                    $idx + 1,
                    $tr->training_date?->format('Y-m-d') ?? (is_string($tr->training_date) ? $tr->training_date : '-'),
                    $tr->kenshi?->id_card_number ?? '-',
                    $tr->kenshi?->full_name ?? '-',
                    $tr->kenshi?->dojo?->name ?? '-',
                    strtoupper((string) $tr->drill_type),
                    $tr->title,
                    $tr->duration_minutes,
                    strtoupper((string) $tr->intensity),
                    $tr->reps_or_cycles ?? '-',
                    $tr->estimated_calories ?? '-',
                    $tr->status,
                    $tr->notes ?? '-',
                ]);
            }
        } elseif ($this->type === 'promotion') {
            fputcsv($handle, ['No', 'NIK Kenshi', 'Nama Lengkap', 'Dojo Asal', 'Tingkatan Saat Ini', 'Target Tingkat Berikutnya', 'Total Presensi Tatami', 'Nilai Evaluasi Pelatih', 'Rekomendasi Pelatih', 'Status Kualifikasi UKT']);
            $query = Kenshi::with(['dojo', 'coachEvaluations' => fn ($q) => $q->latest('evaluation_date')->limit(1)])
                ->withCount('attendances')
                ->where('is_active', true);
            if ($selfKenshi) {
                $query->where('id', $selfKenshi->id);
            }
            $candidates = $query->get();
            foreach ($candidates as $idx => $k) {
                $latestEv = $k->coachEvaluations->first();
                $next = $k->rank?->nextRank();
                $isReady = $k->attendances_count >= 16 && ($latestEv?->overall_score ?? 0) >= 70;
                fputcsv($handle, [
                    $idx + 1,
                    $k->id_card_number,
                    $k->full_name,
                    $k->dojo?->name ?? '-',
                    $k->rank->label(),
                    $next ? $next->label() : 'Tingkat Tertinggi',
                    "{$k->attendances_count} Sesi",
                    $latestEv ? "{$latestEv->overall_score} ({$latestEv->grade})" : 'Belum Dievaluasi',
                    $latestEv?->recommendation ?? '-',
                    $isReady ? 'SIAP UJIAN KENAIKAN TINGKAT (UKT)' : 'Dalam Pemantauan Waza',
                ]);
            }
        } else { // kenshi
            fputcsv($handle, ['No', 'Nomor Induk (NIK)', 'Nama Lengkap', 'Kategori', 'Gender', 'Tingkatan', 'Dojo Cabang', 'Pengprov', 'Telepon', 'Alamat', 'Bergabung', 'Status']);
            $query = Kenshi::with('dojo');
            if ($selfKenshi) {
                $query->where('id', $selfKenshi->id);
            }
            $kenshis = $query->latest()->get();
            foreach ($kenshis as $idx => $k) {
                fputcsv($handle, [
                    $idx + 1,
                    $k->id_card_number,
                    $k->full_name,
                    $k->member_type === 'coach' ? 'Pelatih' : 'Atlet / Kenshi',
                    $k->gender === 'M' ? 'Putra' : 'Putri',
                    $k->rank->label(),
                    $k->dojo?->name ?? '-',
                    $k->dojo?->pengprov ?? '-',
                    $k->phone ?? '-',
                    $k->address ?? '-',
                    $k->joined_at?->format('Y-m-d') ?? '-',
                    $k->is_active ? 'Aktif' : 'Non-Aktif',
                ]);
            }
        }
    }

    /**
     * Generate printable HTML report ready for browser print / PDF export.
     *
     * @param  resource  $handle
     */
    private function generatePrintableHtml($handle): void
    {
        $title = match ($this->type) {
            'dojo' => 'LAPORAN REKAPITULASI CABANG DOJO NASIONAL',
            'attendance' => 'LAPORAN REKAPITULASI PRESENSI TATAMI & GPS',
            'evaluation' => 'LAPORAN RAPOR EVALUASI 5 ASPEK PELATIH (SPORT SCIENCE)',
            'independent' => 'LAPORAN REKAPITULASI LOGBOOK LATIHAN MANDIRI ATLET',
            'promotion' => 'LAPORAN KUALIFIKASI UJIAN KENAIKAN TINGKAT (UKT)',
            default => 'LAPORAN REKAPITULASI PANGKALAN KENSHI & PELATIH',
        };

        $html = '<!DOCTYPE html><html><head><meta charset="utf-8">';
        $html .= '<title>'.htmlspecialchars($title).' - Perkemi</title>';
        $html .= '<style>
            body { font-family: "Segoe UI", Arial, sans-serif; font-size: 12px; margin: 30px; color: #1e293b; }
            .header { text-align: center; border-bottom: 3px double #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { font-size: 18px; margin: 0; color: #0b132b; text-transform: uppercase; letter-spacing: 1px; }
            .header h2 { font-size: 14px; margin: 5px 0 0; color: #dc2626; }
            .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #0b132b; color: #ffffff; font-weight: 600; text-align: left; padding: 8px 10px; font-size: 11px; }
            td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: right; }
            .badge-ready { background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            @media print { .no-print { display: none; } body { margin: 15mm; } }
        </style></head><body>';

        $html .= '<div class="header">';
        $html .= '<h2>PERSAUDARAAN BELADIRI SHORINJI KEMPO INDONESIA (PB PERKEMI)</h2>';
        $html .= '<h1>'.htmlspecialchars($title).'</h1>';
        $html .= '<div class="meta">Digenerate pada: '.now()->translatedFormat('l, d F Y H:i:s').' WIB • Sistem e-Dojo Perkemi</div>';
        $html .= '</div>';

        $html .= '<div class="no-print" style="margin-bottom: 15px; text-align: right;">';
        $html .= '<button onclick="window.print()" style="padding: 6px 14px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Cetak / Unduh PDF</button>';
        $html .= '</div>';

        fwrite($handle, $html);

        $user = $this->userId ? User::find($this->userId) : null;
        $isKenshiOnly = $user && $user->hasRole('Kenshi') && ! $user->hasAnyRole(['SuperAdmin', 'PengprovAdmin', 'PengkabAdmin', 'Sensei']);
        $selfKenshi = $isKenshiOnly ? $user->kenshi : null;

        if ($this->type === 'dojo') {
            fwrite($handle, '<table><thead><tr><th>No</th><th>Kode</th><th>Nama Dojo</th><th>Pengprov / Pengkab</th><th>Sensei Kepala</th><th>Kontak</th><th>Status</th></tr></thead><tbody>');
            $query = Dojo::with('headSensei');
            if ($selfKenshi && $selfKenshi->dojo_id) {
                $query->where('id', $selfKenshi->dojo_id);
            }
            $dojos = $query->latest()->get();
            foreach ($dojos as $idx => $d) {
                $row = '<tr>';
                $row .= '<td>'.($idx + 1).'</td>';
                $row .= '<td><strong>'.htmlspecialchars($d->code).'</strong></td>';
                $row .= '<td>'.htmlspecialchars($d->name).'</td>';
                $row .= '<td>'.htmlspecialchars("{$d->pengprov} - {$d->pengkab}").'</td>';
                $row .= '<td>'.htmlspecialchars($d->headSensei?->name ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($d->contact_phone ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($d->status->label()).'</td>';
                $row .= '</tr>';
                fwrite($handle, $row);
            }
            fwrite($handle, '</tbody></table>');
        } elseif ($this->type === 'attendance') {
            fwrite($handle, '<table><thead><tr><th>No</th><th>Tanggal</th><th>Sesi Latihan</th><th>Dojo</th><th>Nama Kenshi</th><th>Tingkatan</th><th>Status</th><th>Geotag</th></tr></thead><tbody>');
            $query = Attendance::with(['kenshi', 'schedule.dojo']);
            if ($selfKenshi) {
                $query->where('kenshi_id', $selfKenshi->id);
            }
            $attendances = $query->latest()->limit(300)->get();
            foreach ($attendances as $idx => $a) {
                $row = '<tr>';
                $row .= '<td>'.($idx + 1).'</td>';
                $row .= '<td>'.htmlspecialchars($a->schedule?->date?->format('d/m/Y') ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($a->schedule?->title ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($a->schedule?->dojo?->name ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($a->kenshi?->full_name ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($a->kenshi?->rank?->label() ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($a->status->label()).'</td>';
                $row .= '<td>'.htmlspecialchars($a->is_within_radius ? 'Valid Tatami' : 'Diluar Radius').'</td>';
                $row .= '</tr>';
                fwrite($handle, $row);
            }
            fwrite($handle, '</tbody></table>');
        } elseif ($this->type === 'evaluation') {
            fwrite($handle, '<table><thead><tr><th>No</th><th>Tanggal</th><th>Nama Kenshi</th><th>Dojo</th><th>Sensei</th><th>Teknik</th><th>Embu</th><th>Randori</th><th>Fisik</th><th>Disiplin</th><th>Skor</th><th>Predikat</th><th>Rekomendasi</th></tr></thead><tbody>');
            $query = CoachEvaluation::with(['kenshi.dojo', 'coach']);
            if ($selfKenshi) {
                $query->where('kenshi_id', $selfKenshi->id);
            }
            $evaluations = $query->latest('evaluation_date')->limit(300)->get();
            foreach ($evaluations as $idx => $ev) {
                $dateStr = $ev->evaluation_date?->format('d/m/Y') ?? (is_string($ev->evaluation_date) ? $ev->evaluation_date : '-');
                $row = '<tr>';
                $row .= '<td>'.($idx + 1).'</td>';
                $row .= '<td>'.htmlspecialchars($dateStr).'</td>';
                $row .= '<td><strong>'.htmlspecialchars($ev->kenshi?->full_name ?? '-').'</strong></td>';
                $row .= '<td>'.htmlspecialchars($ev->kenshi?->dojo?->name ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($ev->coach?->name ?? 'Sensei').'</td>';
                $row .= '<td>'.$ev->technique_score.'</td>';
                $row .= '<td>'.$ev->embu_score.'</td>';
                $row .= '<td>'.$ev->randori_score.'</td>';
                $row .= '<td>'.$ev->physical_score.'</td>';
                $row .= '<td>'.$ev->discipline_score.'</td>';
                $row .= '<td><strong>'.$ev->overall_score.'</strong></td>';
                $row .= '<td>'.htmlspecialchars($ev->grade).'</td>';
                $row .= '<td>'.htmlspecialchars($ev->recommendation ?? '-').'</td>';
                $row .= '</tr>';
                fwrite($handle, $row);
            }
            fwrite($handle, '</tbody></table>');
        } elseif ($this->type === 'independent') {
            fwrite($handle, '<table><thead><tr><th>No</th><th>Tanggal</th><th>Nama Kenshi</th><th>Dojo</th><th>Tipe Drill</th><th>Judul Sesi</th><th>Durasi</th><th>Intensitas</th><th>Kalori</th></tr></thead><tbody>');
            $query = IndependentTraining::with(['kenshi.dojo', 'verifier']);
            if ($selfKenshi) {
                $query->where('kenshi_id', $selfKenshi->id);
            }
            $trainings = $query->latest('training_date')->limit(300)->get();
            foreach ($trainings as $idx => $tr) {
                $dateStr = $tr->training_date?->format('d/m/Y') ?? (is_string($tr->training_date) ? $tr->training_date : '-');
                $row = '<tr>';
                $row .= '<td>'.($idx + 1).'</td>';
                $row .= '<td>'.htmlspecialchars($dateStr).'</td>';
                $row .= '<td><strong>'.htmlspecialchars($tr->kenshi?->full_name ?? '-').'</strong></td>';
                $row .= '<td>'.htmlspecialchars($tr->kenshi?->dojo?->name ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars(strtoupper((string) $tr->drill_type)).'</td>';
                $row .= '<td>'.htmlspecialchars($tr->title).'</td>';
                $row .= '<td>'.$tr->duration_minutes.' Menit</td>';
                $row .= '<td>'.htmlspecialchars(strtoupper((string) $tr->intensity)).'</td>';
                $row .= '<td>'.($tr->estimated_calories ? $tr->estimated_calories.' Kkal' : '-').'</td>';
                $row .= '</tr>';
                fwrite($handle, $row);
            }
            fwrite($handle, '</tbody></table>');
        } elseif ($this->type === 'promotion') {
            fwrite($handle, '<table><thead><tr><th>No</th><th>NIK</th><th>Nama Lengkap</th><th>Dojo</th><th>Tingkatan Saat Ini</th><th>Target Tingkat</th><th>Total Presensi</th><th>Nilai Waza</th><th>Status UKT</th></tr></thead><tbody>');
            $query = Kenshi::with(['dojo', 'coachEvaluations' => fn ($q) => $q->latest('evaluation_date')->limit(1)])
                ->withCount('attendances')
                ->where('is_active', true);
            if ($selfKenshi) {
                $query->where('id', $selfKenshi->id);
            }
            $candidates = $query->get();
            foreach ($candidates as $idx => $k) {
                $latestEv = $k->coachEvaluations->first();
                $next = $k->rank?->nextRank();
                $isReady = $k->attendances_count >= 16 && ($latestEv?->overall_score ?? 0) >= 70;
                $row = '<tr>';
                $row .= '<td>'.($idx + 1).'</td>';
                $row .= '<td><strong>'.htmlspecialchars($k->id_card_number).'</strong></td>';
                $row .= '<td>'.htmlspecialchars($k->full_name).'</td>';
                $row .= '<td>'.htmlspecialchars($k->dojo?->name ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($k->rank->label()).'</td>';
                $row .= '<td>'.htmlspecialchars($next ? $next->label() : 'Tingkat Tertinggi').'</td>';
                $row .= '<td>'.$k->attendances_count.' Sesi</td>';
                $row .= '<td>'.($latestEv ? $latestEv->overall_score.' ('.$latestEv->grade.')' : '-').'</td>';
                $row .= '<td>'.($isReady ? '<span class="badge-ready">SIAP UKT</span>' : '<span style="color:#64748b;">Masa Pemantauan</span>').'</td>';
                $row .= '</tr>';
                fwrite($handle, $row);
            }
            fwrite($handle, '</tbody></table>');
        } else {
            fwrite($handle, '<table><thead><tr><th>No</th><th>Nomor Induk</th><th>Nama Lengkap</th><th>Kategori</th><th>Tingkatan</th><th>Dojo Asal</th><th>Status</th></tr></thead><tbody>');
            $query = Kenshi::with('dojo');
            if ($selfKenshi) {
                $query->where('id', $selfKenshi->id);
            }
            $kenshis = $query->latest()->get();
            foreach ($kenshis as $idx => $k) {
                $row = '<tr>';
                $row .= '<td>'.($idx + 1).'</td>';
                $row .= '<td><strong>'.htmlspecialchars($k->id_card_number).'</strong></td>';
                $row .= '<td>'.htmlspecialchars($k->full_name).'</td>';
                $row .= '<td>'.htmlspecialchars($k->member_type === 'coach' ? 'Pelatih' : 'Atlet').'</td>';
                $row .= '<td>'.htmlspecialchars($k->rank->label()).'</td>';
                $row .= '<td>'.htmlspecialchars($k->dojo?->name ?? '-').'</td>';
                $row .= '<td>'.htmlspecialchars($k->is_active ? 'Aktif' : 'Non-Aktif').'</td>';
                $row .= '</tr>';
                fwrite($handle, $row);
            }
            fwrite($handle, '</tbody></table>');
        }

        $footer = '<div class="footer"><p>PB PERKEMI PUSAT • Sistem e-Dojo Nasional • Dokumen Resmi Terverifikasi</p></div></body></html>';
        fwrite($handle, $footer);
    }

    /**
     * Handle job failure.
     */
    public function failed(?Throwable $exception): void
    {
        Log::error("ExportReportJob failed: {$exception?->getMessage()}", [
            'type' => $this->type,
            'format' => $this->format,
            'export_id' => $this->exportId,
        ]);

        Cache::put("export_job_{$this->exportId}", [
            'status' => 'failed',
            'error' => $exception?->getMessage(),
        ], now()->addHours(2));
    }
}
