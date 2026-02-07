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
import { Edit, Trash2, User, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface UserListProps {
  users: string[];
  onEditUser: (username: string) => void;
  onDeleteUser: () => void;
}

export function UserList({ users, onEditUser, onDeleteUser }: UserListProps) {
  const { token } = useAuth();
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [userPolicies, setUserPolicies] = useState<Record<string, string[]>>({});
  const [loadingPolicies, setLoadingPolicies] = useState<Set<string>>(new Set());

  const fetchUserPolicies = async (username: string) => {
    if (userPolicies[username] || loadingPolicies.has(username)) return;

    setLoadingPolicies((prev) => new Set([...prev, username]));

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        headers: {
          "x-openbao-token": token || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user policies");
      }

      const result = await response.json();
      const policies = result.data?.policies || [];

      setUserPolicies((prev) => ({
        ...prev,
        [username]: policies,
      }));
    } catch (err) {
      console.error(`Failed to fetch policies for ${username}:`, err);
    } finally {
      setLoadingPolicies((prev) => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    setDeletingUser(username);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        method: "DELETE",
        headers: {
          "x-openbao-token": token || "",
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete user");
      }

      onDeleteUser();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  const handleMouseEnter = (username: string) => {
    fetchUserPolicies(username);
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No users found. Create your first user to get started.
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
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage OpenBao userpass authentication users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((username) => {
              const isDeleting = deletingUser === username;
              const policies = userPolicies[username] || [];
              const isLoadingPolicies = loadingPolicies.has(username);

              return (
                <div
                  key={username}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  onMouseEnter={() => handleMouseEnter(username)}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <User className="h-5 w-5 text-blue-500 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="truncate block font-medium">{username}</span>
                      </div>
                      {isLoadingPolicies ? (
                        <p className="text-sm text-muted-foreground">Loading policies...</p>
                      ) : policies.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {policies.map((policy) => (
                            <Badge key={policy} variant="secondary" className="text-xs">
                              {policy}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No policies</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditUser(username)}
                      disabled={isDeleting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(username)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
