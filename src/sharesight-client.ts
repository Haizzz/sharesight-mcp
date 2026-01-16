/**
 * Sharesight API v3 Client
 *
 * This module provides a TypeScript client for interacting with the Sharesight API v3.
 * It handles authentication, request formatting, and response parsing.
 *
 * @see https://api.sharesight.com/doc/api/v3
 * @module sharesight-client
 */

import {
  CouponCodeResponse,
  CouponRatesResponse,
  CountriesResponse,
  CreateCouponRateRequest,
  CreateCustomInvestmentPriceRequest,
  CreateCustomInvestmentRequest,
  CustomInvestmentPricesResponse,
  CustomInvestmentsResponse,
  HoldingsResponse,
  PerformanceIndexChartResponse,
  PerformanceReportResponse,
  PortfoliosResponse,
  PortfolioUserSettingResponse,
  UpdateCouponRateRequest,
  UpdateCustomInvestmentPriceRequest,
  UpdateCustomInvestmentRequest,
  UpdateHoldingRequest,
  UpdatePortfolioUserSettingRequest,
  BaseResponse,
} from "./types.js";

/** Base URL for all Sharesight API v3 endpoints */
const API_BASE_URL = "https://api.sharesight.com/api/v3";

/**
 * SharesightClient provides methods for interacting with the Sharesight API v3.
 *
 * @example
 * ```typescript
 * const client = new SharesightClient(process.env.SHARESIGHT_ACCESS_TOKEN);
 * const portfolios = await client.listPortfolios();
 * console.log(portfolios.portfolios);
 * ```
 */
export class SharesightClient {
  /** OAuth2 access token for API authentication */
  private accessToken: string;

  /**
   * Creates a new SharesightClient instance.
   *
   * @param accessToken - OAuth2 access token obtained through Sharesight's OAuth flow
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Makes an authenticated HTTP request to the Sharesight API.
   *
   * @typeParam T - The expected response type
   * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param endpoint - API endpoint path (e.g., '/portfolios')
   * @param body - Optional request body for POST/PUT/PATCH requests
   * @param queryParams - Optional query parameters to append to the URL
   * @returns Promise resolving to the typed response
   * @throws Error if the API returns a non-2xx status code
   *
   * @internal
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // Append query parameters, filtering out undefined values
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Set required headers for Sharesight API
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for mutation requests
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { reason: errorText };
      }
      throw new Error(
        `Sharesight API error (${response.status}): ${errorData.reason || errorData.error || errorText}`
      );
    }

    return response.json() as Promise<T>;
  }

  // ==========================================================================
  // Coupon Codes
  // ==========================================================================

  /**
   * Applies a coupon code to the current user's account.
   *
   * @param code - The coupon code to apply
   * @returns Promise with the applied coupon code details
   * @throws Error if the coupon code is invalid or already applied
   *
   * @example
   * ```typescript
   * const result = await client.applyCouponCode('PROMO2024');
   * console.log(`Applied coupon: ${result.code}`);
   * ```
   */
  async applyCouponCode(code: string): Promise<CouponCodeResponse> {
    return this.request<CouponCodeResponse>("POST", "/coupon_code", { code });
  }

  /**
   * Removes the coupon code from the current user's account.
   *
   * @returns Promise with the API transaction details
   */
  async deleteCouponCode(): Promise<BaseResponse> {
    return this.request<BaseResponse>("DELETE", "/coupon_code");
  }

  /**
   * Retrieves the coupon code currently applied to the user's account.
   *
   * @returns Promise with the coupon code details, or empty if none applied
   */
  async showCouponCode(): Promise<CouponCodeResponse> {
    return this.request<CouponCodeResponse>("GET", "/coupon_code");
  }

  // ==========================================================================
  // Custom Investment Coupon Rates
  // ==========================================================================

