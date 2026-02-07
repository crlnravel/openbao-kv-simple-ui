"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

const tokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const userpassSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type TokenFormData = z.infer<typeof tokenSchema>;
type UserpassFormData = z.infer<typeof userpassSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [authMethod, setAuthMethod] = useState<"token" | "userpass">("token");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tokenForm = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      token: "",
    },
  });

  const userpassForm = useForm<UserpassFormData>({
    resolver: zodResolver(userpassSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onTokenSubmit = async (data: TokenFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "token",
          token: data.token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      login(result.token);
      router.push("/secrets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onUserpassSubmit = async (data: UserpassFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "userpass",
          username: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      login(result.token);
      router.push("/secrets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>OpenBao Login</CardTitle>
        <CardDescription>
          Sign in to access your secrets and configurations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={authMethod}
          onValueChange={(value) => setAuthMethod(value as "token" | "userpass")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="token">Token</TabsTrigger>
            <TabsTrigger value="userpass">Username/Password</TabsTrigger>
          </TabsList>

          <TabsContent value="token">
            <form
              onSubmit={tokenForm.handleSubmit(onTokenSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="Enter your OpenBao token"
                  {...tokenForm.register("token")}
                  disabled={isLoading}
                />
                {tokenForm.formState.errors.token && (
                  <p className="text-sm text-destructive">
                    {tokenForm.formState.errors.token.message}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="userpass">
            <form
              onSubmit={userpassForm.handleSubmit(onUserpassSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...userpassForm.register("username")}
                  disabled={isLoading}
                />
                {userpassForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {userpassForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...userpassForm.register("password")}
                  disabled={isLoading}
                />
                {userpassForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {userpassForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
