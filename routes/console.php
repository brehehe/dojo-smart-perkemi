<?php

use App\Actions\Dues\GenerateMonthlyInvoicesAction;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('dues:generate {--period=} {--dojo=}', function (GenerateMonthlyInvoicesAction $action) {
    $period = $this->option('period') ?: now()->format('Y-m');
    $dojoId = $this->option('dojo');

    $this->info("Menerbitkan tagihan iuran kenshi periode {$period}...");
    $invoices = $action->execute($period, $dojoId);
    $this->info("Berhasil menerbitkan {$invoices->count()} tagihan iuran.");
})->purpose('Generate monthly dues invoices for all active kenshi per SK PB No. 045');