  /**
   * Lists coupon rates for a fixed interest custom investment.
   *
   * @param instrumentId - The custom investment instrument ID
   * @param options - Optional filtering and pagination parameters
   * @param options.start_date - Filter rates from this date (YYYY-MM-DD)
   * @param options.end_date - Filter rates until this date (YYYY-MM-DD)
   * @param options.page - Pagination cursor from previous response
   * @param options.per_page - Items per page (default: 50, max: 100)
   * @returns Promise with the list of coupon rates
   */
  async listCouponRates(
    instrumentId: number,
    options?: {
      start_date?: string;
      end_date?: string;
      page?: string;
      per_page?: number;
    }
  ): Promise<CouponRatesResponse> {
    return this.request<CouponRatesResponse>(
      "GET",
      `/custom_investments/${instrumentId}/coupon_rates`,
      undefined,
      options
    );
  }

  /**
   * Creates a new coupon rate for a fixed interest custom investment.
   *
   * @param instrumentId - The custom investment instrument ID
   * @param data - The coupon rate data
   * @returns Promise with the created coupon rate
   */
  async createCouponRate(
    instrumentId: number,
    data: CreateCouponRateRequest
  ): Promise<CouponRatesResponse> {
    return this.request<CouponRatesResponse>(
      "POST",
      `/custom_investments/${instrumentId}/coupon_rates`,
      data
    );
  }

  /**
   * Updates an existing coupon rate.
   *
   * @param id - The coupon rate ID to update
   * @param data - The updated coupon rate data
   * @returns Promise with the updated coupon rate
   */
  async updateCouponRate(
    id: number,
    data: UpdateCouponRateRequest
  ): Promise<CouponRatesResponse> {
    return this.request<CouponRatesResponse>(
      "PUT",
      `/coupon_rates/${id}`,
      data
    );
  }

  /**
   * Deletes a coupon rate.
   *
   * @param id - The coupon rate ID to delete
   * @returns Promise with the API transaction details
   */
  async deleteCouponRate(id: number): Promise<BaseResponse> {
    return this.request<BaseResponse>("DELETE", `/coupon_rates/${id}`);
  }

  // ==========================================================================
  // Custom Investment Prices
  // ==========================================================================

  /**
   * Lists price history for a custom investment.
   *
   * @param customInvestmentId - The custom investment ID
   * @param options - Optional filtering and pagination parameters
   * @param options.start_date - Filter prices from this date (YYYY-MM-DD)
   * @param options.end_date - Filter prices until this date (YYYY-MM-DD)
   * @param options.page - Pagination cursor from previous response
   * @param options.per_page - Items per page (default: 50, max: 100)
   * @returns Promise with the list of prices
   */
  async listCustomInvestmentPrices(
    customInvestmentId: number,
    options?: {
      start_date?: string;
      end_date?: string;
      page?: string;
      per_page?: number;
    }
  ): Promise<CustomInvestmentPricesResponse> {
    return this.request<CustomInvestmentPricesResponse>(
      "GET",
      `/custom_investment/${customInvestmentId}/prices.json`,
      undefined,
      options
    );
  }

  /**
   * Creates a new price entry for a custom investment.
   *
   * @param customInvestmentId - The custom investment ID
   * @param data - The price data including price and date
   * @returns Promise with the created price entry
   *
   * @example
   * ```typescript
   * const price = await client.createCustomInvestmentPrice(123, {
   *   last_traded_price: 100.50,
   *   last_traded_on: '2024-01-15'
   * });
   * ```
   */
  async createCustomInvestmentPrice(
    customInvestmentId: number,
    data: CreateCustomInvestmentPriceRequest
  ): Promise<CustomInvestmentPricesResponse> {
    return this.request<CustomInvestmentPricesResponse>(
      "POST",
      `/custom_investment/${customInvestmentId}/prices.json`,
      data
    );
  }

  /**
   * Updates an existing price entry.
   *
   * @param priceId - The price entry ID to update
   * @param data - The updated price data
   * @returns Promise with the updated price entry
   */
  async updateCustomInvestmentPrice(
    priceId: number,
    data: UpdateCustomInvestmentPriceRequest
  ): Promise<CustomInvestmentPricesResponse> {
    return this.request<CustomInvestmentPricesResponse>(
      "PUT",
      `/prices/${priceId}.json`,
      data
    );
  }

  /**
   * Deletes a price entry.
   *
   * @param priceId - The price entry ID to delete
   * @returns Promise with the API transaction details
   */
  async deleteCustomInvestmentPrice(priceId: number): Promise<BaseResponse> {
    return this.request<BaseResponse>("DELETE", `/prices/${priceId}.json`);
  }

