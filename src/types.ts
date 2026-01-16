/**
 * Sharesight API v3 Types
 *
 * This module contains TypeScript interfaces for all Sharesight API v3
 * request and response types. These types are based on the official
 * Sharesight API documentation.
 *
 * @see https://api.sharesight.com/doc/api/v3
 * @module types
 */

// ============================================================================
// Common Types
// ============================================================================

/**
 * API transaction metadata included in every response.
 * Contains information about the API call for debugging and tracking.
 */
export interface ApiTransaction {
  /** The unique API Transaction id */
  id: number;
  /** The API version called */
  version: number;
  /** The path executed */
  action: string;
  /** When the transaction was executed (ISO 8601) */
  timestamp: string;
}

/**
 * HATEOAS links included in API responses for navigation.
 */
export interface Links {
  /** URL to the current resource */
  self?: string;
  /** URL to the associated portfolio */
  portfolio?: string;
}

/**
 * Currency information used throughout the API.
 */
export interface Currency {
  /** The 3-letter ISO 4217 currency code (e.g., AUD, NZD, USD) */
  code: string;
  /** The unique Sharesight identifier for this currency */
  id: number;
  /** The symbol for this currency (e.g., $, ¥, £) */
  symbol: string;
  /** Qualified currency symbol when the symbol is not specific enough (e.g., 'US$', 'AU$') */
  qualified_symbol: string;
}

/**
 * Pagination information for paginated responses.
 */
export interface Pagination {
  /** Pointer to the next page/set of items (base64 encoded cursor) */
  page?: string;
  /** Items returned per page (default: 50, max: 100) */
  per_page?: number;
}

// ============================================================================
// Portfolio Types
// ============================================================================

/**
 * Portfolio represents an investment portfolio in Sharesight.
 * A portfolio contains holdings and is associated with a specific country and currency.
 */
export interface Portfolio {
  /** The unique id identifying the portfolio */
  id: number;
  /** Whether this is a consolidated view portfolio */
  consolidated: boolean;
  /** The name of the portfolio */
  name: string;
  /** External identifier used by professionals to identify the tax entity owner */
  external_identifier?: string;
  /** The id of the holding in this portfolio (when queried by instrument) */
  holding_id?: number;
  /** The timezone name applicable to the portfolio country */
  tz_name?: string;
  /** Default sale allocation method for Australian portfolios (fifo, lifo, maximise_cr, minimise_cr, ss_minimise, average, default) */
  default_sale_allocation_method?: string;
  /** The CGT discount rate for Australian portfolios */
  cg_discount?: string | null;
  /** The end of the financial year (MM-DD) */
  financial_year_end?: string;
  /** The interest method: 'simple' or 'compound' */
  interest_method?: string;
  /** The ISO country code of the (tax) country of this portfolio */
  country_code?: string;
  /** The ISO currency code of this portfolio */
  currency_code?: string;
  /** The date the portfolio was started on */
  inception_date?: string;
  /** Current user's access level (OWNER, STAFF, ADMIN, EDIT, READ) */
  access_level?: string;
  /** The unique identifier of the portfolio owner */
  user_id?: number;
  /** The name of the portfolio owner */
  owner_name?: string;
  /** For NZ portfolios, the rate of resident withholding tax */
  rwtr_rate?: number;
  /** For NZ portfolios, true if the owner is taxed as a trader */
  trader?: boolean;
  /** If set, automatic transactions are not applied to holdings */
  disable_automatic_transactions?: boolean;
  /** For Canadian portfolios: non_registered, rrsp, rrif, tfsa */
  tax_entity_type?: string;
  /** Cash account ID for trade sync */
  trade_sync_cash_account_id?: number | null;
  /** Cash account ID for payout sync */
  payout_sync_cash_account_id?: number | null;
}

/**
 * User-specific settings for a portfolio view.
 * These settings are persisted per-user and control display preferences.
 */
