"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye } from "lucide-react";

interface PolicyListProps {
  policies: string[];
  onViewPolicy: (name: string) => void;
}

const BUILTIN_POLICIES = ["root", "default"];

export function PolicyList({ policies, onViewPolicy }: PolicyListProps) {
  const isBuiltIn = (policy: string) => BUILTIN_POLICIES.includes(policy);

  if (policies.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No policies found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
          <CardDescription>View OpenBao policy rules and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {policies.map((policy) => {
              const builtIn = isBuiltIn(policy);

              return (
                <div
                  key={policy}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-purple-500 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="truncate block font-medium">{policy}</span>
                        {builtIn && (
                          <Badge variant="secondary" className="text-xs">
                            Built-in
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {builtIn ? "System policy" : "Custom policy"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => onViewPolicy(policy)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
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
