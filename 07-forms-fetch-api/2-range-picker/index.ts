import { createElement } from "../../shared/utils/create-element";
import { required } from "../../shared/utils/required";

interface Options {
  from?: Date;
  to?: Date;
}

interface DateRange {
  from: Date;
  to: Date;
}

export default class RangePicker {
  element: HTMLElement | null = null;
  selected: DateRange;
  showDate: Date;
  private selecting: Date | null = null;

  private onClick = (event: MouseEvent): void => this.handleClick(event);
  private onOutsideClick = (event: MouseEvent): void =>
    this.handleOutsideClick(event);

  constructor({ from = new Date(), to = new Date() }: Options = {}) {
    this.selected = { from, to };
    this.showDate = new Date(from);
    this.element = createElement(this.template());
    this.element.addEventListener("click", this.onClick);
    document.addEventListener("click", this.onOutsideClick, true);
  }

  private sub<T extends HTMLElement = HTMLElement>(selector: string): T {
    return required(
      this.element?.querySelector<T>(selector),
      `Element "${selector}" not found`,
    );
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private template(): string {
    const { from, to } = this.selected;
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${this.formatDate(from)}</span> -
          <span data-element="to">${this.formatDate(to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.closest(".rangepicker__input")) {
      this.toggle();
    } else if (target.closest(".rangepicker__selector-control-left")) {
      this.showDate = this.addMonths(this.showDate, -1);
      this.renderCalendars();
    } else if (target.closest(".rangepicker__selector-control-right")) {
      this.showDate = this.addMonths(this.showDate, 1);
      this.renderCalendars();
    } else {
      const cell = target.closest<HTMLElement>(".rangepicker__cell");
      if (cell) {
        this.handleCellClick(cell);
      }
    }
  }

  private handleCellClick(cell: HTMLElement): void {
    const value = required(cell.dataset.value, "Cell has no date value");
    const date = new Date(value);

    if (!this.selecting) {
      this.selecting = date;
      this.updateHighlighting();
      return;
    }

    const [from, to] =
      date < this.selecting ? [date, this.selecting] : [this.selecting, date];

    this.selected = { from, to };
    this.selecting = null;

    this.updateInput();
    this.updateHighlighting();
    this.dispatchDateSelect();
  }

  private updateInput(): void {
    this.sub<HTMLElement>('[data-element="from"]').textContent =
      this.formatDate(this.selected.from);
    this.sub<HTMLElement>('[data-element="to"]').textContent = this.formatDate(
      this.selected.to,
    );
  }

  private dispatchDateSelect(): void {
    this.element?.dispatchEvent(
      new CustomEvent("date-select", {
        detail: { from: this.selected.from, to: this.selected.to },
        bubbles: true,
      }),
    );
  }

  private toggle(): void {
    const selector = this.sub<HTMLElement>(".rangepicker__selector");

    if (selector.innerHTML === "") {
      this.renderCalendars();
    }

    this.element?.classList.toggle("rangepicker_open");
  }

  private handleOutsideClick(event: MouseEvent): void {
    if (!this.element?.classList.contains("rangepicker_open")) return;

    const target = event.target as Node;
    if (!this.element.contains(target)) {
      this.element.classList.remove("rangepicker_open");
    }
  }

  private addMonths(date: Date, count: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + count, 1);
  }

  private renderCalendars(): void {
    const selector = this.sub<HTMLElement>(".rangepicker__selector");

    if (selector.children.length === 0) {
      selector.innerHTML = `
        <div class="rangepicker__selector-arrow"></div>
        <div class="rangepicker__selector-control-left"></div>
        <div class="rangepicker__selector-control-right"></div>
      `;
    }

    selector
      .querySelectorAll(".rangepicker__calendar")
      .forEach((calendar) => calendar.remove());

    const nextMonth = this.addMonths(this.showDate, 1);
    selector.insertAdjacentHTML(
      "beforeend",
      this.renderCalendar(this.showDate) + this.renderCalendar(nextMonth),
    );
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }

  private isBetween(date: Date, from: Date, to: Date): boolean {
    return date > from && date < to;
  }

  private getHighlightClass(date: Date): string | null {
    if (this.selecting) {
      return this.isSameDay(date, this.selecting)
        ? "rangepicker__selected"
        : null;
    }

    const { from, to } = this.selected;

    if (this.isSameDay(date, from)) return "rangepicker__selected-from";
    if (this.isSameDay(date, to)) return "rangepicker__selected-to";
    if (this.isBetween(date, from, to)) return "rangepicker__selected-between";

    return null;
  }

  private updateHighlighting(): void {
    const cells =
      this.element?.querySelectorAll<HTMLElement>(".rangepicker__cell") ?? [];

    for (const cell of cells) {
      cell.classList.remove(
        "rangepicker__selected",
        "rangepicker__selected-from",
        "rangepicker__selected-to",
        "rangepicker__selected-between",
      );

      const value = cell.dataset.value;
      if (!value) continue;

      const highlightClass = this.getHighlightClass(new Date(value));
      if (highlightClass) cell.classList.add(highlightClass);
    }
  }

  private getStartFrom(date: Date): number {
    const dayOfWeek = date.getDay();
    return ((dayOfWeek + 6) % 7) + 1;
  }

  private renderCalendar(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = new Date(year, month, 1).toLocaleString("ru", {
      month: "long",
    });
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const classes = ["rangepicker__cell"];

      const highlightClass = this.getHighlightClass(cellDate);
      if (highlightClass) classes.push(highlightClass);

      const style =
        day === 1
          ? ` style="--start-from: ${this.getStartFrom(cellDate)}"`
          : "";

      cells.push(
        `<button type="button" class="${classes.join(" ")}" data-value="${cellDate.toISOString()}"${style}>${day}</button>`,
      );
    }

    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${monthName}">${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
          <div>Su</div>
        </div>
        <div class="rangepicker__date-grid">
          ${cells.join("")}
        </div>
      </div>
    `;
  }

  remove(): void {
    this.element?.remove();
  }

  destroy(): void {
    this.element?.removeEventListener("click", this.onClick);
    document.removeEventListener("click", this.onOutsideClick, true);
    this.remove();
    this.element = null;
  }
}
