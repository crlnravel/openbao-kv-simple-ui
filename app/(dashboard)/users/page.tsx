"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserList } from "@/components/users/user-list";
import { UserDialog } from "@/components/users/user-dialog";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<string | undefined>();

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        headers: {
          "x-openbao-token": token,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.data?.keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setDialogMode("create");
    setDialogOpen(true);
  };

  const handleEditUser = (username: string) => {
    setSelectedUser(username);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleDeleteUser = () => {
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage OpenBao users and access control</p>
        </div>

        <Button onClick={handleCreateUser}>
          <UserPlus className="h-4 w-4 mr-2" />
          New User
        </Button>
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
        <UserList users={users} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} />
      )}

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        username={selectedUser}
        mode={dialogMode}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
