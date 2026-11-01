export class RecoveryController {
  static async executeWithRetry<T>(
    actionName: string,
    operation: () => Promise<T>,
    maxRetries = 2,
    delayMs = 300
  ): Promise<T> {
    let lastError: any = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: any) {
        lastError = err;
        console.warn(`[RecoveryController] Attempt ${attempt}/${maxRetries} failed for '${actionName}': ${err.message}`);
        if (attempt < maxRetries) {
          await new Promise(res => setTimeout(res, delayMs * attempt));
        }
      }
    }
    throw lastError;
  }
}