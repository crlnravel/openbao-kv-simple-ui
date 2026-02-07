"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm, UserFormData, UserEditFormData } from "./user-form";
import { useAuth } from "@/lib/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username?: string;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

export function UserDialog({
  open,
  onOpenChange,
  username,
  mode,
  onSuccess,
}: UserDialogProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserFormData | null>(null);

  const fetchUser = useCallback(async () => {
    if (!username || !token) return;

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}`, {
        headers: {
          "x-openbao-token": token,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to fetch user");
      }

      const result = await response.json();
      const policies = result.data?.policies || [];

      setUserData({
        username,
        password: "",
        policies: policies.join(", "),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setIsFetching(false);
    }
  }, [username, token]);

  useEffect(() => {
    if (open && username && mode === "edit") {
      fetchUser();
    } else if (open && mode === "create") {
      setUserData(null);
      setError(null);
    }
  }, [open, username, mode, fetchUser]);

  const handleSubmit = async (data: UserFormData | UserEditFormData) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const policies = data.policies
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (mode === "create") {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-openbao-token": token,
          },
          body: JSON.stringify({
            username: data.username,
            password: data.password,
            policies,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to create user");
        }
      } else {
        // Edit mode
        const updateData: { password?: string; policies?: string[] } = {};

        if (data.password && data.password.trim().length > 0) {
          updateData.password = data.password;
        }

        updateData.policies = policies;

        const response = await fetch(`/api/users/${encodeURIComponent(data.username)}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-openbao-token": token,
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to update user");
        }
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    return mode === "create" ? "Create New User" : "Edit User";
  };

  const getDialogDescription = () => {
    return mode === "create"
      ? "Create a new user with username, password, and policies."
      : "Update the user's password and policies.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error && !userData && mode === "edit" ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <UserForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            defaultValues={userData || undefined}
            isEditing={mode === "edit"}
            isLoading={isLoading}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
