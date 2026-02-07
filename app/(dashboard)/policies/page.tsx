"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PolicyList } from "@/components/policies/policy-list";
import { PolicyDialog } from "@/components/policies/policy-dialog";
import { AlertCircle, Loader2 } from "lucide-react";

export default function PoliciesPage() {
  const { token } = useAuth();
  const [policies, setPolicies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<string | undefined>();

  const fetchPolicies = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/policies", {
        headers: {
          "x-openbao-token": token,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to fetch policies");
      }

      const result = await response.json();
      setPolicies(result.data?.keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch policies");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleViewPolicy = (name: string) => {
    setSelectedPolicy(name);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Policy Management</h1>
        <p className="text-muted-foreground mt-1">
          View OpenBao policies and permissions
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <PolicyList
          policies={policies}
          onViewPolicy={handleViewPolicy}
        />
      )}

      <PolicyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        policyName={selectedPolicy}
      />
    </div>
  );
}
