# GA4 Web Vitals Report (Weekly Mobile Trends)

This site sends a `web_vitals` event from `index.html` with these params:

- `metric_name` (`CLS`, `INP`, `LCP`, `FCP`, `TTFB`)
- `metric_value` (numeric value)
- `metric_id`
- `metric_rating` (`good`, `needs-improvement`, `poor`)
- `page_path`
- `device_type` (`mobile` or `desktop`)
- `network_type` (for example `4g`, `3g`)

## 1) Create Custom Definitions In GA4

GA4 path: `Admin` -> `Custom definitions` -> `Create custom dimensions/metrics`

Create these Event-scoped custom dimensions:

1. `WV Metric Name` -> parameter: `metric_name`
2. `WV Metric Rating` -> parameter: `metric_rating`
3. `WV Device Type` -> parameter: `device_type`
4. `WV Network Type` -> parameter: `network_type`
5. `WV Page Path` -> parameter: `page_path`

Create this custom metric:

1. `WV Metric Value` -> parameter: `metric_value` (Unit: Standard)

Note: GA4 custom definitions are not retroactive. Data appears after creation.

## 2) Build A Weekly Mobile Report (Exploration)

GA4 path: `Explore` -> `Free form`

Suggested setup:

- Name: `Weekly Mobile Core Web Vitals`
- Date range: `Last 28 days`
- Visualization: `Line chart`
- Rows: `Date`
- Columns: `WV Metric Name`
- Values: `Average of WV Metric Value`
- Filters:
  - `Event name` exactly matches `web_vitals`
  - `WV Device Type` exactly matches `mobile`

Duplicate the tab and create a second view:

- Rows: `WV Page Path`
- Columns: `WV Metric Name`
- Values: `Average of WV Metric Value`
- Filter: `WV Metric Rating` matches regex `needs-improvement|poor`

This second view shows which pages need work first on mobile.

## 3) Save + Share As Weekly Monitoring

1. Save the exploration.
2. Add it to a shared GA4 Library collection for quick access.
3. Check once per week and compare:
   - `LCP` trend
   - `INP` trend
   - Pages with most `needs-improvement` or `poor` ratings

## 4) Optional Alert Workflow

If you use Looker Studio on top of GA4:

- Create a scorecard for mobile `LCP` and `INP` weekly average.
- Add conditional formatting (`poor` threshold highlight).
- Share to email weekly with your team.
