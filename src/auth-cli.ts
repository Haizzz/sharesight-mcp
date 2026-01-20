#!/usr/bin/env node

/**
 * Standalone CLI for Sharesight OAuth authentication
 *
 * Run this once in a terminal to complete the OAuth flow and save tokens.
 * The CLI will prompt for Client ID and Client Secret interactively.
 * After authentication, the MCP server will use the saved tokens automatically.
 *
 * Usage:
 *   npx sharesight-mcp-auth
 *
 * @module auth-cli
 */

import * as readline from "readline";
import { OAuthManager } from "./oauth.js";

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function getCredentials(): Promise<{ clientId: string; clientSecret: string }> {
  let clientId = process.env.SHARESIGHT_CLIENT_ID?.trim() || "";
  let clientSecret = process.env.SHARESIGHT_CLIENT_SECRET?.trim() || "";

  if (clientId && clientSecret) {
    return { clientId, clientSecret };
  }

  console.log("\n=== Sharesight One-Time Authentication ===\n");

  const rl = createReadlineInterface();

  if (!clientId) {
    clientId = await prompt(rl, "Enter your Sharesight Client ID: ");
    if (!clientId) {
      rl.close();
      console.error("\nError: Client ID is required.");
      process.exit(1);
    }
  }

  if (!clientSecret) {
    clientSecret = await prompt(rl, "Enter your Sharesight Client Secret: ");
    if (!clientSecret) {
      rl.close();
      console.error("\nError: Client Secret is required.");
      process.exit(1);
    }
  }

  rl.close();

  return { clientId, clientSecret };
}

async function main() {
  const { clientId, clientSecret } = await getCredentials();
  const oauth = new OAuthManager({ clientId, clientSecret });

  if (oauth.hasValidTokens()) {
    console.log("\nAlready authenticated! Tokens are stored and valid.");
    console.log("To re-authenticate, delete ~/.sharesight-mcp/tokens.json and run this again.");
    process.exit(0);
  }

  const authUrl = oauth.getAuthorizationUrl();

  console.log("\n1. Open this URL in your browser:\n");
  console.log(`   ${authUrl}\n`);
  console.log("2. Log in to Sharesight and authorize the application");
  console.log("3. Copy the authorization code shown and paste it below\n");

  const rl = createReadlineInterface();
  const code = await prompt(rl, "Authorization code: ");
  rl.close();

  if (!code) {
    console.error("\nError: No authorization code provided.");
    process.exit(1);
  }

  try {
    await oauth.exchangeCodeForTokens(code);
    console.log("\nAuthentication successful!");
    console.log("Tokens have been saved to ~/.sharesight-mcp/tokens.json");
    console.log("\nYou can now use the Sharesight MCP server with Claude.");
    process.exit(0);
  } catch (error) {
    console.error("\nAuthentication failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
