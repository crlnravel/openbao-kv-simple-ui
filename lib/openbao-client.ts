// OpenBao API Client (server-side only)

const OPENBAO_ADDR = process.env.OPENBAO_ADDR || "http://localhost:8200";

export class OpenBaoClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string) {
    this.baseUrl = OPENBAO_ADDR;
    this.token = token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "X-Vault-Token": this.token,
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        errors: [response.statusText],
      }));
      throw new Error(error.errors?.[0] || "Request failed");
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth methods
  async loginUserpass(username: string, password: string) {
    return this.request<{ auth: { client_token: string } }>(
      "POST",
      `/v1/auth/userpass/login/${username}`,
      { password }
    );
  }

  // KV v2 methods
  async listSecrets(path: string = "") {
    const listPath = path ? `/v1/secret/metadata/${path}` : "/v1/secret/metadata";
    return this.request<{ data: { keys: string[] } }>("LIST", `${listPath}?list=true`);
  }

  async getSecret(path: string) {
    return this.request<{
      data: {
        data: Record<string, string>;
        metadata: {
          created_time: string;
          version: number;
          destroyed: boolean;
        };
      };
    }>("GET", `/v1/secret/data/${path}`);
  }

  async createSecret(path: string, data: Record<string, string>) {
    return this.request("POST", `/v1/secret/data/${path}`, { data });
  }

  async updateSecret(path: string, data: Record<string, string>) {
    return this.request("POST", `/v1/secret/data/${path}`, { data });
  }

  async deleteSecret(path: string) {
    return this.request("DELETE", `/v1/secret/metadata/${path}`);
  }

  // User management methods
  async listUsers() {
    return this.request<{ data: { keys: string[] } }>("LIST", "/v1/auth/userpass/users?list=true");
  }

  async getUser(username: string) {
    return this.request<{
      data: {
        policies: string[];
        token_policies: string[];
      };
    }>("GET", `/v1/auth/userpass/users/${username}`);
  }

  async createUser(username: string, password: string, policies: string[] = []) {
    return this.request("POST", `/v1/auth/userpass/users/${username}`, {
      password,
      policies: policies.join(","),
    });
  }

  async updateUserPassword(username: string, password: string) {
    return this.request("POST", `/v1/auth/userpass/users/${username}/password`, {
      password,
    });
  }

  async updateUserPolicies(username: string, policies: string[]) {
    return this.request("POST", `/v1/auth/userpass/users/${username}`, {
      policies: policies.join(","),
    });
  }

  async deleteUser(username: string) {
    return this.request("DELETE", `/v1/auth/userpass/users/${username}`);
  }

  // Policy methods
  async listPolicies() {
    return this.request<{ data: { keys: string[] } }>("LIST", "/v1/sys/policy?list=true");
  }

  async getPolicy(name: string) {
    return this.request<{
      data: {
        name: string;
        rules: string;
      };
    }>("GET", `/v1/sys/policy/${name}`);
  }
}

// Helper function to validate token by checking /v1/sys/health
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${OPENBAO_ADDR}/v1/sys/health`, {
      headers: {
        "X-Vault-Token": token,
      },
    });
    return response.ok || response.status === 429; // 429 is also valid (sealed/standby)
  } catch {
    return false;
  }
}
