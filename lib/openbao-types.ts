// OpenBao API Types

export interface LoginResponse {
  auth: {
    client_token: string;
    accessor: string;
    policies: string[];
    token_policies: string[];
    metadata: Record<string, string>;
    lease_duration: number;
    renewable: boolean;
  };
}

export interface SecretMetadata {
  created_time: string;
  custom_metadata: Record<string, string> | null;
  deletion_time: string;
  destroyed: boolean;
  version: number;
}

export interface SecretData {
  data: Record<string, string>;
  metadata: SecretMetadata;
}

export interface SecretListResponse {
  data: {
    keys: string[];
  };
}

export interface User {
  name: string;
  policies?: string[];
}

export interface Policy {
  name: string;
  rules: string;
}

export interface ApiError {
  errors: string[];
}
