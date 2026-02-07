"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SecretForm, SecretFormData } from "./secret-form";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface SecretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secretPath?: string;
  mode: "create" | "edit" | "view";
  onSuccess?: () => void;
}

export function SecretDialog({
  open,
  onOpenChange,
  secretPath,
  mode,
  onSuccess,
}: SecretDialogProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretData, setSecretData] = useState<SecretFormData | null>(null);

  const fetchSecret = useCallback(async () => {
    if (!secretPath || !token) return;

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`/api/secrets/${encodeURIComponent(secretPath)}`, {
        headers: {
          "x-openbao-token": token,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to fetch secret");
      }

      const result = await response.json();
      const data = result.data?.data || {};

      setSecretData({
        path: secretPath,
        keyValuePairs: Object.entries(data).map(([key, value]) => ({
          key,
          value: String(value),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch secret");
    } finally {
      setIsFetching(false);
    }
  }, [secretPath, token]);

  useEffect(() => {
    if (open && secretPath && (mode === "edit" || mode === "view")) {
      fetchSecret();
    } else if (open && mode === "create") {
      setSecretData(null);
      setError(null);
    }
  }, [open, secretPath, mode, fetchSecret]);

  const handleSubmit = async (data: SecretFormData) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const secretDataObj = data.keyValuePairs.reduce(
        (acc, pair) => {
          acc[pair.key] = pair.value;
          return acc;
        },
        {} as Record<string, string>
      );

      const url =
        mode === "create"
          ? "/api/secrets"
          : `/api/secrets/${encodeURIComponent(data.path)}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-openbao-token": token,
        },
        body: JSON.stringify({
          path: data.path,
          data: secretDataObj,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save secret");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save secret");
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Secret";
      case "edit":
        return "Edit Secret";
      case "view":
        return "View Secret";
      default:
        return "Secret";
    }
  };

  const getDialogDescription = () => {
    switch (mode) {
      case "create":
        return "Create a new secret with key-value pairs.";
      case "edit":
        return "Update the secret's key-value pairs.";
      case "view":
        return "View the secret's key-value pairs.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error && !secretData ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <SecretForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            defaultValues={secretData || undefined}
            isEditing={mode === "edit"}
            isLoading={isLoading}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
