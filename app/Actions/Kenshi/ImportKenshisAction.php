<?php

declare(strict_types=1);

namespace App\Actions\Kenshi;

use App\Enums\KenshiRank;
use App\Models\Dojo;
use App\Models\Kenshi;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ImportKenshisAction
{
    /**
     * Import multiple Kenshi/Pelatih records from a CSV/Excel file.
     * Provisions User login accounts with password defaulting to NIK (id_card_number).
     *
     * @return array{imported: int, skipped: int, errors: array<int, string>}
     */
    public function execute(UploadedFile $file): array
    {
        $handle = fopen($file->getRealPath(), 'r');
        if (! $handle) {
            return ['imported' => 0, 'skipped' => 0, 'errors' => ['Gagal membuka berkas unggahan.']];
        }

        // Read BOM if present
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        // Detect delimiter (comma or semicolon)
        $firstLine = fgets($handle);
        rewind($handle);
        if ($bom === "\xEF\xBB\xBF") {
            fread($handle, 3);
        }

        $delimiter = str_contains((string) $firstLine, ';') ? ';' : ',';

        $header = fgetcsv($handle, 2048, $delimiter);
        if (! $header) {
            fclose($handle);

            return ['imported' => 0, 'skipped' => 0, 'errors' => ['Berkas kosong atau format header tidak valid.']];
        }

        // Normalize header keys
        $normalizedHeader = array_map(function ($col) {
            return strtolower(trim((string) $col));
        }, $header);

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowNum = 1;

        $defaultDojo = Dojo::active()->first();

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle, 2048, $delimiter)) !== false) {
                $rowNum++;
                if (empty(array_filter($row))) {
                    continue; // Skip empty row
                }

                $data = [];
                foreach ($normalizedHeader as $idx => $key) {
                    $data[$key] = isset($row[$idx]) ? trim((string) $row[$idx]) : null;
                }

                $nik = $data['id_card_number'] ?? $data['nik'] ?? $data['nomor_induk'] ?? null;
                $name = $data['full_name'] ?? $data['nama_lengkap'] ?? $data['nama'] ?? null;

                if (empty($nik) || empty($name)) {
                    $skipped++;
                    $errors[] = "Baris {$rowNum}: NIK atau Nama Lengkap kosong.";

                    continue;
                }

                // Resolve Dojo
                $dojoCode = $data['dojo_code'] ?? $data['kode_dojo'] ?? null;
                $dojo = null;
                if (! empty($dojoCode)) {
                    $dojo = Dojo::where('code', $dojoCode)->first();
                }
                if (! $dojo) {
                    $dojo = $defaultDojo;
                }

                if (! $dojo) {
                    $skipped++;
                    $errors[] = "Baris {$rowNum}: Dojo tidak ditemukan.";

                    continue;
                }

                // Resolve Rank
                $rankInput = $data['rank'] ?? $data['tingkatan'] ?? 'minarai';
                $rankEnum = KenshiRank::tryFrom($rankInput);
                if (! $rankEnum) {
                    // Try case-insensitive matching
                    foreach (KenshiRank::cases() as $case) {
                        if (strcasecmp($case->value, $rankInput) === 0 || strcasecmp($case->label(), $rankInput) === 0) {
                            $rankEnum = $case;
                            break;
                        }
                    }
                }
                $rankEnum = $rankEnum ?? KenshiRank::Minarai;

                // Member Type (athlete vs coach)
                $memberTypeInput = strtolower($data['member_type'] ?? $data['tipe'] ?? '');
                $isCoach = in_array($memberTypeInput, ['coach', 'pelatih', 'sensei'], true) || $rankEnum->isDan();
                $memberType = $isCoach ? 'coach' : 'athlete';

                // Gender
                $genderInput = strtoupper($data['gender'] ?? $data['jenis_kelamin'] ?? 'M');
                $gender = in_array($genderInput, ['F', 'P', 'WANITA', 'PEREMPUAN'], true) ? 'F' : 'M';

                // Resolve Email
                $cleanNik = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', (string) $nik));
                $email = ! empty($data['email']) ? $data['email'] : "{$cleanNik}@kenshi.perkemi.id";

                // Provision User login account with password = NIK
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => $name,
                        'password' => Hash::make((string) $nik), // Password default NIK
                        'email_verified_at' => now(),
                    ]
                );

                if (method_exists($user, 'assignRole')) {
                    $user->syncRoles([$isCoach ? 'Sensei' : 'Kenshi']);
                }

                // Create or update Kenshi record
                Kenshi::updateOrCreate(
                    ['id_card_number' => $nik],
                    [
                        'user_id' => $user->id,
                        'dojo_id' => $dojo->id,
                        'full_name' => $name,
                        'nickname' => $data['nickname'] ?? $data['nama_panggilan'] ?? Str::words($name, 1, ''),
                        'gender' => $gender,
                        'rank' => $rankEnum,
                        'member_type' => $memberType,
                        'phone' => $data['phone'] ?? $data['telepon'] ?? null,
                        'place_of_birth' => $data['place_of_birth'] ?? $data['tempat_lahir'] ?? null,
                        'date_of_birth' => ! empty($data['date_of_birth']) ? $data['date_of_birth'] : null,
                        'address' => $data['address'] ?? $data['alamat'] ?? null,
                        'joined_at' => ! empty($data['joined_at']) ? $data['joined_at'] : now()->toDateString(),
                        'is_active' => true,
                    ]
                );

                $imported++;
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);

            return [
                'imported' => 0,
                'skipped' => $skipped,
                'errors' => ["Gagal memproses berkas: {$e->getMessage()}"],
            ];
        }

        fclose($handle);

        return [
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }
}