  // ==========================================================================
  // Custom Investments
  // ==========================================================================

  /**
   * Lists all custom investments, optionally filtered by portfolio.
   *
   * @param portfolioId - Optional portfolio ID to filter by
   * @returns Promise with the list of custom investments
   */
  async listCustomInvestments(
    portfolioId?: number
  ): Promise<CustomInvestmentsResponse> {
    return this.request<CustomInvestmentsResponse>(
      "GET",
      "/custom_investments",
      undefined,
      portfolioId ? { portfolio_id: portfolioId } : undefined
    );
  }

  /**
   * Retrieves a single custom investment by ID.
   *
   * @param id - The custom investment ID
   * @returns Promise with the custom investment details
   */
  async getCustomInvestment(id: number): Promise<CustomInvestmentsResponse> {
    return this.request<CustomInvestmentsResponse>(
      "GET",
      `/custom_investments/${id}`
    );
  }

  /**
   * Creates a new custom investment.
   *
   * @param data - The custom investment data
   * @returns Promise with the created custom investment
   *
   * @example
   * ```typescript
   * const investment = await client.createCustomInvestment({
   *   code: 'MYFUND',
   *   name: 'My Property Fund',
   *   country_code: 'AU',
   *   investment_type: 'MANAGED_FUND'
   * });
   * ```
   */
  async createCustomInvestment(
    data: CreateCustomInvestmentRequest
  ): Promise<CustomInvestmentsResponse> {
    return this.request<CustomInvestmentsResponse>(
      "POST",
      "/custom_investments",
      data
    );
  }

  /**
   * Updates an existing custom investment.
   *
   * @param id - The custom investment ID to update
   * @param data - The updated custom investment data
   * @returns Promise with the updated custom investment
   */
  async updateCustomInvestment(
    id: number,
    data: UpdateCustomInvestmentRequest
  ): Promise<CustomInvestmentsResponse> {
    return this.request<CustomInvestmentsResponse>(
      "PUT",
      `/custom_investments/${id}`,
      data
    );
  }

  /**
   * Deletes a custom investment.
   *
   * @param id - The custom investment ID to delete
   * @returns Promise with deletion confirmation
   */
  async deleteCustomInvestment(id: number): Promise<CustomInvestmentsResponse> {
    return this.request<CustomInvestmentsResponse>(
      "DELETE",
      `/custom_investments/${id}`
    );
  }

  // ==========================================================================
  // Holdings
  // ==========================================================================

  /**
   * Lists all holdings across all portfolios.
   *
   * @returns Promise with the list of holdings
   */
  async listHoldings(): Promise<HoldingsResponse> {
    return this.request<HoldingsResponse>("GET", "/holdings");
  }

  /**
   * Retrieves details of a specific holding.
   *
   * @param id - The holding ID
   * @param options - Optional parameters for additional data
   * @param options.average_purchase_price - Include average purchase price
   * @param options.cost_base - Include cost base information
   * @param options.values_over_time - Include historical values ('true' for inception, or date string)
   * @returns Promise with the holding details
   *
   * @example
   * ```typescript
   * const holding = await client.getHolding(12345, {
   *   average_purchase_price: true,
   *   cost_base: true,
   *   values_over_time: '2024-01-01'
   * });
   * ```
   */
  async getHolding(
    id: number,
    options?: {
      average_purchase_price?: boolean;
      cost_base?: boolean;
      values_over_time?: string | boolean;
    }
  ): Promise<HoldingsResponse> {
    return this.request<HoldingsResponse>(
      "GET",
      `/holdings/${id}`,
      undefined,
      options as Record<string, string | number | boolean | undefined>
    );
  }

  /**
   * Updates a holding's settings (currently supports DRP configuration).
   *
   * @param id - The holding ID to update
   * @param data - The update data (enable_drp, drp_mode_setting)
   * @param options - Optional parameters for response data
   * @returns Promise with the updated holding
   */
  async updateHolding(
    id: number,
    data: UpdateHoldingRequest,
    options?: {
      average_purchase_price?: boolean;
      cost_base?: boolean;
      values_over_time?: string | boolean;
    }
  ): Promise<HoldingsResponse> {
    return this.request<HoldingsResponse>(
      "PUT",
      `/holdings/${id}`,
      data,
      options as Record<string, string | number | boolean | undefined>
    );
  }

