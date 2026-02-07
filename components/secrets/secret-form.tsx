"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, AlertCircle } from "lucide-react";

const secretSchema = z.object({
  path: z.string().min(1, "Path is required"),
  keyValuePairs: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string(),
      })
    )
    .min(1, "At least one key-value pair is required"),
});

export type SecretFormData = z.infer<typeof secretSchema>;

interface SecretFormProps {
  onSubmit: (data: SecretFormData) => Promise<void>;
  onCancel: () => void;
  defaultValues?: Partial<SecretFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export function SecretForm({
  onSubmit,
  onCancel,
  defaultValues,
  isEditing = false,
  isLoading = false,
  error,
}: SecretFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SecretFormData>({
    resolver: zodResolver(secretSchema),
    defaultValues: defaultValues || {
      path: "",
      keyValuePairs: [{ key: "", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keyValuePairs",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="path">Secret Path</Label>
        <Input
          id="path"
          placeholder="e.g., secret/myapp/config"
          {...register("path")}
          disabled={isEditing || isLoading}
        />
        {errors.path && <p className="text-sm text-destructive">{errors.path.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Key-Value Pairs</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ key: "", value: "" })}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pair
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Key"
                  {...register(`keyValuePairs.${index}.key`)}
                  disabled={isLoading}
                />
                {errors.keyValuePairs?.[index]?.key && (
                  <p className="text-sm text-destructive">
                    {errors.keyValuePairs[index]?.key?.message}
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Value"
                  type="password"
                  {...register(`keyValuePairs.${index}.value`)}
                  disabled={isLoading}
                />
                {errors.keyValuePairs?.[index]?.value && (
                  <p className="text-sm text-destructive">
                    {errors.keyValuePairs[index]?.value?.message}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1 || isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {errors.keyValuePairs && (
          <p className="text-sm text-destructive">{errors.keyValuePairs.message}</p>
        )}
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
          {isLoading ? "Saving..." : isEditing ? "Update Secret" : "Create Secret"}
        </Button>
      </div>
    </form>
  );
}
