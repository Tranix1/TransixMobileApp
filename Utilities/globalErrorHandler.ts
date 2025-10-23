// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandler = () => {
    const errorUtils: any = (global as any)?.ErrorUtils;

    // If ErrorUtils is unavailable (e.g., some environments), safely no-op
    if (!errorUtils || typeof errorUtils.getGlobalHandler !== 'function' || typeof errorUtils.setGlobalHandler !== 'function') {
        // Still attach unhandledrejection listener on web if available
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.addEventListener('unhandledrejection', (event) => {
                console.error('Unhandled Promise Rejection:', (event as any).reason);
                event.preventDefault?.();
            });
        }
        return;
    }

    const originalHandler = errorUtils.getGlobalHandler();

    errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
        console.error('Global Error Handler:', error, 'isFatal:', isFatal);

        if (__DEV__) {
            console.error('Unhandled Error:', error);
        }

        if (typeof originalHandler === 'function') {
            try {
                originalHandler(error, isFatal);
            } catch (handlerError) {
                console.error('Error in original global handler:', handlerError);
            }
        }
    });

    // Handle unhandled promise rejections
    if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection:', (event as any).reason);
            event.preventDefault(); // Prevent the default behavior
        });
    }
};

// Safe async wrapper to catch and handle errors
export const safeAsync = async <T>(
    asyncFn: () => Promise<T>,
    errorHandler?: (error: Error) => void
): Promise<T | null> => {
    try {
        return await asyncFn();
    } catch (error) {
        console.error('Safe async error:', error);
        if (errorHandler) {
            errorHandler(error as Error);
        }
        return null;
    }
};

// Safe interval wrapper that handles errors
export const safeSetInterval = (
    callback: () => void | Promise<void>,
    delay: number
): NodeJS.Timeout => {
    return setInterval(async () => {
        try {
            await callback();
        } catch (error) {
            console.error('Interval callback error:', error);
        }
    }, delay);
};

// Safe timeout wrapper that handles errors
export const safeSetTimeout = (
    callback: () => void | Promise<void>,
    delay: number
): NodeJS.Timeout => {
    return setTimeout(async () => {
        try {
            await callback();
        } catch (error) {
            console.error('Timeout callback error:', error);
        }
    }, delay);
};
