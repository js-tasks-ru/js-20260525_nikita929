import SortableTable from './index';

import { products, bestsellers } from './__mocks__/products-data';

type SortableTableHeader = {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: 'string' | 'number' | 'custom';
  template?: (value: unknown) => string;
};

const headerConfig: SortableTableHeader[] = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: (value: unknown) => {
      const products = value as Array<{ url: string }>;

      return `
        <div class="sortable-table__cell">
          <img class="sortable-table-image" alt="Image" src="${products[0].url}">
        </div>
      `;
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: (value: unknown) => {
      const quantity = value as number;

      return `<div class="sortable-table__cell">
        ${quantity > 0 ? 'Active' : 'Inactive'}
      </div>`;
    }
  },
];

describe('async-code-fetch-api-part-1/sortable-table-v3', () => {
  let sortableTable: SortableTable;
  let shouldDestroy = true;

  beforeEach(() => {
    fetchMock.resetMocks();

    sortableTable = new SortableTable(headerConfig, {
      url: 'api/rest/products',
      sorted: {
        id: headerConfig.find(item => item.sortable)!.id,
        order: 'asc'
      }
    });

    document.body.append(sortableTable.element!);

    shouldDestroy = true;
  });

  afterEach(() => {
    if (shouldDestroy) {
      sortableTable.destroy();
    }
  });

  it('should be rendered correctly', async() => {
    document.body.append(sortableTable.element!);

    expect(sortableTable.element).toBeVisible();
    expect(sortableTable.element).toBeInTheDocument();
  });

  it('should call "loadData" method', () => {
    fetchMock.mockResponseOnce();

    expect(fetchMock.mock.calls.length).toEqual(1);
  });

  it('should render loaded data correctly', async() => {
    fetchMock.mockResponseOnce(JSON.stringify(products));

    await sortableTable.render();

    const body = sortableTable.element?.querySelector<HTMLElement>('[data-element="body"]');

    expect(body).not.toBeNull();
    expect(body!.children.length).toEqual(3);

    const [row1, row2, row3] = Array.from(body!.children);

    expect(row1).toHaveTextContent('10.5\" Планшет Apple iPad Pro Wi-Fi+Cellular 64 ГБ , LTE серый');
    expect(row2).toHaveTextContent('13.3\" Рюкзак XD Design Bobby Hero Small серый');
    expect(row3).toHaveTextContent('13.3\" Ультрабук ASUS VivoBook S13 S330FA-EY127T серебристый');
  });

  it('should call "sortOnClient" for sorting on the client side', async () => {
    const sortableTable = new SortableTable(headerConfig, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true,
      sorted: {
        id: headerConfig.find(item => item.sortable)!.id,
        order: 'asc'
      }
    });

    fetchMock.mockResponseOnce(JSON.stringify(bestsellers));

    await sortableTable.render();

    const header = sortableTable.element?.querySelector<HTMLElement>('[data-element="header"]');
    const column2 = header?.children[1] as HTMLElement | undefined;
    const spy = vi.spyOn(sortableTable, 'sortOnClient');

    const click = new MouseEvent('pointerdown', {
      bubbles: true
    });

    expect(column2).toBeDefined();
    column2!.dispatchEvent(click);

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.length).toEqual(1);
    expect(spy.mock.calls[0][0]).toEqual('title');
    expect(spy.mock.calls[0][1]).toEqual('desc');
  });

  it('should call "sortOnServer" for sorting on the server side', async() => {
    fetchMock.mockResponseOnce(JSON.stringify(products));

    await sortableTable.render();

    const header = sortableTable.element?.querySelector<HTMLElement>('[data-element="header"]');
    const column2 = header?.children[1] as HTMLElement | undefined;
    const spy = vi.spyOn(sortableTable, 'sortOnServer');

    const click = new MouseEvent('pointerdown', {
      bubbles: true
    });

    expect(column2).toBeDefined();
    column2!.dispatchEvent(click);

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.length).toEqual(1);
    expect(spy.mock.calls[0][0]).toEqual('title');
    expect(spy.mock.calls[0][1]).toEqual('desc');
  });

  it('should have ability to be destroyed', () => {
    const element = sortableTable.element;

    sortableTable.destroy();
    shouldDestroy = false;

    expect(element).not.toBeInTheDocument();
  });
});
