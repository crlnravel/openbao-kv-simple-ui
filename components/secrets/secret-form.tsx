"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, AlertCircle, Eye, EyeOff } from "lucide-react";

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
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonValue, setJsonValue] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<number, boolean>>({});

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
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

  // Initialize JSON from key-value pairs when switching to JSON mode
  const handleModeSwitch = (checked: boolean) => {
    if (checked) {
      // Switching to JSON mode
      const currentData = getValues();
      const jsonObj = currentData.keyValuePairs.reduce(
        (acc, pair) => {
          if (pair.key) {
            acc[pair.key] = pair.value;
          }
          return acc;
        },
        {} as Record<string, string>
      );
      setJsonValue(JSON.stringify(jsonObj, null, 2));
      setJsonError(null);
    } else {
      // Switching to key-value mode
      try {
        const parsed = JSON.parse(jsonValue || "{}");
        const pairs = Object.entries(parsed).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setValue("keyValuePairs", pairs.length > 0 ? pairs : [{ key: "", value: "" }]);
        setJsonError(null);
      } catch {
        setJsonError("Invalid JSON - keeping current key-value pairs");
      }
    }
    setIsJsonMode(checked);
  };

  const handleJsonSubmit = async () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const pairs = Object.entries(parsed).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      if (pairs.length === 0) {
        setJsonError("At least one key-value pair is required");
        return;
      }

      const path = getValues("path");
      if (!path) {
        setJsonError("Path is required");
        return;
      }

      await onSubmit({
        path,
        keyValuePairs: pairs,
      });
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  const toggleFieldVisibility = (index: number) => {
    setVisibleFields((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <form
      onSubmit={
        isJsonMode
          ? (e) => {
              e.preventDefault();
              handleJsonSubmit();
            }
          : handleSubmit(onSubmit)
      }
      className="space-y-4"
    >
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

      <div className="flex items-center justify-between py-2 border-b">
        <Label htmlFor="json-mode" className="cursor-pointer">
          Edit as JSON
        </Label>
        <Switch
          id="json-mode"
          checked={isJsonMode}
          onCheckedChange={handleModeSwitch}
          disabled={isLoading}
        />
      </div>

      {isJsonMode ? (
        <div className="space-y-2">
          <Label>JSON Data</Label>
          <Textarea
            value={jsonValue}
            onChange={(e) => {
              setJsonValue(e.target.value);
              setJsonError(null);
            }}
            placeholder='{\n  "key1": "value1",\n  "key2": "value2"\n}'
            className="font-mono text-sm min-h-[300px]"
            disabled={isLoading}
          />
          {jsonError && <p className="text-sm text-destructive">{jsonError}</p>}
        </div>
      ) : (
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
                  <div className="relative">
                    <Input
                      placeholder="Value"
                      type={visibleFields[index] ? "text" : "password"}
                      {...register(`keyValuePairs.${index}.value`)}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleFieldVisibility(index)}
                      disabled={isLoading}
                    >
                      {visibleFields[index] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
                  className="mt-0"
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
      )}

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
