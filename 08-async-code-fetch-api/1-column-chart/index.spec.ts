import ColumnChart from './index';

import ordersData from "./__mocks__/orders-data";

describe('async-code-fetch-api-part-1/column-chart', () => {
  let columnChart: ColumnChart;
  let shouldDestroy = true;

  beforeEach(() => {
    fetchMock.mockResponse(JSON.stringify(ordersData));

    columnChart = new ColumnChart({
      label: '',
      link: ''
    });

    document.body.append(columnChart.element!);

    shouldDestroy = true;
  });

  afterEach(() => {
    if (shouldDestroy) {
      columnChart.destroy();
    }
  });

  it('should be rendered correctly', async () => {
    expect(columnChart.element).toBeInTheDocument();
    expect(columnChart.element).toBeVisible();
  });

  it('should load data correctly', async () => {
    const from = new Date();
    const to = new Date();
    const data = await columnChart.update(from, to);

    expect(data).toEqual(ordersData);
  });

  it('should render loaded data correctly', async () => {
    const expectedData = Object.values(ordersData);

    const from = new Date();
    const to = new Date();
    await columnChart.update(from, to);

    const body = columnChart.element?.querySelector('[data-element="body"]') as HTMLElement | null;

    expect(body).not.toBeNull();
    expect(body?.children.length).toEqual(expectedData.length);
  });

  it('should have ability to define "label"', () => {
    const label = 'New label';

    columnChart = new ColumnChart({ label });

    const title = columnChart.element?.querySelector('.column-chart__title');

    expect(title).toHaveTextContent(label);
  });

  it('should have ability to define "link"', () => {
    const link = 'https://google.com';

    columnChart = new ColumnChart({ link });

    document.body.append(columnChart.element!);

    const columnLink = columnChart.element?.querySelector('.column-chart__link');

    expect(columnLink).toBeVisible();
  });

  it('should have property "chartHeight"', () => {
    columnChart = new ColumnChart();

    expect(columnChart.chartHeight).toEqual(50);
  });

  it('should have ability to be update by new values', async () => {
    const data: Record<string, number> = {
      "2020-04-11": 8,
      "2020-04-12": 13,
      "2020-04-13": 20
    };

    fetchMock.once(JSON.stringify(data));

    await columnChart.update(new Date('2020-04-06'), new Date('2020-05-06'));

    const body = columnChart.element?.querySelector('[data-element="body"]') as HTMLElement | null;

    expect(body).not.toBeNull();
    expect(body?.children.length).toEqual(Object.values(data).length);
  });

  it('should have loading indication if data wasn\'t passed ', () => {
    columnChart = new ColumnChart();
    document.body.append(columnChart.element!);

    expect(columnChart.element).toHaveClass('column-chart_loading');
  });

  it('should have ability to be destroyed', () => {
    const element = columnChart.element;

    columnChart.destroy();
    shouldDestroy = false;

    expect(element).not.toBeInTheDocument();
  });
});
