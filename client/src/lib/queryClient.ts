import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

// Enhanced error handling
export class APIError extends Error {
  statusCode: number;
  code?: string;
  metadata?: Record<string, any>;

  constructor(message: string, statusCode: number, code?: string, metadata?: Record<string, any>) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.metadata = metadata;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      errorData = { error: res.statusText };
    }

    throw new APIError(
      errorData.error || `HTTP ${res.status}`,
      res.status,
      errorData.code,
      errorData.metadata
    );
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add loading indicator for mutations
  const isModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());

  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Log API errors for debugging
    console.error(`API ${method} ${url} failed:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      signal, // Support query cancellation
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Smart retry logic
const shouldRetry = (failureCount: number, error: any) => {
  // Don't retry on client errors (400-499) except 408, 429
  if (error instanceof APIError) {
    const { statusCode } = error;
    if (statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429) {
      return false;
    }
  }

  // Retry up to 3 times with exponential backoff
  return failureCount < 3;
};

const retryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000);

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Global error handling for queries
      console.error('Query error:', error);

      if (error instanceof APIError && error.statusCode >= 500) {
        toast({
          title: "Server Error",
          description: "We're experiencing technical difficulties. Please try again.",
          variant: "destructive",
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      // Global error handling for mutations
      console.error('Mutation error:', error);

      if (error instanceof APIError) {
        let title = "Operation Failed";
        let description = error.message;

        // Customize error messages based on status code
        switch (error.statusCode) {
          case 400:
            title = "Invalid Input";
            description = "Please check your input and try again.";
            break;
          case 401:
            title = "Authentication Required";
            description = "Please log in to continue.";
            break;
          case 403:
            title = "Access Denied";
            description = "You don't have permission to perform this action.";
            break;
          case 404:
            title = "Not Found";
            description = "The requested resource could not be found.";
            break;
          case 409:
            title = "Conflict";
            description = "This operation conflicts with existing data.";
            break;
          case 422:
            title = "Validation Error";
            description = error.message;
            break;
          case 429:
            title = "Too Many Requests";
            description = "Please wait a moment before trying again.";
            break;
          case 500:
          default:
            title = "Server Error";
            description = "We're experiencing technical difficulties. Please try again.";
            break;
        }

        toast({
          title,
          description,
          variant: "destructive",
        });
      }
    },
    onSuccess: (data, variables, context, mutation) => {
      // Global success handling for mutations
      const mutationKey = mutation.options.mutationKey;
      if (mutationKey) {
        const [operation, resource] = mutationKey as string[];

        const successMessages: Record<string, string> = {
          'create-case': 'Case created successfully',
          'create-evidence': 'Evidence uploaded successfully',
          'verify-evidence': 'Evidence verified successfully',
          'mint-evidence': 'Evidence added to ChittyChain Ledger',
          'create-fact': 'Fact extracted successfully',
        };

        const key = `${operation}-${resource}`;
        if (successMessages[key]) {
          toast({
            title: "Success",
            description: successMessages[key],
            variant: "default",
          });
        }
      }
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: shouldRetry,
      retryDelay,
    },
    mutations: {
      retry: shouldRetry,
      retryDelay,
    },
  },
});
