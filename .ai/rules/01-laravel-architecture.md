# Rule 01: Laravel Architecture, Controllers & Code Quality

## 1. Architectural Principles
- **Thin Controllers**: Controllers must only receive HTTP requests, delegate authorization, invoke single-purpose Action classes or Services, and return Inertia/JSON responses.
- **Single Responsibility Principle (SRP)**: Business logic, complex queries, external API calls, and multi-step mutations MUST NOT live inside Controllers.
- **Action Pattern**:
  - Place complex domain mutations in `app/Actions/{Domain}/{ActionName}.php`.
  - Action classes must expose a single public `execute(...)` or `handle(...)` method with strict type hints.
  - Actions must handle internal DB transactions when multiple tables or external side effects are involved.

## 2. Directory & Namespace Structure
```text
app/
├── Actions/                 # Single-purpose business logic actions
│   ├── Dojo/               # Domain-grouped actions (CreateDojoAction, etc.)
│   └── Kenshi/             # (RegisterKenshiAction, PromoteRankAction, etc.)
├── Enums/                   # PHP 8.1+ Enums (KenshiRank, DojoStatus, AttendanceStatus)
├── Http/
│   ├── Controllers/        # Thin controllers extending App\Http\Controllers\Controller
│   ├── Middleware/         # Custom HTTP middlewares (HandleInertiaRequests, etc.)
│   ├── Requests/           # Dedicated Form Requests per action (StoreDojoRequest, etc.)
│   └── Resources/          # Eloquent API & Inertia Resource classes
├── Models/                  # Eloquent models with UUIDs, Relationships, SoftDeletes
├── Policies/                # Authorization policies mapped to Spatie permissions
└── Services/                # Third-party integrations & persistent stateful services
```

## 3. Controller Standards
- Every public method must specify explicit parameter types and return type declarations:
  ```php
  public function store(StoreDojoRequest $request, CreateDojoAction $action): RedirectResponse
  ```
- Always authorize via `$this->authorize('permission_or_ability', $model)` or Form Request `authorize()` method.
- Standard Inertia response:
  ```php
  return Inertia::render('Dojos/Index', [
      'dojos' => DojoResource::collection($dojos),
      'filters' => $request->only(['search', 'status', 'region']),
  ]);
  ```
- Standard flash feedback:
  ```php
  return redirect()->route('dojos.index')
      ->with('success', 'Dojo berhasil didaftarkan ke sistem Perkemi.');
  ```

## 4. Form Requests & Validation
- Never use `$request->validate([...])` inline in controller actions for create/update operations.
- Always generate dedicated Form Requests extending `Illuminate\Foundation\Http\FormRequest`.
- Use array syntax for validation rules instead of pipe notation (`|`):
  ```php
  public function rules(): array
  {
      return [
          'name' => ['required', 'string', 'max:150'],
          'code' => ['required', 'string', 'max:20', Rule::unique('dojos', 'code')->ignore($this->dojo)],
          'status' => ['required', Rule::enum(DojoStatus::class)],
      ];
  }
  ```

## 5. Strict Types & PHP 8.4 Conventions
- Constructor property promotion is mandatory for dependencies.
- Strict scalar types and return type declarations are required on all methods.
- Enums must be used for finite domain states (Kenshi Rank, Dojo Status, Event Categories).
