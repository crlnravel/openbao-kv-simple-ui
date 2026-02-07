"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Shield } from "lucide-react";

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyName?: string;
}

interface PolicyData {
  name: string;
  rules: string;
}

export function PolicyDialog({ open, onOpenChange, policyName }: PolicyDialogProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policyData, setPolicyData] = useState<PolicyData | null>(null);

  const fetchPolicy = useCallback(async () => {
    if (!policyName || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/policies/${encodeURIComponent(policyName)}`, {
        headers: {
          "x-openbao-token": token,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to fetch policy");
      }

      const result = await response.json();
      setPolicyData({
        name: result.data?.name || policyName,
        rules: result.data?.rules || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch policy");
    } finally {
      setIsLoading(false);
    }
  }, [policyName, token]);

  useEffect(() => {
    if (open && policyName) {
      fetchPolicy();
    } else if (!open) {
      setPolicyData(null);
      setError(null);
    }
  }, [open, policyName, fetchPolicy]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <DialogTitle>Policy: {policyName}</DialogTitle>
          </div>
          <DialogDescription>View policy rules and permissions (read-only)</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : policyData ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Policy Rules</label>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono border">
                  <code>{policyData.rules || "(empty policy)"}</code>
                </pre>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
