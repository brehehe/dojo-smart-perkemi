# Rule 04: Queue, Redis, Background Jobs & Real-Time Reverb

## 1. Redis Configuration & Caching
- Use Redis for Cache, Queue, and Session drivers in production environments for scalability and atomic locking.
- Use explicit cache tags or prefixing to avoid key collision in shared Redis instances.
- Never store sensitive unencrypted tokens in Redis cache without appropriate expiration TTLs:
  ```php
  Cache::tags(['dojo', "dojo:{$dojoId}"])->remember("stats", now()->addHours(6), fn () => ...);
  ```

## 2. Queue & Background Jobs
- **Idempotency**: All queued jobs (`app/Jobs/**`) MUST be idempotent. A job being retried must not cause double charging, duplicate certificates, or repeated SMS/WhatsApp notifications.
- **Job Attributes**:
  - Define explicit timeouts, retries, and backoff:
    ```php
    public int $tries = 3;
    public int $timeout = 120;
    public array $backoff = [10, 30, 60];
    ```
- **After-Commit Dispatching**:
  - Always dispatch jobs that depend on committed database rows after the transaction commits:
    ```php
    ProcessKenshiPromotionJob::dispatch($kenshi)->afterCommit();
    ```
- **Failed Job Handling**: Implement `failed(?Throwable $exception)` to record failures in Activity Log and alert administrators without halting the worker queue.

## 3. Laravel Reverb & Real-Time Broadcasting
- Use Laravel Reverb for real-time events (e.g. live UKT scores, attendance check-in feed, tournament match updates).
- **Authorization on Channels**:
  - Never broadcast sensitive member data over public channels.
  - Implement strict authorization in `routes/channels.php`:
    ```php
    Broadcast::channel('dojo.{dojoId}', function (User $user, string $dojoId) {
        return $user->hasRole('SuperAdmin') || $user->dojo_id === $dojoId;
    });
    ```
- **Origin & Port Protection**:
  - Restrict Reverb allowed origins to trusted app domains in `config/reverb.php`.
  - Reverb internal ports (e.g. 8080) must be reverse-proxied through Nginx with TLS termination (WSS) and never exposed directly without firewall protection.
- **Graceful Degradation**:
  - The core web interface must function seamlessly if the WebSocket connection drops or is blocked by client firewalls.
