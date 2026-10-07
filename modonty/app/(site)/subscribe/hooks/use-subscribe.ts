import { useState } from "react";

export function useSubscribe() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!email || !email.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/news/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(result.error || "فشل الاشتراك. يرجى المحاولة مرة أخرى.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, isSubmitting, error, success, handleSubmit };
}