export interface PortfolioUserSetting {
  /** Chart type for portfolio: VALUE, VALUELINE, GROWTH, BENCHMARK, HIDE */
  portfolio_chart?: string;
  /** Chart type for holdings: PRICE, HOLDING_VALUE, BENCHMARK, HIDE */
  holding_chart?: string;
  /** True to combine holdings in consolidated portfolios */
  combined?: boolean;
  /** True to combine holdings in reports for consolidated portfolios */
  report_combined?: boolean;
  /** Grouping to use (market, country, currency, etc.) */
  grouping?: string;
  /** Grouping to use for reports */
  report_grouping?: string;
  /** Currency to use for reports */
  report_currency?: string;
  /** True to include sold shares in calculations */
  include_sold_shares?: boolean;
  /** True to include sold shares in reports */
  report_include_sold_shares?: boolean;
  /** Instrument ID for benchmark comparison */
  benchmark_instrument_id?: string | null;
  /** True to show comments on taxable income report */
  taxable_show_comments?: boolean;
  /** True to show holding totals on taxable income report */
  taxable_grouped_by_holding?: boolean;
  /** Time range for portfolio chart */
  portfolio_chart_range?: string;
  /** Time range for holding chart */
  holding_chart_range?: string;
  /** True to show overview values as percentages */
  overview_show_as_percentage?: boolean;
  /** Array of overview table column visibility settings */
  overview_table_columns?: Array<{ value: string; visible: boolean }>;
  /** Column to sort the overview table by */
  overview_sort_column?: string;
  /** Direction to sort: 'asc' or 'desc' */
  overview_sort_direction?: string;
}

// ============================================================================
// Instrument Types
// ============================================================================

/**
 * Logo URLs for an instrument (light and dark mode variants).
 */
export interface InstrumentLogo {
  /** URL for logo in light mode, or null if not available */
  light_url: string | null;
  /** URL for logo in dark mode, or null if not available */
  dark_url: string | null;
}

/**
 * Instrument represents a tradeable security (stock, ETF, crypto, etc.).
 */
export interface Instrument {
  /** The Sharesight code for the instrument (e.g., AAPL, BTC) */
  code: string;
  /** The Sharesight country identifier associated with this instrument */
  country_id: number;
  /** Whether this instrument is a cryptocurrency */
  crypto: boolean;
  /** The ISO currency code associated with this instrument */
  currency_code: string;
  /** The date the instrument expires (for options, warrants, etc.) */
  expires_on: string | null;
  /** Whether this instrument is currently expired */
  expired: boolean;
  /** The unique Sharesight identifier for this instrument */
  id: number;
  /** The code of the market the instrument is listed on (e.g., NASDAQ, ASX) */
  market_code: string;
  /** The name of the instrument */
  name: string;
  /** List of denominations supported by this instrument */
  supported_denominations: object | null;
  /** The timezone name associated with this instrument */
  tz_name: string;
  /** FactSet industry classification (can be overridden at holding level) */
  industry_classification_name?: string;
  /** FactSet sector classification (can be overridden at holding level) */
  sector_classification_name?: string;
  /** Human-readable investment type description */
  friendly_instrument_description?: string;
  /** Investment type code (e.g., ordinary_shares) */
  friendly_instrument_description_code?: string;
  /** Logo URLs for the instrument */
  logo?: InstrumentLogo;
}

// ============================================================================
// Holding Types
// ============================================================================

/**
 * File attachment associated with a holding.
 */
export interface Attachment {
  /** The ID of this attachment */
  id: number;
  /** The type: 'DOCUMENT' or 'CONTRACT_NOTE' */
  type: string;
  /** The file name including extension */
  file_name: string;
  /** The size of the file in bytes */
  file_size: number;
  /** The MIME type of the attached file */
  content_type: string;
  /** When the attachment was created (ISO 8601) */
  created_at: string;
}

/**
 * Document associated with a holding (deprecated, use Attachment).
 */
export interface Document {
  /** The unique id of this document */
  id: number;
  /** The name of the document */
  file_name: string;
  /** The MIME type of the document */
  content_type: string;
  /** The size of the document in bytes */
  file_size: number;
  /** When the document was created (ISO 8601) */
  created_at: string;
}

/**
 * Label for categorizing holdings.
 */
export interface Label {
  /** The unique id of the label */
  id: number;
  /** The name of the label */
  name: string;
  /** The label color (HTML color name) */
  color: string;
  /** Array of holding ids assigned to this label */
  holding_ids: number[];
  /** Array of portfolio ids assigned to this label */
  portfolio_ids: number[];
}

/**
 * Cost base information for a holding.
 */
export interface CostBase {
  /** The holding's cost base total value (in instrument currency) */
  total_value: number;
  /** The holding's cost base value per share (in instrument currency) */
  value_per_share: number;
}

/**
 * A single data point for values over time.
 */
export interface ValueOverTime {
  /** Price timestamp (ISO 8601) */
  timestamp: string;
  /** Price value */
  value: number;
}

