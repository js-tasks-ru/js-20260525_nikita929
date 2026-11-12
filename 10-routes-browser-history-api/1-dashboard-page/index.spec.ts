import { default as DashboardPage } from './index';

describe('routes-browser-history-api/dashboard-page', () => {
  let dashboardPage: DashboardPage;

  beforeEach(async () => {
    dashboardPage = new DashboardPage();
    const element = await dashboardPage.render();

    if (!element) {
      throw new Error('Dashboard element was not rendered');
    }

    document.body.append(element);
  });

  afterEach(() => {
    dashboardPage.destroy();
  });

  it('should be rendered correctly', () => {
    expect(dashboardPage.element).toBeVisible();
    expect(dashboardPage.element).toBeInTheDocument();
  });

  it('should render bestsellers table', () => {
    const sortableTable = dashboardPage.element.querySelector('[data-element="sortableTable"]');

    expect(sortableTable).toBeVisible();
    expect(sortableTable).toBeInTheDocument();
  });

  it('should render "RangePicker" component', () => {
    const rangePicker = dashboardPage.element.querySelector('[data-element="rangePicker"]');

    expect(rangePicker).toBeVisible();
    expect(rangePicker).toBeInTheDocument();
  });

  it('should render "ordersChart" component', () => {
    const ordersChart = dashboardPage.element.querySelector('[data-element="ordersChart"]');

    expect(ordersChart).toBeVisible();
    expect(ordersChart).toBeInTheDocument();
  });

  it('should render "salesChart" component', () => {
    const salesChart = dashboardPage.element.querySelector('[data-element="salesChart"]');

    expect(salesChart).toBeVisible();
    expect(salesChart).toBeInTheDocument();
  });

  it('should render "customersChart" component', () => {
    const customersChart = dashboardPage.element.querySelector('[data-element="customersChart"]');

    expect(customersChart).toBeVisible();
    expect(customersChart).toBeInTheDocument();
  });

  it('should have ability to be removed', () => {
    dashboardPage.remove();

    expect(dashboardPage.element).not.toBeInTheDocument();
  });
});
