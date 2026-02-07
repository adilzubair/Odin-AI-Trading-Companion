import { RefreshCw } from "lucide-react";

interface RetryButtonProps {
    onRetry: () => void;
    loading?: boolean;
    message?: string;
}

export default function RetryButton({ onRetry, loading = false, message = "Try again" }: RetryButtonProps) {
    return (
        <button
            onClick={onRetry}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
        >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Retrying..." : message}
        </button>
    );
}
