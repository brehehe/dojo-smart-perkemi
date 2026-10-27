<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Closure;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Execute a database transaction safely with automated logging and rollback.
     *
     * @template T
     *
     * @param  (Closure(): T)  $callback
     * @return T
     *
     * @throws Throwable
     */
    protected function safeTransaction(Closure $callback, string $operationName = 'db_transaction'): mixed
    {
        DB::beginTransaction();

        try {
            $result = $callback();
            DB::commit();

            return $result;
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error("Transaction failed during [{$operationName}]: {$e->getMessage()}", [
                'exception' => $e,
                'user_id' => auth()->id(),
            ]);

            throw $e;
        }
    }

    /**
     * Return a standardized success JSON response.
     *
     * @param  array<string, mixed>  $data
     */
    protected function jsonSuccess(string $message, array $data = [], int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    /**
     * Return a standardized error JSON response.
     *
     * @param  array<string, mixed>  $errors
     */
    protected function jsonError(string $message, array $errors = [], int $status = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    /**
     * Redirect with a success flash message.
     */
    protected function redirectWithSuccess(string $route, string $message, array $parameters = []): RedirectResponse
    {
        return redirect()->route($route, $parameters)->with('success', $message);
    }

    /**
     * Redirect with an error flash message.
     */
    protected function redirectWithError(string $route, string $message, array $parameters = []): RedirectResponse
    {
        return redirect()->route($route, $parameters)->with('error', $message);
    }
}