/**
 * Holding represents a position in an instrument within a portfolio.
 */
export interface Holding {
  /** The unique id of this holding */
  id: number;
  /** The DRP setting (deprecated, use drp_mode_setting) */
  drp_setting?: string;
  /** DRP mode: up, down, half, down_track */
  drp_mode_setting?: string;
  /** The payout type for the holding */
  payout_type?: string;
  /** True if foreign tax credits are supported */
  foreign_tax_credits_supported?: boolean;
  /** True if payments are classed as trust income (AU only) */
  trust_income?: boolean;
  /** The instrument details */
  instrument: Instrument;
  /** The currency of the instrument */
  instrument_currency: Currency;
  /** The currency for payouts */
  payout_currency?: Currency;
  /** The instrument code (deprecated alias for instrument.code) */
  symbol: string;
  /** True if the holding has a valid position */
  valid_position: boolean;
  /** The portfolio containing this holding */
  portfolio: Portfolio;
  /** Documents associated with this holding (deprecated) */
  documents?: Document[];
  /** Attachments associated with this holding */
  attachments?: Attachment[];
  /** The date the holding was started */
  inception_date?: string;
  /** Average purchase price (in instrument currency) */
  average_purchase_price?: number;
  /** Cost base information */
  cost_base?: CostBase;
  /** Historical values over time */
  values_over_time?: ValueOverTime[];
  /** Labels assigned to this holding */
  labels?: Label[];
  /** The group id this holding belongs to */
  group_id?: number;
  /** The group name this holding belongs to */
  group_name?: string;
  /** Number of shares/units held */
  quantity?: number;
  /** Current value of the holding */
  value?: number;
  /** Current instrument price */
  instrument_price?: number;
  /** Capital gain amount */
  capital_gain?: number;
  /** Capital gain percentage */
  capital_gain_percent?: number;
  /** Payout/dividend gain amount */
  payout_gain?: number;
  /** Payout gain percentage */
  payout_gain_percent?: number;
  /** Currency gain amount */
  currency_gain?: number;
  /** Currency gain percentage */
  currency_gain_percent?: number;
  /** Total gain amount */
  total_gain?: number;
  /** Total gain percentage */
  total_gain_percent?: number;
  /** Number of unconfirmed transactions */
  number_of_unconfirmed_transactions?: number;
  /** True if limited by subscription restrictions */
  limited?: boolean;
}

// ============================================================================
// Custom Investment Types
// ============================================================================

/**
 * Custom Investment allows tracking of unlisted or custom securities.
 */
export interface CustomInvestment {
  /** The ID of this custom investment */
  id: number;
  /** The portfolio ID this investment is associated with */
  portfolio_id?: number;
  /** The portfolio details */
  portfolio?: Portfolio;
  /** The investment code */
  code: string;
  /** Market code (always 'OTHER' for custom investments) */
  market_code: string;
  /** The name of the custom investment */
  name: string;
  /** The country code (e.g., AU, NZ, US) */
  country_code: string;
  /** The internal country id */
  country_id: number;
  /** The ISO currency code */
  currency_code: string;
  /** Investment type (ORDINARY, FIXED_INTEREST, etc.) */
  investment_type: string;
  /** The timezone for the investment */
  tz_name: string;
  /** Face value per unit (FIXED_INTEREST only) */
  face_value?: number;
  /** Interest rate (FIXED_INTEREST only) */
  interest_rate?: number;
  /** Income type: DIVIDEND or INTEREST (FIXED_INTEREST only) */
  income_type?: string;
  /** Payment frequency (FIXED_INTEREST only) */
  payment_frequency?: string;
  /** First payment date YYYY-MM-DD (FIXED_INTEREST only) */
  first_payment_date?: string;
  /** Maturity date YYYY-MM-DD (FIXED_INTEREST only) */
  maturity_date?: string;
  /** Auto-calculate income payments (FIXED_INTEREST only) */
  auto_calc_income?: boolean;
}

/**
 * Coupon rate for fixed interest custom investments.
 */
export interface CouponRate {
  /** Identifier of the coupon rate */
  id: number;
  /** The interest rate as a percentage */
  interest_rate: number;
  /** The date from which the rate applies (YYYY-MM-DD) */
  date: string;
}

/**
 * Price entry for a custom investment.
 */
