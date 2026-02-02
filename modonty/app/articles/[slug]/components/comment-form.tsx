'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  onSuccess?: () => void;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
  autoFocus?: boolean;
  compact?: boolean;
}

export function CommentForm({
  onSubmit,
  onSuccess,
  placeholder = 'اكتب تعليقك هنا...',
  submitLabel = 'إرسال التعليق',
  className,
  autoFocus = false,
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (success) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setSuccess(null);
        }
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mountedRef.current) return;
    
    setError(null);
    setSuccess(null);

    const trimmedContent = content.trim();

    // Validation
    if (trimmedContent.length < 3) {
      setError('التعليق يجب أن يكون على الأقل 3 أحرف');
      return;
    }

    if (trimmedContent.length > 2000) {
      setError('التعليق يجب أن يكون أقل من 2000 حرف');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(trimmedContent);

      if (!mountedRef.current) return;

      if (result.success) {
        setContent('');
        setSuccess(result.message || 'تم إرسال التعليق بنجاح');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || 'فشل إرسال التعليق');
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('حدث خطأ أثناء إرسال التعليق');
      }
    } finally {
      if (mountedRef.current) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn(compact ? 'space-y-2' : 'space-y-4', className)}>
      <div className={cn(compact ? 'space-y-1' : 'space-y-2')}>
        <Label htmlFor="comment-content" className="sr-only">
          {placeholder}
        </Label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
            setSuccess(null);
          }}
          placeholder={placeholder}
          rows={compact ? 2 : 4}
          className={cn(
            'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
            compact ? 'px-3 py-2 min-h-[60px]' : 'px-3 py-2 min-h-[100px]',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          disabled={isSubmitting}
          autoFocus={autoFocus}
          maxLength={2000}
        />
        {!compact && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{content.length} / 2000</span>
            {error && <span className="text-destructive">{error}</span>}
            {success && <span className="text-green-600 dark:text-green-400">{success}</span>}
          </div>
        )}
        {compact && (error || success) && (
          <div className="text-xs">
            {error && <span className="text-destructive">{error}</span>}
            {success && <span className="text-green-600 dark:text-green-400">{success}</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || content.trim().length < 3}
          size={compact ? "sm" : "default"}
          className={compact ? "min-w-[80px]" : "min-w-[120px]"}
        >
          {isSubmitting ? (
            <>
              <Loader2 className={cn("animate-spin", compact ? "h-3 w-3" : "h-4 w-4")} />
              {compact ? "..." : "جاري الإرسال..."}
            </>
          ) : (
            submitLabel
          )}
        </Button>
        {content && (
          <Button
            type="button"
            variant="ghost"
            size={compact ? "sm" : "default"}
            onClick={() => {
              setContent('');
              setError(null);
              setSuccess(null);
            }}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
        )}
      </div>
    </form>
  );
}
