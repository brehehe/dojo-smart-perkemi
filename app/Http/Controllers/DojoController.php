<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\Dojo\CreateDojoAction;
use App\Actions\Dojo\UpdateDojoAction;
use App\Http\Requests\Dojo\StoreDojoRequest;
use App\Http\Requests\Dojo\UpdateDojoRequest;
use App\Http\Resources\DojoResource;
use App\Models\Dojo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DojoController extends Controller
{
    /**
     * Display a listing of the dojos with eager loading, filtering, and pagination.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Dojo::class);

        $filters = $request->only(['search', 'status', 'pengprov']);

        $dojos = Dojo::query()
            ->with(['headSensei:id,name,email'])
            ->withCount('kenshis')
            ->search($filters['search'] ?? null)
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['pengprov'] ?? null, fn ($query, $prov) => $query->where('pengprov', $prov))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Dojos/Index', [
            'dojos' => DojoResource::collection($dojos),
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new dojo.
     */
    public function create(): Response
    {
        $this->authorize('create', Dojo::class);

        return Inertia::render('Dojos/Create');
    }

    /**
     * Store a newly created dojo using a dedicated Action.
     */
    public function store(StoreDojoRequest $request, CreateDojoAction $action): RedirectResponse
    {
        $dojo = $action->execute($request->validated());

        return $this->redirectWithSuccess('dojos.index', "Dojo [{$dojo->name}] berhasil ditambahkan ke database Perkemi.");
    }

    /**
     * Display the specified dojo.
     */
    public function show(Dojo $dojo): Response
    {
        $this->authorize('view', $dojo);

        $dojo->load(['headSensei:id,name,email'])->loadCount('kenshis');

        return Inertia::render('Dojos/Show', [
            'dojo' => new DojoResource($dojo),
        ]);
    }

    /**
     * Show the form for editing the specified dojo.
     */
    public function edit(Dojo $dojo): Response
    {
        $this->authorize('update', $dojo);

        return Inertia::render('Dojos/Edit', [
            'dojo' => new DojoResource($dojo),
        ]);
    }

    /**
     * Update the specified dojo using an Action.
     */
    public function update(UpdateDojoRequest $request, Dojo $dojo, UpdateDojoAction $action): RedirectResponse
    {
        $action->execute($dojo, $request->validated());

        return $this->redirectWithSuccess('dojos.index', "Data Dojo [{$dojo->name}] berhasil diperbarui.");
    }

    /**
     * Remove the specified dojo from storage (Soft Delete).
     */
    public function destroy(Dojo $dojo): RedirectResponse
    {
        $this->authorize('delete', $dojo);

        $dojo->delete();

        activity('dojo')
            ->performedOn($dojo)
            ->causedBy(auth()->user())
            ->log("Dojo [{$dojo->name}] dinonaktifkan (soft deleted).");

        return $this->redirectWithSuccess('dojos.index', "Dojo [{$dojo->name}] berhasil dinonaktifkan.");
    }
}