  /**
   * Deletes a holding.
   *
   * @param id - The holding ID to delete
   * @param options - Optional parameters
   * @returns Promise with the API transaction details
   */
  async deleteHolding(
    id: number,
    options?: {
      average_purchase_price?: boolean;
      cost_base?: boolean;
      values_over_time?: string | boolean;
    }
  ): Promise<BaseResponse> {
    return this.request<BaseResponse>(
      "DELETE",
      `/holdings/${id}`,
      undefined,
      options as Record<string, string | number | boolean | undefined>
    );
  }

  // ==========================================================================
  // Metadata / Countries
  // ==========================================================================

  /**
   * Lists Sharesight country definitions.
   *
   * @param supported - Optional filter for supported countries only
   * @returns Promise with the list of countries
   */
  async listCountries(supported?: boolean): Promise<CountriesResponse> {
    return this.request<CountriesResponse>(
      "GET",
      "/countries",
      undefined,
      supported !== undefined ? { supported } : undefined
    );
  }

  // ==========================================================================
  // Portfolios
  // ==========================================================================

  /**
   * Lists all portfolios accessible to the user.
   *
   * @param options - Optional filtering parameters
   * @param options.consolidated - Set to true for consolidated portfolio views
   * @param options.instrument_id - Filter portfolios containing this instrument
   * @returns Promise with the list of portfolios
   *
   * @example
   * ```typescript
   * // List all portfolios
   * const portfolios = await client.listPortfolios();
   *
   * // List consolidated views only
   * const consolidated = await client.listPortfolios({ consolidated: true });
   * ```
   */
  async listPortfolios(options?: {
    consolidated?: boolean;
    instrument_id?: number;
  }): Promise<PortfoliosResponse> {
    return this.request<PortfoliosResponse>(
      "GET",
      "/portfolios",
      undefined,
      options
    );
  }

  /**
   * Retrieves a single portfolio by ID.
   *
   * @param portfolioId - The portfolio ID
   * @param consolidated - Set to true if this is a consolidated portfolio
   * @returns Promise with the portfolio details
   */
  async getPortfolio(
    portfolioId: number,
    consolidated?: boolean
  ): Promise<PortfoliosResponse> {
    return this.request<PortfoliosResponse>(
      "GET",
      `/portfolios/${portfolioId}`,
      undefined,
      consolidated !== undefined ? { consolidated } : undefined
    );
  }

  /**
   * Lists all holdings in a specific portfolio.
   *
   * @param portfolioId - The portfolio ID
   * @param consolidated - Set to true for consolidated view
   * @returns Promise with the list of holdings
   */
  async listPortfolioHoldings(
    portfolioId: number,
    consolidated?: boolean
  ): Promise<HoldingsResponse> {
    return this.request<HoldingsResponse>(
      "GET",
      `/portfolios/${portfolioId}/holdings`,
      undefined,
      consolidated !== undefined ? { consolidated } : undefined
    );
  }

  /**
   * Retrieves user-specific settings for a portfolio.
   *
   * @param portfolioId - The portfolio ID
   * @param consolidated - Set to true for consolidated portfolio
   * @returns Promise with the user settings
   */
  async showPortfolioUserSetting(
    portfolioId: number,
    consolidated?: boolean
  ): Promise<PortfolioUserSettingResponse> {
    return this.request<PortfolioUserSettingResponse>(
      "GET",
      `/portfolios/${portfolioId}/user_setting`,
      undefined,
      consolidated !== undefined ? { consolidated } : undefined
    );
  }

  /**
   * Updates user-specific settings for a portfolio.
   *
   * @param portfolioId - The portfolio ID
   * @param data - The settings to update
   * @param consolidated - Set to true for consolidated portfolio
   * @returns Promise with the updated settings
   */
  async updatePortfolioUserSetting(
    portfolioId: number,
    data: UpdatePortfolioUserSettingRequest,
    consolidated?: boolean
  ): Promise<PortfolioUserSettingResponse> {
    return this.request<PortfolioUserSettingResponse>(
      "PUT",
      `/portfolios/${portfolioId}/user_setting`,
      data,
      consolidated !== undefined ? { consolidated } : undefined
    );
  }

