/**
 * OAuth 2.0 Manager for Sharesight API
 *
 * Handles the Authorization Code flow, token storage, and automatic refresh.
 * Tokens are persisted to ~/.sharesight-mcp/tokens.json
 *
 * @module oauth
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as readline from "readline";

const AUTH_URL = "https://api.sharesight.com/oauth2/authorize";
const TOKEN_URL = "https://api.sharesight.com/oauth2/token";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface OAuthManagerOpts {
  clientId: string;
  clientSecret: string;
}

export class OAuthManager {
  private clientId: string;
  private clientSecret: string;
  private tokensPath: string;
  private tokens: StoredTokens | null = null;

  constructor({ clientId, clientSecret }: OAuthManagerOpts) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    const configDir = path.join(os.homedir(), ".sharesight-mcp");
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    this.tokensPath = path.join(configDir, "tokens.json");

    this.loadTokens();
  }

  private loadTokens(): void {
    try {
      if (fs.existsSync(this.tokensPath)) {
        const data = fs.readFileSync(this.tokensPath, "utf-8");
        this.tokens = JSON.parse(data);
      }
    } catch {
      this.tokens = null;
    }
  }

  private saveTokens(): void {
    if (this.tokens) {
      fs.writeFileSync(this.tokensPath, JSON.stringify(this.tokens, null, 2));
    }
  }

  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: REDIRECT_URI,
    });

    return `${AUTH_URL}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<void> {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as TokenResponse;
    this.tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60000, // 1 minute buffer
      token_type: data.token_type,
    };
    this.saveTokens();
  }

  async refreshTokens(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      throw new Error("No refresh token available");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.tokens.refresh_token,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.tokens = null;
      fs.rmSync(this.tokensPath, { force: true });
      throw new Error(`Token refresh failed (${response.status}): ${errorText}. Please re-authorize.`);
    }

    const data = (await response.json()) as TokenResponse;
    this.tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || this.tokens.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000 - 60000,
      token_type: data.token_type,
    };
    this.saveTokens();
  }

  hasValidTokens(): boolean {
    return this.tokens !== null;
  }

  isTokenExpired(): boolean {
    if (!this.tokens) return true;

    return Date.now() >= this.tokens.expires_at;
  }

  async getValidAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error("Not authorized. Please run authorization flow first.");
    }

    if (this.isTokenExpired()) {
      await this.refreshTokens();
    }

    return this.tokens.access_token;
  }

  async runAuthorizationFlow(): Promise<void> {
    const authUrl = this.getAuthorizationUrl();

    console.error("\n=== Sharesight Authorization Required ===\n");
    console.error("1. Open this URL in your browser:\n");
    console.error(`   ${authUrl}\n`);
    console.error("2. Log in and authorize the application");
    console.error("3. Copy the authorization code and paste it below\n");

    const code = await this.promptForCode();
    await this.exchangeCodeForTokens(code.trim());

    console.error("\nAuthorization successful! Tokens saved.\n");
  }

  private promptForCode(): Promise<string> {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stderr,
      });

      rl.question("Authorization code: ", (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}
