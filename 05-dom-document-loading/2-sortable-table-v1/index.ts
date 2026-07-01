import { createElement } from "../../shared/utils/create-element";
import { required } from "../../shared/utils/required";

type SortOrder = "asc" | "desc";

type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number";
  template?: (value: string | number) => string;
}

export default class SortableTable {
  private _element: HTMLElement | null;
  private headersConfig: SortableTableHeader[];
  private data: SortableTableData[];

  constructor(
    headersConfig: SortableTableHeader[] = [],
    data: SortableTableData[] = [],
  ) {
    this.headersConfig = headersConfig;
    this.data = data;
    this._element = this.render();
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

  sort(field: string, order: SortOrder): void {
    const column = this.headersConfig?.find(
      (item: SortableTableHeader): boolean => item.id === field,
    );
    if (!column || !column.sortable) return;

    const directions: Record<SortOrder, number> = { asc: 1, desc: -1 };

    const sortedData = [...this.data]?.sort(
      (rowA: SortableTableData, rowB: SortableTableData) => {
        if (column.sortType === "string") {
          return (
            String(rowA[field]).localeCompare(
              String(rowB[field]),
              ["ru", "en"],
              {
                caseFirst: "upper",
              },
            ) * directions[order]
          );
        }

        return (Number(rowA[field]) - Number(rowB[field])) * directions[order];
      },
    );

    const bodyElement = this.find<HTMLDivElement>('[data-element="body"]');
    bodyElement.innerHTML = this.renderTableRows(sortedData);

    this.element
      .querySelectorAll("[data-order]")
      ?.forEach((elem) => elem.removeAttribute("data-order"));

    const headerCell = this.find<HTMLDivElement>(`[data-id="${field}"]`);
    headerCell.dataset.order = order;
  }

  remove(): void {
    if (this._element) {
      this._element.remove();
    }
  }

  destroy(): void {
    this.remove();
    this._element = null;
  }
}
