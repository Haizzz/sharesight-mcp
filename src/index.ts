#!/usr/bin/env node

/**
 * Sharesight MCP Server
 *
 * This is the main entry point for the Sharesight MCP server. It exposes
 * Sharesight v3 API functionality as MCP tools that can be used by AI
 * assistants like Claude.
 *
 * The server provides 27 tools covering:
 * - Portfolio management (list, get, settings)
 * - Holdings management (list, get, update, delete)
 * - Custom investments (CRUD operations)
 * - Custom investment prices (CRUD operations)
 * - Coupon rates for fixed interest (CRUD operations)
 * - Performance reports and charts
 * - Country metadata
 * - Coupon codes
 * - OAuth access revocation
 *
 * @see https://api.sharesight.com/doc/api/v3
 * @see https://modelcontextprotocol.io/
 *
 * @example
 * ```bash
 * # Run with access token
 * SHARESIGHT_ACCESS_TOKEN=xxx node dist/index.js
 * ```
 *
 * @module index
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { SharesightClient } from "./sharesight-client.js";

// Get access token from environment
const ACCESS_TOKEN = process.env.SHARESIGHT_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error(
    "Error: SHARESIGHT_ACCESS_TOKEN environment variable is required"
  );
  process.exit(1);
}

const client = new SharesightClient(ACCESS_TOKEN);

// Define all tools
const tools: Tool[] = [
  // ==================== Portfolios ====================
  {
    name: "list_portfolios",
    description:
      "Retrieves a list of the user's portfolios. Optionally filter by consolidated view or instrument.",
    inputSchema: {
      type: "object",
      properties: {
        consolidated: {
          type: "boolean",
          description: "Set to true to see consolidated portfolio views",
        },
        instrument_id: {
          type: "number",
          description:
            "Filter by instrument ID. When set, consolidated defaults to false",
        },
      },
    },
  },
  {
    name: "get_portfolio",
    description: "Retrieves a single portfolio by ID",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "The portfolio ID",
        },
        consolidated: {
          type: "boolean",
          description: "Set to true if the portfolio is consolidated",
        },
      },
      required: ["portfolio_id"],
    },
  },
  {
    name: "list_portfolio_holdings",
    description: "Retrieves all holdings for a specific portfolio",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "The portfolio ID",
        },
        consolidated: {
          type: "boolean",
          description: "True if a consolidated view is requested",
        },
      },
      required: ["portfolio_id"],
    },
  },
  {
    name: "get_portfolio_user_setting",
    description:
      "Retrieves user settings for a portfolio (chart type, grouping, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "The portfolio ID",
        },
        consolidated: {
          type: "boolean",
          description: "Set to true for consolidated portfolio views",
        },
      },
      required: ["portfolio_id"],
    },
  },
  {
    name: "update_portfolio_user_setting",
    description: "Updates user settings for a portfolio",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "The portfolio ID",
        },
        consolidated: {
          type: "boolean",
          description: "Set to true for consolidated portfolio views",
        },
        portfolio_chart: {
          type: "string",
          description:
            "Chart type: VALUE, VALUELINE, GROWTH, BENCHMARK, or HIDE",
        },
        holding_chart: {
          type: "string",
          description:
            "Holding chart type: PRICE, HOLDING_VALUE, BENCHMARK, or HIDE",
        },
        combined: {
          type: "boolean",
          description:
            "True to combine holdings in consolidated portfolios",
        },
        grouping: {
          type: "string",
          description: "Grouping to use (e.g., market, country, currency)",
        },
        include_sold_shares: {
          type: "boolean",
          description: "True to include sold shares in calculations",
        },
      },
      required: ["portfolio_id"],
    },
  },

  // ==================== Holdings ====================
  {
    name: "list_holdings",
    description: "Retrieves a list of all holdings across all portfolios",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_holding",
    description: "Retrieves details of a specific holding",
    inputSchema: {
      type: "object",
      properties: {
        holding_id: {
          type: "number",
          description: "The holding ID",
        },
        average_purchase_price: {
          type: "boolean",
          description: "Include average purchase price in response",
        },
        cost_base: {
          type: "boolean",
          description: "Include cost base in response",
        },
        values_over_time: {
          type: "string",
          description:
            "Set to 'true' for values from inception, or a date (YYYY-MM-DD) for start date",
        },
      },
      required: ["holding_id"],
    },
  },
  {
    name: "update_holding",
    description: "Updates a holding (currently supports DRP settings)",
    inputSchema: {
      type: "object",
      properties: {
        holding_id: {
          type: "number",
          description: "The holding ID",
        },
        enable_drp: {
          type: "boolean",
          description: "Set to true to enable DRP, false to disable",
        },
        drp_mode_setting: {
          type: "string",
          description: "DRP mode: up, down, half, or down_track",
        },
      },
      required: ["holding_id"],
    },
  },
  {
    name: "delete_holding",
    description: "Deletes a holding",
    inputSchema: {
      type: "object",
      properties: {
        holding_id: {
          type: "number",
          description: "The holding ID to delete",
        },
      },
      required: ["holding_id"],
    },
  },

  // ==================== Custom Investments ====================
  {
    name: "list_custom_investments",
    description: "Retrieves a list of custom investments",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "Optional portfolio ID to filter by",
        },
      },
    },
  },
  {
    name: "get_custom_investment",
    description: "Retrieves a single custom investment by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The custom investment ID",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "create_custom_investment",
    description: "Creates a new custom investment",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "Portfolio ID (optional, links to owner if not provided)",
        },
        code: {
          type: "string",
          description: "The investment code",
        },
        name: {
          type: "string",
          description: "The name of the custom investment",
        },
        country_code: {
          type: "string",
          description: "Country code (e.g., AU, NZ, US)",
        },
        investment_type: {
          type: "string",
          description:
            "Type: ORDINARY, WARRANT, SHAREFUND, PROPFUND, PREFERENCE, STAPLEDSEC, OPTIONS, RIGHTS, MANAGED_FUND, FIXED_INTEREST, PIE",
        },
        face_value: {
          type: "number",
          description: "Face value per unit (FIXED_INTEREST only)",
        },
        interest_rate: {
          type: "number",
          description: "Initial interest rate (FIXED_INTEREST only)",
        },
        income_type: {
          type: "string",
          description: "DIVIDEND or INTEREST (FIXED_INTEREST only)",
        },
        payment_frequency: {
          type: "string",
          description:
            "ON_MATURITY, YEARLY, TWICE_YEARLY, QUARTERLY, MONTHLY (FIXED_INTEREST only)",
        },
        first_payment_date: {
          type: "string",
          description: "First payment date YYYY-MM-DD (FIXED_INTEREST only)",
        },
        maturity_date: {
          type: "string",
          description: "Maturity date YYYY-MM-DD (FIXED_INTEREST only)",
        },
        auto_calc_income: {
          type: "boolean",
          description: "Auto-populate income payments (FIXED_INTEREST only)",
        },
      },
      required: ["code", "name", "country_code", "investment_type"],
    },
  },
  {
    name: "update_custom_investment",
    description: "Updates an existing custom investment",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The custom investment ID",
        },
        code: {
          type: "string",
          description: "The investment code",
        },
        name: {
          type: "string",
          description: "The name of the custom investment",
        },
        portfolio_id: {
          type: "number",
          description: "Portfolio ID to associate with",
        },
        face_value: {
          type: "number",
          description: "Face value per unit",
        },
        interest_rate: {
          type: "number",
          description: "Interest rate",
        },
        income_type: {
          type: "string",
          description: "DIVIDEND or INTEREST",
        },
        payment_frequency: {
          type: "string",
          description: "Payment frequency",
        },
        first_payment_date: {
          type: "string",
          description: "First payment date YYYY-MM-DD",
        },
        maturity_date: {
          type: "string",
          description: "Maturity date YYYY-MM-DD",
        },
        auto_calc_income: {
          type: "boolean",
          description: "Auto-populate income payments",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_custom_investment",
    description: "Deletes a custom investment",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The custom investment ID to delete",
        },
      },
      required: ["id"],
    },
  },

  // ==================== Custom Investment Prices ====================
  {
    name: "list_custom_investment_prices",
    description: "Retrieves prices for a custom investment",
    inputSchema: {
      type: "object",
      properties: {
        custom_investment_id: {
          type: "number",
          description: "The custom investment ID",
        },
        start_date: {
          type: "string",
          description: "Start date YYYY-MM-DD",
        },
        end_date: {
          type: "string",
          description: "End date YYYY-MM-DD",
        },
        page: {
          type: "string",
          description: "Pagination pointer",
        },
        per_page: {
          type: "number",
          description: "Items per page (max 100)",
        },
      },
      required: ["custom_investment_id"],
    },
  },
  {
    name: "create_custom_investment_price",
    description: "Creates a price entry for a custom investment",
    inputSchema: {
      type: "object",
      properties: {
        custom_investment_id: {
          type: "number",
          description: "The custom investment ID",
        },
        last_traded_price: {
          type: "number",
          description: "The price in instrument currency",
        },
        last_traded_on: {
          type: "string",
          description: "The date YYYY-MM-DD",
        },
      },
      required: ["custom_investment_id", "last_traded_price", "last_traded_on"],
    },
  },
  {
    name: "update_custom_investment_price",
    description: "Updates a price for a custom investment",
    inputSchema: {
      type: "object",
      properties: {
        price_id: {
          type: "number",
          description: "The price ID",
        },
        last_traded_price: {
          type: "number",
          description: "The price in instrument currency",
        },
        last_traded_on: {
          type: "string",
          description: "The date YYYY-MM-DD",
        },
      },
      required: ["price_id"],
    },
  },
  {
    name: "delete_custom_investment_price",
    description: "Deletes a price for a custom investment",
    inputSchema: {
      type: "object",
      properties: {
        price_id: {
          type: "number",
          description: "The price ID to delete",
        },
      },
      required: ["price_id"],
    },
  },

  // ==================== Coupon Rates ====================
  {
    name: "list_coupon_rates",
    description:
      "Retrieves coupon rates for a fixed interest custom investment",
    inputSchema: {
      type: "object",
      properties: {
        instrument_id: {
          type: "number",
          description: "The custom investment instrument ID",
        },
        start_date: {
          type: "string",
          description: "Start date YYYY-MM-DD",
        },
        end_date: {
          type: "string",
          description: "End date YYYY-MM-DD",
        },
        page: {
          type: "string",
          description: "Pagination pointer",
        },
        per_page: {
          type: "number",
          description: "Items per page (max 100)",
        },
      },
      required: ["instrument_id"],
    },
  },
  {
    name: "create_coupon_rate",
    description: "Creates a coupon rate for a custom investment",
    inputSchema: {
      type: "object",
      properties: {
        instrument_id: {
          type: "number",
          description: "The custom investment instrument ID",
        },
        interest_rate: {
          type: "number",
          description: "The interest rate as a percentage",
        },
        date: {
          type: "string",
          description: "The date from which the rate applies YYYY-MM-DD",
        },
      },
      required: ["instrument_id", "interest_rate", "date"],
    },
  },
  {
    name: "update_coupon_rate",
    description: "Updates a coupon rate",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The coupon rate ID",
        },
        interest_rate: {
          type: "number",
          description: "The interest rate as a percentage",
        },
        date: {
          type: "string",
          description: "The date from which the rate applies YYYY-MM-DD",
        },
      },
      required: ["id", "interest_rate", "date"],
    },
  },
  {
    name: "delete_coupon_rate",
    description: "Deletes a coupon rate",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "number",
          description: "The coupon rate ID to delete",
        },
      },
      required: ["id"],
    },
  },

  // ==================== Coupon Codes ====================
  {
    name: "show_coupon_code",
    description: "Returns the coupon code applied to the current user",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "apply_coupon_code",
    description: "Applies a coupon code to the current user",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The coupon code to apply",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "delete_coupon_code",
    description: "Removes the coupon code from the current user",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // ==================== Reports ====================
  {
    name: "get_performance_report",
    description:
      "Retrieves the performance report for a portfolio with gains, holdings breakdown, and benchmarks",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "The portfolio ID",
        },
        start_date: {
          type: "string",
          description: "Start date YYYY-MM-DD (defaults to portfolio inception)",
        },
        end_date: {
          type: "string",
          description: "End date YYYY-MM-DD (defaults to today)",
        },
        consolidated: {
          type: "boolean",
          description: "Set to true for consolidated portfolio views",
        },
        include_sales: {
          type: "boolean",
          description: "Include or exclude sales",
        },
        report_combined: {
          type: "boolean",
          description:
            "Receive combined totals for same instruments across portfolios",
        },
        grouping: {
          type: "string",
          description:
            "Group by: country, currency, custom_group, industry_classification, investment_type, market, portfolio, sector_classification, ungrouped",
        },
        custom_group_id: {
          type: "number",
          description: "Custom group ID (requires grouping=custom_group)",
        },
        include_limited: {
          type: "boolean",
          description: "Include holdings limited by user plan",
        },
        benchmark_code: {
          type: "string",
          description: "Benchmark code and market (e.g., SPY.NYSE)",
        },
      },
      required: ["portfolio_id"],
    },
  },
  {
    name: "get_performance_index_chart",
    description:
      "Returns performance index chart data points for visualizing portfolio performance over time",
    inputSchema: {
      type: "object",
      properties: {
        portfolio_id: {
          type: "number",
          description: "The portfolio ID",
        },
        consolidated: {
          type: "boolean",
          description: "True if consolidated view is requested",
        },
        start_date: {
          type: "string",
          description: "Start date YYYY-MM-DD (defaults to inception)",
        },
        end_date: {
          type: "string",
          description: "End date YYYY-MM-DD (defaults to today)",
        },
        grouping: {
          type: "string",
          description:
            "Group by: country, currency, custom_group, industry_classification, investment_type, market, portfolio, sector_classification, ungrouped",
        },
        custom_group_id: {
          type: "number",
          description: "Custom group ID (requires grouping=custom_group)",
        },
        benchmark_code: {
          type: "string",
          description: "Benchmark code and market (e.g., SPY.NYSE)",
        },
      },
      required: ["portfolio_id"],
    },
  },

  // ==================== Metadata ====================
  {
    name: "list_countries",
    description: "Retrieves Sharesight country definitions",
    inputSchema: {
      type: "object",
      properties: {
        supported: {
          type: "boolean",
          description: "Filter by supported status (omit for all)",
        },
      },
    },
  },

  // ==================== OAuth ====================
  {
    name: "revoke_api_access",
    description:
      "Disconnects API access for the user. Invalidates ALL access and refresh tokens.",
    inputSchema: {
      type: "object",
      properties: {
        client_id: {
          type: "string",
          description: "The client application ID",
        },
      },
      required: ["client_id"],
    },
  },
];

// Create server
const server = new Server(
  {
    name: "sharesight-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      // Portfolios
      case "list_portfolios":
        result = await client.listPortfolios(args as { consolidated?: boolean; instrument_id?: number });
        break;

      case "get_portfolio":
        result = await client.getPortfolio(
          (args as { portfolio_id: number }).portfolio_id,
          (args as { consolidated?: boolean }).consolidated
        );
        break;

      case "list_portfolio_holdings":
        result = await client.listPortfolioHoldings(
          (args as { portfolio_id: number }).portfolio_id,
          (args as { consolidated?: boolean }).consolidated
        );
        break;

      case "get_portfolio_user_setting":
        result = await client.showPortfolioUserSetting(
          (args as { portfolio_id: number }).portfolio_id,
          (args as { consolidated?: boolean }).consolidated
        );
        break;

      case "update_portfolio_user_setting": {
        const updateArgs = args as {
          portfolio_id: number;
          consolidated?: boolean;
          portfolio_chart?: string;
          holding_chart?: string;
          combined?: boolean;
          grouping?: string;
          include_sold_shares?: boolean;
        };
        const { portfolio_id, consolidated, ...settings } = updateArgs;
        result = await client.updatePortfolioUserSetting(
          portfolio_id,
          { portfolio_user_settings: settings },
          consolidated
        );
        break;
      }

      // Holdings
      case "list_holdings":
        result = await client.listHoldings();
        break;

      case "get_holding": {
        const holdingArgs = args as {
          holding_id: number;
          average_purchase_price?: boolean;
          cost_base?: boolean;
          values_over_time?: string;
        };
        result = await client.getHolding(holdingArgs.holding_id, {
          average_purchase_price: holdingArgs.average_purchase_price,
          cost_base: holdingArgs.cost_base,
          values_over_time: holdingArgs.values_over_time,
        });
        break;
      }

      case "update_holding": {
        const updateHoldingArgs = args as {
          holding_id: number;
          enable_drp?: boolean;
          drp_mode_setting?: string;
        };
        result = await client.updateHolding(updateHoldingArgs.holding_id, {
          enable_drp: updateHoldingArgs.enable_drp,
          drp_mode_setting: updateHoldingArgs.drp_mode_setting,
        });
        break;
      }

      case "delete_holding":
        result = await client.deleteHolding((args as { holding_id: number }).holding_id);
        break;

      // Custom Investments
      case "list_custom_investments":
        result = await client.listCustomInvestments(
          (args as { portfolio_id?: number }).portfolio_id
        );
        break;

      case "get_custom_investment":
        result = await client.getCustomInvestment((args as { id: number }).id);
        break;

      case "create_custom_investment": {
        const createArgs = args as {
          portfolio_id?: number;
          code: string;
          name: string;
          country_code: string;
          investment_type: string;
          face_value?: number;
          interest_rate?: number;
          income_type?: string;
          payment_frequency?: string;
          first_payment_date?: string;
          maturity_date?: string;
          auto_calc_income?: boolean;
        };
        result = await client.createCustomInvestment(createArgs);
        break;
      }

      case "update_custom_investment": {
        const updateCIArgs = args as {
          id: number;
          code?: string;
          name?: string;
          portfolio_id?: number;
          face_value?: number;
          interest_rate?: number;
          income_type?: string;
          payment_frequency?: string;
          first_payment_date?: string;
          maturity_date?: string;
          auto_calc_income?: boolean;
        };
        const { id, ...updateData } = updateCIArgs;
        result = await client.updateCustomInvestment(id, updateData);
        break;
      }

      case "delete_custom_investment":
        result = await client.deleteCustomInvestment((args as { id: number }).id);
        break;

      // Custom Investment Prices
      case "list_custom_investment_prices": {
        const pricesArgs = args as {
          custom_investment_id: number;
          start_date?: string;
          end_date?: string;
          page?: string;
          per_page?: number;
        };
        result = await client.listCustomInvestmentPrices(
          pricesArgs.custom_investment_id,
          {
            start_date: pricesArgs.start_date,
            end_date: pricesArgs.end_date,
            page: pricesArgs.page,
            per_page: pricesArgs.per_page,
          }
        );
        break;
      }

      case "create_custom_investment_price": {
        const createPriceArgs = args as {
          custom_investment_id: number;
          last_traded_price: number;
          last_traded_on: string;
        };
        result = await client.createCustomInvestmentPrice(
          createPriceArgs.custom_investment_id,
          {
            last_traded_price: createPriceArgs.last_traded_price,
            last_traded_on: createPriceArgs.last_traded_on,
          }
        );
        break;
      }

      case "update_custom_investment_price": {
        const updatePriceArgs = args as {
          price_id: number;
          last_traded_price?: number;
          last_traded_on?: string;
        };
        result = await client.updateCustomInvestmentPrice(
          updatePriceArgs.price_id,
          {
            last_traded_price: updatePriceArgs.last_traded_price,
            last_traded_on: updatePriceArgs.last_traded_on,
          }
        );
        break;
      }

      case "delete_custom_investment_price":
        result = await client.deleteCustomInvestmentPrice(
          (args as { price_id: number }).price_id
        );
        break;

      // Coupon Rates
      case "list_coupon_rates": {
        const ratesArgs = args as {
          instrument_id: number;
          start_date?: string;
          end_date?: string;
          page?: string;
          per_page?: number;
        };
        result = await client.listCouponRates(ratesArgs.instrument_id, {
          start_date: ratesArgs.start_date,
          end_date: ratesArgs.end_date,
          page: ratesArgs.page,
          per_page: ratesArgs.per_page,
        });
        break;
      }

      case "create_coupon_rate": {
        const createRateArgs = args as {
          instrument_id: number;
          interest_rate: number;
          date: string;
        };
        result = await client.createCouponRate(createRateArgs.instrument_id, {
          coupon_rate: {
            interest_rate: createRateArgs.interest_rate,
            date: createRateArgs.date,
          },
        });
        break;
      }

      case "update_coupon_rate": {
        const updateRateArgs = args as {
          id: number;
          interest_rate: number;
          date: string;
        };
        result = await client.updateCouponRate(updateRateArgs.id, {
          coupon_rate: {
            interest_rate: updateRateArgs.interest_rate,
            date: updateRateArgs.date,
          },
        });
        break;
      }

      case "delete_coupon_rate":
        result = await client.deleteCouponRate((args as { id: number }).id);
        break;

      // Coupon Codes
      case "show_coupon_code":
        result = await client.showCouponCode();
        break;

      case "apply_coupon_code":
        result = await client.applyCouponCode((args as { code: string }).code);
        break;

      case "delete_coupon_code":
        result = await client.deleteCouponCode();
        break;

      // Reports
      case "get_performance_report": {
        const reportArgs = args as {
          portfolio_id: number;
          start_date?: string;
          end_date?: string;
          consolidated?: boolean;
          include_sales?: boolean;
          report_combined?: boolean;
          grouping?: string;
          custom_group_id?: number;
          include_limited?: boolean;
          benchmark_code?: string;
        };
        result = await client.getPerformanceReport(reportArgs.portfolio_id, {
          start_date: reportArgs.start_date,
          end_date: reportArgs.end_date,
          consolidated: reportArgs.consolidated,
          include_sales: reportArgs.include_sales,
          report_combined: reportArgs.report_combined,
          grouping: reportArgs.grouping,
          custom_group_id: reportArgs.custom_group_id,
          include_limited: reportArgs.include_limited,
          benchmark_code: reportArgs.benchmark_code,
        });
        break;
      }

      case "get_performance_index_chart": {
        const chartArgs = args as {
          portfolio_id: number;
          consolidated?: boolean;
          start_date?: string;
          end_date?: string;
          grouping?: string;
          custom_group_id?: number;
          benchmark_code?: string;
        };
        result = await client.getPerformanceIndexChart(chartArgs.portfolio_id, {
          consolidated: chartArgs.consolidated,
          start_date: chartArgs.start_date,
          end_date: chartArgs.end_date,
          grouping: chartArgs.grouping,
          custom_group_id: chartArgs.custom_group_id,
          benchmark_code: chartArgs.benchmark_code,
        });
        break;
      }

      // Metadata
      case "list_countries":
        result = await client.listCountries(
          (args as { supported?: boolean }).supported
        );
        break;

      // OAuth
      case "revoke_api_access":
        result = await client.revokeApiAccess(
          (args as { client_id: string }).client_id
        );
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sharesight MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
