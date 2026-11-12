type HeaderConfigItem = {
  id: string;
  title: string;
  sortable: boolean;
  sortType?: 'string' | 'number';
  template?: (value: unknown) => string;
};

const header: HeaderConfigItem[] = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: (value: unknown) => {
      const data = Array.isArray(value) ? value as Array<{ url: string }> : [];

      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
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
      const data = Number(value);

      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  },
];

export default header;
