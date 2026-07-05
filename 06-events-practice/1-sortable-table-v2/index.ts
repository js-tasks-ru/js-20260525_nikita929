import { createElement } from "../../shared/utils/create-element";
import { required } from "../../shared/utils/required";

type SortOrder = "asc" | "desc";

type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "custom";
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

export default class SortableTable {
  private _element: HTMLElement | null;
  private headersConfig: SortableTableHeader[];
  private data: SortableTableData[];
  private sorted: SortableTableSort;
  private isSortLocally: boolean;
  private headerClickHandler: (event: Event) => void;

  constructor(
    headersConfig: SortableTableHeader[] = [],
    { data = [], sorted, isSortLocally = true }: Options = {},
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = { id: "", order: "asc" };
    this.isSortLocally = isSortLocally;
    this.headerClickHandler = this.onHeaderClick.bind(this);
    this._element = this.render();

    if (sorted) {
      this.sort(sorted.id, sorted.order);
    }

    this.initEventListeners();
  }

  get element(): HTMLElement {
    if (!this._element) {
      throw new Error("SortableTable has been destroyed");
    }
    return this._element;
  }

  private find<T extends Element = HTMLElement>(selector: string): T {
    return required(
      this._element?.querySelector<T>(selector),
      `Element "${selector} no found"`,
    );
  }

  private initEventListeners(): void {
    const header = this._element?.querySelector('[data-element="header"]');
    if (header) {
      header.addEventListener("pointerdown", this.headerClickHandler);
    }
  }

  private render(): HTMLElement {
    return createElement(this.template());
  }

  private template(): string {
    return `<div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.headersConfig.map((item) => this.renderHeaderCell(item)).join("")}
                </div>
                <div data-element="body" class="sortable-table__body">
                 ${this.renderTableRows(this.data)}
                </div>
              </div>`;
  }

  private renderHeaderCell({
    id,
    title,
    sortable = false,
  }: SortableTableHeader): string {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${
          sortable
            ? `
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
        `
            : ""
        }
      </div>
    `;
  }

  private renderTableRows(data: SortableTableData[]): string {
    return data
      .map(
        (item) => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.headersConfig
          .map(({ id, template }) => {
            const cellData = item[id];
            return template
              ? template(cellData)
              : `<div class="sortable-table__cell">${cellData}</div>`;
          })
          .join("")}
      </a>
    `,
      )
      .join("");
  }

  private onHeaderClick(event: Event): void {
    const target = (event.target as HTMLElement).closest(
      '[data-sortable="true"]',
    ) as HTMLElement;
    if (!target) return;

    const columnId = target.dataset.id;
    if (!columnId) return;

    const column = this.headersConfig.find(
      (item: SortableTableHeader): boolean => item.id === columnId,
    );
    if (!column || !column.sortable) return;

    const currentOrder = target.dataset.order as SortOrder | undefined;
    const order: SortOrder = currentOrder === "asc" ? "desc" : "asc";

    this.sort(columnId, order);
  }

  sort(field: string, order: SortOrder): void {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  private sortOnClient(field: string, order: SortOrder): void {
    const column = this.headersConfig?.find(
      (item: SortableTableHeader): boolean => item.id === field,
    );
    if (!column || !column.sortable) return;

    const direction = order === "asc" ? 1 : -1;

    const sortedData = [...this.data].sort((a, b) => {
      switch (column.sortType) {
        case "number":
          return -direction * (Number(a[field]) - Number(b[field]));
        case "string":
          return (
            direction *
            String(a[field]).localeCompare(String(b[field]), ["ru", "en"], {
              caseFirst: "upper",
            })
          );
        case "custom":
          return (
            direction * (column.customSorting ? column.customSorting(a, b) : 0)
          );
        default:
          return 0;
      }
    });

    this.updateTable(sortedData, field, order);
  }

  private sortOnServer(field: string, order: SortOrder): void {
    console.log(`Sorting on server: field=${field}, order=${order}`);
  }

  private updateTable(
    data: SortableTableData[],
    field: string,
    order: SortOrder,
  ) {
    const bodyElement = this.find<HTMLDivElement>('[data-element="body"]');
    bodyElement.innerHTML = this.renderTableRows(data);

    this.element
      .querySelectorAll("[data-order]")
      .forEach((elem) => elem.removeAttribute("data-order"));

    const headerCell = this.element.querySelector<HTMLDivElement>(
      `[data-id="${field}"`,
    );
    if (headerCell) {
      headerCell.dataset.order = order;
    }
  }

  private removeEventListeners(): void {
    const header = this._element?.querySelector('[data-element="header"]');
    if (header) {
      header.removeEventListener("pointerdown", this.headerClickHandler);
    }
  }

  remove(): void {
    if (this._element) {
      this._element.remove();
    }
  }

  destroy(): void {
    this.removeEventListeners();
    this.remove();
    this._element = null;
  }
}
