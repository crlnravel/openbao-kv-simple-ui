"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Edit, Trash2, Folder, Key, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface SecretListProps {
  secrets: string[];
  currentPath?: string;
  onViewSecret: (path: string) => void;
  onEditSecret: (path: string) => void;
  onDeleteSecret: (path: string) => void;
  onNavigateToFolder: (path: string) => void;
}

export function SecretList({
  secrets,
  currentPath = "",
  onViewSecret,
  onEditSecret,
  onDeleteSecret,
  onNavigateToFolder,
}: SecretListProps) {
  const { token } = useAuth();
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (path: string) => {
    if (!confirm(`Are you sure you want to delete the secret at "${path}"?`)) {
      return;
    }

    setDeletingPath(path);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/secrets/${encodeURIComponent(path)}`, {
        method: "DELETE",
        headers: {
          "x-openbao-token": token || "",
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete secret");
      }

      onDeleteSecret(path);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete secret");
    } finally {
      setDeletingPath(null);
    }
  };

  const isFolder = (key: string) => key.endsWith("/");

  const getFullPath = (key: string) => {
    return currentPath ? `${currentPath}/${key}` : key;
  };

  if (secrets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No secrets found. Create your first secret to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Secrets</CardTitle>
          <CardDescription>
            {currentPath
              ? `Showing secrets in: ${currentPath}`
              : "All secrets in the root path"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {secrets.map((key) => {
              const fullPath = getFullPath(key);
              const folder = isFolder(key);
              const isDeleting = deletingPath === fullPath;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {folder ? (
                      <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    ) : (
                      <Key className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      {folder ? (
                        <button
                          onClick={() => onNavigateToFolder(fullPath)}
                          className="text-left hover:underline truncate block w-full"
                        >
                          {key}
                        </button>
                      ) : (
                        <span className="truncate block">{key}</span>
                      )}
                    </div>

                    <Badge variant={folder ? "secondary" : "default"}>
                      {folder ? "Folder" : "Secret"}
                    </Badge>
                  </div>

                  {!folder && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSecret(fullPath)}
                        disabled={isDeleting}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSecret(fullPath)}
                        disabled={isDeleting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(fullPath)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