export interface CustomInvestmentPrice {
  /** Identifier for the price */
  id: number;
  /** The price in instrument currency (camelCase variant) */
  lastTradedPrice?: number;
  /** The price in instrument currency (snake_case variant) */
  last_traded_price?: number;
  /** The date of the price (camelCase variant) */
  lastTradedOn?: string;
  /** The date of the price (snake_case variant) */
  last_traded_on?: string;
  /** The datetime of the price (camelCase variant) */
  lastTradedAt?: string;
  /** The datetime of the price (snake_case variant) */
  last_traded_at?: string;
  /** The custom investment ID */
  custom_investment_id?: number;
}

// ============================================================================
// Country / Metadata Types
// ============================================================================

/**
 * Country definition in Sharesight.
 */
export interface Country {
  /** The ISO country code */
  code: string;
  /** Sharesight country identifier */
  id: number;
  /** Sharesight naming of this country */
  name: string;
  /** Sharesight associated currency identifier */
  currency_id: number;
  /** Abbreviated name of final month of financial year (e.g., dec, jun, mar) */
  financial_year_end: string;
  /** Whether Sharesight fully supports this country */
  supported: boolean;
  /** The primary timezone for this country */
  tz_name: string;
}

// ============================================================================
// Report Types
// ============================================================================

/**
 * A line on a performance chart.
 */
export interface ChartLine {
  /** Label describing the chart line (portfolio or group name) */
  label: string;
  /** The type of line: PORTFOLIO, GROUP, or BENCHMARK */
  line_type?: string;
  /** Alternative type field */
  type?: string;
  /** Array of values to plot (normalized to 10000pts starting value) */
  values: number[];
}

/**
 * Performance index chart data for visualizing portfolio performance.
 */
export interface PerformanceIndexChart {
  /** Unique id identifying this chart */
  id: string;
  /** The portfolio id */
  portfolio_id: number;
  /** The portfolio timezone name */
  portfolio_tz_name: string;
  /** Start date (YYYY-MM-DD) */
  start_date: string;
  /** End date (YYYY-MM-DD) */
  end_date: string;
  /** Whether this is a consolidated view */
  consolidated: boolean;
  /** The grouping used for this chart */
  grouping?: string;
  /** Array of dates for the X axis (YYYY-MM-DD) */
  dates: string[];
  /** Array of chart lines to plot */
  lines: ChartLine[];
}

/**
 * Benchmark comparison data.
 */
export interface Benchmark {
  /** The benchmark code */
  code: string;
  /** The benchmark market code */
  market_code: string;
  /** The benchmark name */
  name: string;
  /** Capital gain percentage */
  capital_gain_percentage: number;
  /** Dividend gain percentage */
  dividend_gain_percentage: number;
  /** Currency gain percentage */
  currency_gain_percentage: number;
  /** Total gain percentage */
  total_gain_percentage: number;
  /** True when percentages are annualized */
  percentages_annualised: boolean;
}

/**
 * Sub-total for a group in performance reports.
 */
export interface SubTotal {
  /** The total value of holdings in this group */
  value: number;
  /** The group id */
  group_id: number;
  /** The group name */
  group_name: string;
  /** Capital gain amount */
  capital_gain: number;
  /** Capital gain percentage */
  capital_gain_percent: number;
  /** Payout gain amount */
  payout_gain: number;
  /** Payout gain percentage */
  payout_gain_percent: number;
  /** Currency gain amount */
  currency_gain: number;
  /** Currency gain percentage */
  currency_gain_percent: number;
  /** Total gain amount */
  total_gain: number;
  /** Total gain percentage */
  total_gain_percent: number;
}

/**
 * Cash account in a portfolio.
 */
export interface CashAccount {
  /** Id of this cash account */
  id: number;
  /** A unique key for each cash account */
  key: string;
  /** The name of the cash account */
  name: string;
  /** The source provider (null for manual, 'xero', 'macquarie', etc.) */
  source: string | null;
  /** The value of the cash account */
  value: number;
  /** The currency of the cash account */
  currency: Currency;
  /** The portfolio containing this cash account */
  portfolio: Portfolio;
}

/**
 * Custom group for organizing holdings.
 */
export interface CustomGroup {
  /** The unique id of the custom group */
  id: number;
  /** The name of the custom group */
  name: string;
}

/**
 * Performance report data for a portfolio.
 */
