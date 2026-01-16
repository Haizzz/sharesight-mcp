# Sharesight MCP Server

A Model Context Protocol (MCP) server that provides AI assistants with access to the [Sharesight](https://www.sharesight.com/) portfolio tracking platform via the v3 API.

## Overview

This MCP server enables Claude and other AI assistants to interact with Sharesight accounts, allowing natural language queries and operations on investment portfolios, holdings, custom investments, and performance reports.

### What is Sharesight?

Sharesight is a portfolio tracking platform that helps investors track their stocks, ETFs, mutual funds, and other investments across multiple markets. It provides performance reporting, dividend tracking, and tax reporting features.

### What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that enables AI assistants to securely connect to external data sources and tools.

## Features

This server exposes **27 tools** covering all Sharesight v3 API endpoints:

### Portfolio Management
| Tool | Description |
|------|-------------|
| `list_portfolios` | List all user portfolios with optional consolidated view |
| `get_portfolio` | Get detailed portfolio information by ID |
| `list_portfolio_holdings` | List all holdings within a specific portfolio |
| `get_portfolio_user_setting` | Get user display preferences for a portfolio |
| `update_portfolio_user_setting` | Update chart type, grouping, and other display settings |

### Holdings Management
| Tool | Description |
|------|-------------|
| `list_holdings` | List all holdings across all portfolios |
| `get_holding` | Get holding details with optional cost base and historical values |
| `update_holding` | Update holding settings (DRP configuration) |
| `delete_holding` | Remove a holding from a portfolio |

### Custom Investments
| Tool | Description |
|------|-------------|
| `list_custom_investments` | List custom/unlisted investments |
| `get_custom_investment` | Get custom investment details |
| `create_custom_investment` | Create a new custom investment (property, bonds, etc.) |
| `update_custom_investment` | Update custom investment properties |
| `delete_custom_investment` | Remove a custom investment |

### Custom Investment Prices
| Tool | Description |
|------|-------------|
| `list_custom_investment_prices` | Get price history for a custom investment |
| `create_custom_investment_price` | Add a new price entry |
| `update_custom_investment_price` | Modify an existing price entry |
| `delete_custom_investment_price` | Remove a price entry |

### Coupon Rates (Fixed Interest)
| Tool | Description |
|------|-------------|
| `list_coupon_rates` | List interest rates for fixed interest investments |
| `create_coupon_rate` | Add a new coupon rate |
| `update_coupon_rate` | Modify a coupon rate |
| `delete_coupon_rate` | Remove a coupon rate |

### Performance Reports
| Tool | Description |
|------|-------------|
| `get_performance_report` | Detailed performance breakdown with gains analysis |
| `get_performance_index_chart` | Chart data for visualizing portfolio performance |

### Other
| Tool | Description |
|------|-------------|
| `list_countries` | Get Sharesight-supported countries and their settings |
| `show_coupon_code` | View applied promotional coupon code |
| `apply_coupon_code` | Apply a promotional coupon code |
| `delete_coupon_code` | Remove applied coupon code |
| `revoke_api_access` | Disconnect API access (invalidates all tokens) |

## Prerequisites

- **Node.js 18+** - Required runtime
- **Sharesight Account** - With API access enabled
- **OAuth2 Access Token** - Obtained through Sharesight's OAuth flow

## Installation

```bash
# Clone or download this repository
cd sharesight-mcp

# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Authentication

Sharesight uses OAuth 2.0 for API authentication. To obtain an access token:

1. **Register your application** with Sharesight to get `client_id` and `client_secret`
2. **Implement OAuth flow** to get authorization from users
3. **Exchange authorization code** for access and refresh tokens
4. **Store tokens securely** and refresh as needed

See [Sharesight OAuth Documentation](https://api.sharesight.com/doc/api/v3) for detailed instructions.

## Configuration

### Environment Variable

Set the `SHARESIGHT_ACCESS_TOKEN` environment variable:

```bash
export SHARESIGHT_ACCESS_TOKEN="your_oauth_access_token"
```

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sharesight": {
      "command": "node",
      "args": ["D:/sharesight-mcp/dist/index.js"],
      "env": {
        "SHARESIGHT_ACCESS_TOKEN": "your_oauth_access_token"
      }
    }
  }
}
```

## Usage Examples

Once configured, you can interact with Sharesight using natural language:

### Portfolio Queries
- "Show me all my portfolios"
- "What holdings do I have in my retirement portfolio?"
- "Get the details for portfolio ID 12345"

### Performance Analysis
- "What's my portfolio performance for 2024?"
- "Show me a performance report from January to June grouped by market"
- "Compare my portfolio against the S&P 500 (SPY.NYSE)"

### Holdings Management
- "List all my holdings"
- "What's the cost base for my Apple shares?"
- "Enable dividend reinvestment for holding 67890"

### Custom Investments
- "Create a custom investment for my property at 123 Main St"
- "Add a price of $500,000 for my property investment dated today"
- "List all my custom investments"

### Reports
- "What are my total gains this financial year?"
- "Break down my performance by country"
- "Show me the performance chart data for the last 12 months"

## Project Structure

```
sharesight-mcp/
├── src/
│   ├── index.ts              # MCP server entry point with tool definitions
│   ├── sharesight-client.ts  # Sharesight API client implementation
│   └── types.ts              # TypeScript type definitions
├── dist/                     # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Run the server directly
npm start
```

### Adding New Tools

1. Add the endpoint method to `src/sharesight-client.ts`
2. Add types to `src/types.ts` if needed
3. Add the tool definition in `src/index.ts` (in the `tools` array)
4. Add the case handler in the `CallToolRequestSchema` handler

## API Reference

This server implements the [Sharesight v3 API](https://api.sharesight.com/doc/api/v3). Key concepts:

### Date Formats
All dates use `YYYY-MM-DD` format in the portfolio's timezone.

### Pagination
List endpoints support cursor-based pagination:
- `page`: Cursor from previous response
- `per_page`: Items per page (default: 50, max: 100)

### Grouping Options
Performance reports support grouping by:
- `market` - Stock exchange
- `country` - Country of listing
- `currency` - Trading currency
- `investment_type` - Type of investment
- `industry_classification` - FactSet industry
- `sector_classification` - FactSet sector
- `portfolio` - Individual portfolio (for consolidated views)
- `custom_group` - User-defined groups
- `ungrouped` - No grouping

### Investment Types
Custom investments support these types:
- `ORDINARY` - Ordinary shares
- `WARRANT` - Warrants
- `SHAREFUND` - Share funds
- `PROPFUND` - Property funds
- `PREFERENCE` - Preference shares
- `STAPLEDSEC` - Stapled securities
- `OPTIONS` - Options
- `RIGHTS` - Rights
- `MANAGED_FUND` - Managed funds
- `FIXED_INTEREST` - Fixed interest (bonds, term deposits)
- `PIE` - Portfolio Investment Entity

## Error Handling

The server returns errors in this format:

```json
{
  "content": [{
    "type": "text",
    "text": "Error: Sharesight API error (401): The OAuth signature can't be verified."
  }],
  "isError": true
}
```

Common errors:
- **401** - Invalid or expired access token
- **403** - Token revoked or insufficient permissions
- **404** - Resource not found
- **422** - Validation error (check field values)

## Security Notes

- **Never commit access tokens** to version control
- **Use environment variables** for sensitive configuration
- **Refresh tokens** before they expire
- **Revoke access** when users disconnect their accounts

## License

MIT

## Support

- **Sharesight Support**: support@sharesight.com
- **API Documentation**: https://api.sharesight.com/doc/api/v3
- **MCP Protocol**: https://modelcontextprotocol.io/
