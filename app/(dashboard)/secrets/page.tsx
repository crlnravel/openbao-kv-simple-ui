"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { SecretList } from "@/components/secrets/secret-list";
import { SecretDialog } from "@/components/secrets/secret-dialog";
import { Plus, Home, ChevronRight, AlertCircle, Loader2 } from "lucide-react";

export default function SecretsPage() {
  const { token } = useAuth();
  const [secrets, setSecrets] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "view">("create");
  const [selectedSecret, setSelectedSecret] = useState<string | undefined>();

  const fetchSecrets = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (currentPath) {
        params.set("path", currentPath);
      }

      const response = await fetch(`/api/secrets?${params.toString()}`, {
        headers: {
          "x-openbao-token": token,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to fetch secrets");
      }

      const result = await response.json();
      setSecrets(result.data?.keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch secrets");
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, token]);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const handleCreateSecret = () => {
    setSelectedSecret(undefined);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditSecret = (path: string) => {
    setSelectedSecret(path);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteSecret = () => {
    fetchSecrets();
  };

  const handleNavigateToFolder = (path: string) => {
    setCurrentPath(path.endsWith("/") ? path.slice(0, -1) : path);
  };

  const handleNavigateToRoot = () => {
    setCurrentPath("");
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split("/");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Secrets Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your OpenBao secrets and configurations
          </p>
        </div>

        <Button onClick={handleCreateSecret}>
          <Plus className="h-4 w-4 mr-2" />
          New Secret
        </Button>
      </div>

      {currentPath && (
        <div className="flex items-center space-x-2 text-sm">
          <button
            onClick={handleNavigateToRoot}
            className="flex items-center space-x-1 hover:underline"
          >
            <Home className="h-4 w-4" />
            <span>Root</span>
          </button>

          {getBreadcrumbs().map((part, index) => {
            const isLast = index === getBreadcrumbs().length - 1;
            const path = getBreadcrumbs()
              .slice(0, index + 1)
              .join("/");

            return (
              <div key={index} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                {isLast ? (
                  <Badge variant="secondary">{part}</Badge>
                ) : (
                  <button onClick={() => setCurrentPath(path)} className="hover:underline">
                    {part}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

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
        <SecretList
          secrets={secrets}
          currentPath={currentPath}
          onEditSecret={handleEditSecret}
          onDeleteSecret={handleDeleteSecret}
          onNavigateToFolder={handleNavigateToFolder}
        />
      )}

      <SecretDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        secretPath={selectedSecret}
        mode={dialogMode}
        onSuccess={fetchSecrets}
      />
    </div>
  );
}
