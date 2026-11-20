<?php

declare(strict_types=1);

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DojoController;
use App\Http\Controllers\DojoDashboardController;
use App\Http\Controllers\DojoFeeSettingController;
use App\Http\Controllers\ExaminationController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\KenshiController;
use App\Http\Controllers\KenshiPortalController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ModuleHubController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PengurusController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\TrainingScheduleController;
use Illuminate\Support\Facades\Route;

// Redirect home to dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Direct /dojo alias route
Route::get('/dojo', function () {
    if (auth()->check() && auth()->user()->hasRole('Sensei')) {
        return redirect()->route('dojos.analytics');
    }

    return redirect()->route('dojos.index');
})->name('dojo.alias');

// Authentication routes
Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.post');
});
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');
Route::get('/logout-get', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// Publicly viewable directory
Route::get('/kenshis', [KenshiController::class, 'index'])->name('kenshis.index');
Route::get('/coaches', [KenshiController::class, 'coaches'])->name('coaches.index');

// Protected portals & administrative actions
Route::middleware('auth')->group(function (): void {
    // National Executive Dashboard & Command Center
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Dojo directory & analytics (authenticated members only)
    Route::get('/dojos', [DojoController::class, 'index'])->name('dojos.index');
    // Dojo Sensei Analytics & Monitoring Portal
    Route::get('/my-dojo', [DojoDashboardController::class, 'index'])->name('dojos.analytics');

    // Pengkot & Pengprov Organization Portals & Rosters
    Route::get('/pengkot', [PengurusController::class, 'pengkot'])->name('pengkot.index');
    Route::get('/pengprov', [PengurusController::class, 'pengprov'])->name('pengprov.index');
    Route::put('/pengurus/{pengurus}', [PengurusController::class, 'update'])->name('pengurus.update');

    // Kenshi Member Portal & Digital License (KTA)
    Route::get('/portal/kenshi', [KenshiPortalController::class, 'index'])->name('kenshis.portal');

    // Central Reports & Analytics (Queue-based PDF & Excel generator)
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('/reports/status/{exportId}', [ReportController::class, 'status'])->name('reports.status');
    Route::get('/reports/download/{exportId}', [ReportController::class, 'download'])->name('reports.download');

    // Modul Materi Video & PDF Kurikulum
    Route::get('/materials', [MaterialController::class, 'index'])->name('materials.index');
    Route::get('/materials/{material:slug}', [MaterialController::class, 'show'])->name('materials.show');
    Route::post('/materials/{material}/toggle-complete', [MaterialController::class, 'toggleComplete'])->name('materials.toggle_complete');
    Route::get('/dojo/materi', [MaterialController::class, 'dojoIndex'])->name('dojo.materials.index');
    Route::post('/dojo/materi', [MaterialController::class, 'storeDojoMaterial'])->name('dojo.materials.store');
    Route::get('/portal/kenshi/materi', [MaterialController::class, 'index'])->name('kenshis.materials');

    // Modul Iuran PERKEMI & Pengaturan Tarif Dojo (SK No. 045/SK-PB/VII/2025)
    Route::get('/dojo/settings/iuran', [DojoFeeSettingController::class, 'index'])->name('dojo.fee_settings.index');
    Route::post('/dojo/settings/iuran', [DojoFeeSettingController::class, 'store'])->name('dojo.fee_settings.store');
    Route::post('/pb/fee-settings/{setting}/approve', [DojoFeeSettingController::class, 'approve'])->name('pb.fee_settings.approve');
    Route::post('/pb/fee-settings/{setting}/reject', [DojoFeeSettingController::class, 'reject'])->name('pb.fee_settings.reject');
    Route::get('/dojo/iuran', [InvoiceController::class, 'dojoIndex'])->name('dojo.invoices.index');
    Route::post('/dojo/invoices/generate', [InvoiceController::class, 'generateMonthly'])->name('dojo.invoices.generate');
    Route::get('/portal/kenshi/iuran', [InvoiceController::class, 'kenshiPortal'])->name('kenshis.invoices');
    Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');

    // Modul Ujian Kenaikan Tingkat (UKT) & Lembar Skoring Digital
    Route::get('/examinations', [ExaminationController::class, 'index'])->name('examinations.index');
    Route::get('/examinations/{examination}', [ExaminationController::class, 'show'])->name('examinations.show');
    Route::post('/examinations/{examination}/register', [ExaminationController::class, 'register'])->name('examinations.register');
    Route::post('/examinations/scores', [ExaminationController::class, 'submitScore'])->name('examinations.scores.store');
    Route::post('/examinations/registrations/{registration}/finalize', [ExaminationController::class, 'finalize'])->name('examinations.finalize');
    Route::get('/portal/kenshi/ukt', [ExaminationController::class, 'kenshiPortal'])->name('kenshis.ukt');

    // Main Concept High-Performance & Scientific Modules
    Route::get('/performance/physical', [ModuleHubController::class, 'physicalPerformance'])->name('modules.physical');
    Route::get('/performance/technical', [ModuleHubController::class, 'technicalPerformance'])->name('modules.technical');
    Route::get('/performance/independent', [ModuleHubController::class, 'independentTraining'])->name('modules.independent');
    Route::post('/performance/independent', [ModuleHubController::class, 'storeIndependentTraining'])->name('modules.independent.store');
    Route::delete('/performance/independent/{training}', [ModuleHubController::class, 'destroyIndependentTraining'])->name('modules.independent.destroy');
    Route::get('/performance/evaluations', [ModuleHubController::class, 'coachEvaluations'])->name('modules.evaluations');
    Route::post('/performance/evaluations', [ModuleHubController::class, 'storeCoachEvaluation'])->name('modules.evaluations.store');
    Route::get('/performance/wellness', [ModuleHubController::class, 'wellnessRecovery'])->name('modules.wellness');
    Route::get('/competitions', [ModuleHubController::class, 'competitionIntelligence'])->name('modules.competitions');
    Route::get('/ai-intelligence', [ModuleHubController::class, 'aiIntelligence'])->name('modules.ai');
    Route::get('/promotions', [ModuleHubController::class, 'promotions'])->name('modules.promotions');
    Route::post('/promotions/{kenshi}/promote', [ModuleHubController::class, 'promoteKenshi'])->name('modules.promotions.promote');
    Route::get('/finance', [ModuleHubController::class, 'finance'])->name('modules.finance');

    // Dojo Administration (registered before wildcards)
    Route::get('/dojos/create', [DojoController::class, 'create'])->name('dojos.create');
    Route::post('/dojos', [DojoController::class, 'store'])->name('dojos.store');
    Route::get('/dojos/{dojo}/edit', [DojoController::class, 'edit'])->name('dojos.edit');
    Route::put('/dojos/{dojo}', [DojoController::class, 'update'])->name('dojos.update');
    Route::delete('/dojos/{dojo}', [DojoController::class, 'destroy'])->name('dojos.destroy');
    Route::get('/dojos/{dojo}', [DojoController::class, 'show'])->name('dojos.show');

    // Kenshi Administration (registered before wildcards)
    Route::get('/kenshis/export', [KenshiController::class, 'export'])->name('kenshis.export');
    Route::get('/kenshis/export-template', [KenshiController::class, 'downloadTemplate'])->name('kenshis.export_template');
    Route::post('/kenshis/import', [KenshiController::class, 'import'])->name('kenshis.import');
    Route::get('/kenshis/create', [KenshiController::class, 'create'])->name('kenshis.create');
    Route::post('/kenshis', [KenshiController::class, 'store'])->name('kenshis.store');
    Route::get('/kenshis/{kenshi}/edit', [KenshiController::class, 'edit'])->name('kenshis.edit');
    Route::put('/kenshis/{kenshi}', [KenshiController::class, 'update'])->name('kenshis.update');
    Route::delete('/kenshis/{kenshi}', [KenshiController::class, 'destroy'])->name('kenshis.destroy');

    // Training Schedules & Multi-Batch Calendar
    Route::post('/schedules', [TrainingScheduleController::class, 'store'])->name('schedules.store');
    Route::delete('/schedules/{schedule}', [TrainingScheduleController::class, 'destroy'])->name('schedules.destroy');

    // Attendance (Camera & Geotag Check-in, Permits & Sensei Overrides)
    Route::get('/attendance/check-in', [AttendanceController::class, 'checkIn'])->name('attendance.checkin');
    Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::post('/attendance/permit', [AttendanceController::class, 'submitPermit'])->name('attendance.permit');
    Route::post('/attendance/{attendance}/approve', [AttendanceController::class, 'approvePermit'])->name('attendance.approve');
    Route::post('/attendance/override-status', [AttendanceController::class, 'overrideStatus'])->name('attendance.override');

    // Training Schedules & Calendar (Public / All Members)
    Route::get('/schedules', [TrainingScheduleController::class, 'index'])->name('schedules.index');
    Route::get('/schedules/{schedule}', [TrainingScheduleController::class, 'show'])->name('schedules.show');

    // Wildcard parameter detail routes (placed last)
    Route::get('/kenshis/{kenshi}', [KenshiController::class, 'show'])->name('kenshis.show');

});