  // ==========================================================================
  // Reports
  // ==========================================================================

  /**
   * Retrieves performance index chart data for visualizing portfolio performance.
   *
   * The chart data includes normalized values (starting at 10000 points) that can
   * be plotted over time to show portfolio growth.
   *
   * @param portfolioId - The portfolio ID
   * @param options - Optional chart parameters
   * @param options.consolidated - True for consolidated view
   * @param options.start_date - Chart start date (YYYY-MM-DD), defaults to inception
   * @param options.end_date - Chart end date (YYYY-MM-DD), defaults to today
   * @param options.grouping - Grouping for breakdown lines
   * @param options.custom_group_id - Custom group ID (requires grouping='custom_group')
   * @param options.benchmark_code - Benchmark code (e.g., 'SPY.NYSE')
   * @returns Promise with the chart data
   */
  async getPerformanceIndexChart(
    portfolioId: number,
    options?: {
      consolidated?: boolean;
      start_date?: string;
      end_date?: string;
      grouping?: string;
      custom_group_id?: number;
      benchmark_code?: string;
    }
  ): Promise<PerformanceIndexChartResponse> {
    return this.request<PerformanceIndexChartResponse>(
      "GET",
      `/portfolios/${portfolioId}/performance_index_chart`,
      undefined,
      options
    );
  }

  /**
   * Retrieves the performance report for a portfolio.
   *
   * The report includes capital gains, payout gains, currency gains, and total
   * gains broken down by holding and grouping.
   *
   * @param portfolioId - The portfolio ID
   * @param options - Optional report parameters
   * @param options.start_date - Report start date (YYYY-MM-DD), defaults to inception
   * @param options.end_date - Report end date (YYYY-MM-DD), defaults to today
   * @param options.consolidated - True for consolidated view
   * @param options.include_sales - Include sold holdings
   * @param options.report_combined - Combine same instruments across portfolios
   * @param options.labels - Filter by labels
   * @param options.grouping - Grouping for sub-totals
   * @param options.custom_group_id - Custom group ID (requires grouping='custom_group')
   * @param options.include_limited - Include holdings limited by subscription
   * @param options.benchmark_code - Benchmark code (e.g., 'SPY.NYSE')
   * @returns Promise with the performance report
   *
   * @example
   * ```typescript
   * const report = await client.getPerformanceReport(12345, {
   *   start_date: '2024-01-01',
   *   end_date: '2024-12-31',
   *   grouping: 'market',
   *   benchmark_code: 'SPY.NYSE'
   * });
   * console.log(`Total gain: ${report.report.total_gain_percent}%`);
   * ```
   */
  async getPerformanceReport(
    portfolioId: number,
    options?: {
      start_date?: string;
      end_date?: string;
      consolidated?: boolean;
      include_sales?: boolean;
      report_combined?: boolean;
      labels?: string[];
      grouping?: string;
      custom_group_id?: number;
      include_limited?: boolean;
      benchmark_code?: string;
    }
  ): Promise<PerformanceReportResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      ...options,
    };

    // Labels array needs special handling (not supported in simple query params)
    if (options?.labels) {
      delete queryParams.labels;
    }

    return this.request<PerformanceReportResponse>(
      "GET",
      `/portfolios/${portfolioId}/performance`,
      undefined,
      queryParams
    );
  }

  // ==========================================================================
  // User / OAuth
  // ==========================================================================

  /**
   * Revokes all API access tokens for the user.
   *
   * This invalidates ALL access and refresh tokens for the user associated
   * with the client application. Use this when a customer disconnects their
   * account from your system.
   *
   * @param clientId - The OAuth client application ID
   * @returns Promise with the API transaction details
   *
   * @warning This action cannot be undone. The user will need to re-authenticate.
   */
  async revokeApiAccess(clientId: string): Promise<BaseResponse> {
    return this.request<BaseResponse>("POST", "/oauth/revoke", {
      client_id: clientId,
    });
  }
}
