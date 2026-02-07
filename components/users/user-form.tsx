"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  policies: z.string(),
});

const userEditSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().optional(),
  policies: z.string(),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UserEditFormData = z.infer<typeof userEditSchema>;

interface UserFormProps {
  onSubmit: (data: UserFormData | UserEditFormData) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<UserFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function UserForm({
  onSubmit,
  onCancel,
  defaultValues,
  isEditing = false,
  isLoading = false,
  error,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(isEditing ? userEditSchema : userSchema),
    defaultValues: defaultValues || {
      username: "",
      password: "",
      policies: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="e.g., john.doe"
          {...register("username")}
          disabled={isEditing || isLoading}
        />
        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password{" "}
          {isEditing && (
            <span className="text-muted-foreground">(leave blank to keep unchanged)</span>
          )}
        </Label>
        <Input
          id="password"
          type="password"
          placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="policies">
          Policies <span className="text-muted-foreground">(comma-separated)</span>
        </Label>
        <Input
          id="policies"
          placeholder="e.g., default, admin"
          {...register("policies")}
          disabled={isLoading}
        />
        {errors.policies && <p className="text-sm text-destructive">{errors.policies.message}</p>}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isEditing ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