export interface PerformanceReport {
  /** Unique id identifying this report instance */
  id: string;
  /** The portfolio id */
  portfolio_id: number;
  /** The portfolio timezone name */
  portfolio_tz_name: string;
  /** Total portfolio value */
  value: number;
  /** The grouping used for this report */
  grouping: string;
  /** The portfolio currency */
  currency: Currency;
  /** Start date (YYYY-MM-DD) */
  start_date: string;
  /** End date (YYYY-MM-DD) */
  end_date: string;
  /** Whether sales are included */
  include_sales: boolean;
  /** Capital gain amount */
  capital_gain: number;
  /** Capital gain percentage */
  capital_gain_percent: number;
  /** Payout gain amount */
  payout_gain: number;
  /** Payout gain percentage */
  payout_gain_percent: number;
  /** Currency gain amount */
  currency_gain: number;
  /** Currency gain percentage */
  currency_gain_percent: number;
  /** Total gain amount */
  total_gain: number;
  /** Total gain percentage */
  total_gain_percent: number;
  /** True when percentages are annualized */
  percentages_annualised: boolean;
  /** List of holdings in the report */
  holdings: Holding[];
  /** Sub-totals for each group */
  sub_totals: SubTotal[];
  /** Combined holdings (when report_combined=true) */
  combined_holdings?: Holding[];
  /** Cash accounts in the portfolio */
  cash_accounts: CashAccount[];
  /** The custom group used (if custom grouping) */
  custom_group?: CustomGroup;
  /** Benchmark comparison data */
  benchmark?: Benchmark;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Base response structure included in all API responses.
 */
export interface BaseResponse {
  /** API transaction metadata */
  api_transaction: ApiTransaction;
  /** HATEOAS navigation links */
  links?: Links;
}

/**
 * Response for coupon code operations.
 */
export interface CouponCodeResponse extends BaseResponse {
  /** The coupon code applied to the user */
  code?: string;
  /** True if this coupon is only enabled for API use */
  api_only?: boolean;
}

/**
 * Response for coupon rate operations.
 */
export interface CouponRatesResponse extends BaseResponse {
  /** List of coupon rates (for list operations) */
  coupon_rates?: CouponRate[];
  /** Single coupon rate (for get/create/update operations) */
  coupon_rate?: CouponRate;
  /** Pagination information */
  pagination?: Pagination;
}

/**
 * Response for custom investment price operations.
 */
export interface CustomInvestmentPricesResponse extends BaseResponse {
  /** The custom investment ID */
  id?: number;
  /** List of prices (for list operations) */
  prices?: CustomInvestmentPrice[];
  /** Pagination information */
  pagination?: Pagination;
  /** The custom investment ID (alternative field) */
  custom_investment_id?: number;
  /** The last traded price */
  last_traded_price?: number;
  /** The last traded date */
  last_traded_on?: string;
  /** The last traded datetime */
  last_traded_at?: string;
}

/**
 * Response for custom investment operations.
 */
export interface CustomInvestmentsResponse extends BaseResponse {
  /** List of custom investments (for list operations) */
  custom_investments?: CustomInvestment[];
  /** Single custom investment (for get/create/update operations) */
  custom_investment?: CustomInvestment;
  /** True if the record was deleted */
  deleted?: boolean;
}

/**
 * Response for holding operations.
 */
export interface HoldingsResponse extends BaseResponse {
  /** List of holdings (for list operations) */
  holdings?: Holding[];
  /** Single holding (for get/update operations) */
  holding?: Holding;
}

/**
 * Response for country list operations.
 */
export interface CountriesResponse extends BaseResponse {
  /** List of country definitions */
  countries: Country[];
}

/**
 * Response for portfolio operations.
 */
export interface PortfoliosResponse extends BaseResponse {
  /** List of portfolios (for list operations) */
  portfolios?: Portfolio[];
  /** Single portfolio (for get operations) */
  portfolio?: Portfolio;
}

/**
 * Response for portfolio user setting operations.
 */
export interface PortfolioUserSettingResponse extends BaseResponse {
  /** The portfolio user settings */
  portfolio_user_setting: PortfolioUserSetting;
}

/**
 * Response for performance index chart operations.
 */
export interface PerformanceIndexChartResponse extends BaseResponse {
  /** The performance index chart data */
  performance_index_chart?: PerformanceIndexChart;
  /** Chart ID (alternative field) */
  id?: string;
  /** Portfolio ID (alternative field) */
  portfolio_id?: number;
  /** Portfolio timezone (alternative field) */
  portfolio_tz_name?: string;
  /** Chart dates (alternative field) */
  dates?: string[];
  /** Chart lines (alternative field) */
  lines?: ChartLine[];
}

/**
 * Response for performance report operations.
 */
export interface PerformanceReportResponse extends BaseResponse {
  /** The performance report data */
  report: PerformanceReport;
}

/**
 * Error response structure for API errors.
 */
export interface ErrorResponse {
  /** Internal error code */
  error?: string;
  /** Detailed error message */
  reason?: string;
  /** Unique identifier for this API transaction */
  transaction_id?: number;
  /** Object of fields with error messages (for validation errors) */
  errors?: Record<string, string[]>;
  /** Alternative reason field (OAuth errors) */
  Reason?: string;
}

// ============================================================================
// Request Types
// ============================================================================

/**
 * Request body for creating a custom investment.
 */
export interface CreateCustomInvestmentRequest {
  /** Portfolio ID (optional, links to owner if not provided) */
  portfolio_id?: number;
  /** The investment code */
  code: string;
  /** The name of the custom investment */
  name: string;
  /** Country code (e.g., AU, NZ, US) */
  country_code: string;
  /** Investment type: ORDINARY, WARRANT, SHAREFUND, PROPFUND, PREFERENCE, STAPLEDSEC, OPTIONS, RIGHTS, MANAGED_FUND, FIXED_INTEREST, PIE */
  investment_type: string;
  /** Face value per unit (FIXED_INTEREST only) */
  face_value?: number;
  /** Initial interest rate (FIXED_INTEREST only) */
  interest_rate?: number;
  /** Income type: DIVIDEND or INTEREST (FIXED_INTEREST only) */
  income_type?: string;
  /** Payment frequency: ON_MATURITY, YEARLY, TWICE_YEARLY, QUARTERLY, MONTHLY (FIXED_INTEREST only) */
  payment_frequency?: string;
  /** First payment date YYYY-MM-DD (FIXED_INTEREST only) */
  first_payment_date?: string;
  /** Maturity date YYYY-MM-DD (FIXED_INTEREST only) */
  maturity_date?: string;
  /** Auto-calculate income payments (FIXED_INTEREST only) */
  auto_calc_income?: boolean;
}

/**
 * Request body for updating a custom investment.
 */
export interface UpdateCustomInvestmentRequest {
  /** The investment code */
  code?: string;
  /** The name of the custom investment */
  name?: string;
  /** Portfolio ID to associate with */
  portfolio_id?: number;
  /** Face value per unit */
  face_value?: number;
  /** Interest rate */
  interest_rate?: number;
  /** Income type: DIVIDEND or INTEREST */
  income_type?: string;
  /** Payment frequency */
  payment_frequency?: string;
  /** First payment date YYYY-MM-DD */
  first_payment_date?: string;
  /** Maturity date YYYY-MM-DD */
  maturity_date?: string;
  /** Auto-calculate income payments */
  auto_calc_income?: boolean;
}

/**
 * Request body for creating a coupon rate.
 */
export interface CreateCouponRateRequest {
  coupon_rate: {
    /** The interest rate as a percentage */
    interest_rate: number;
    /** The date from which the rate applies (YYYY-MM-DD) */
    date: string;
  };
}

/**
 * Request body for updating a coupon rate.
 */
export interface UpdateCouponRateRequest {
  coupon_rate: {
    /** The interest rate as a percentage */
    interest_rate: number;
    /** The date from which the rate applies (YYYY-MM-DD) */
    date: string;
  };
}

/**
 * Request body for creating a custom investment price.
 */
export interface CreateCustomInvestmentPriceRequest {
  /** The price in instrument currency */
  last_traded_price: number;
  /** The date of the price (YYYY-MM-DD) */
  last_traded_on: string;
}

/**
 * Request body for updating a custom investment price.
 */
export interface UpdateCustomInvestmentPriceRequest {
  /** The price in instrument currency */
  last_traded_price?: number;
  /** The date of the price (YYYY-MM-DD) */
  last_traded_on?: string;
}

/**
 * Request body for updating a holding.
 */
export interface UpdateHoldingRequest {
  /** Set to true to enable DRP, false to disable */
  enable_drp?: boolean;
  /** DRP mode: up, down, half, down_track */
  drp_mode_setting?: string;
}

/**
 * Request body for updating portfolio user settings.
 */
export interface UpdatePortfolioUserSettingRequest {
  /** The settings to update */
  portfolio_user_settings: Partial<PortfolioUserSetting>;
}
