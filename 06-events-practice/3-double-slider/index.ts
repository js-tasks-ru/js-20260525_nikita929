import { createElement } from "../../shared/utils/create-element";

type DoubleSliderSelected = {
  from: number;
  to: number;
};

interface Options {
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  selected?: DoubleSliderSelected;
}

export default class DoubleSlider {
  element: HTMLElement;
  min: number;
  max: number;

  private formatValue: (value: number) => string;
  private selected: DoubleSliderSelected;
  private thumbLeft: HTMLElement;
  private thumbRight: HTMLElement;
  private progressBar: HTMLElement;
  private innerElement: HTMLElement;
  private fromElement: HTMLElement;
  private toElement: HTMLElement;
  private activeThumb: "left" | "right" | null = null;

  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;

  constructor({
    min = 0,
    max = 100,
    formatValue = (value: number) => value.toString(),
    selected = { from: min, to: max },
  }: Options = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected = {
      from: selected.from ?? min,
      to: selected.to ?? max,
    };

    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);

    this.element = this.createElement();
    this.innerElement = this.element.querySelector(
      ".range-slider__inner",
    ) as HTMLElement;
    this.thumbLeft = this.element.querySelector(
      ".range-slider__thumb-left",
    ) as HTMLElement;
    this.thumbRight = this.element.querySelector(
      ".range-slider__thumb-right",
    ) as HTMLElement;
    this.progressBar = this.element.querySelector(
      ".range-slider__progress",
    ) as HTMLElement;
    this.fromElement = this.element.querySelector('[data-element="from"]')!;
    this.toElement = this.element.querySelector('[data-element="to"]')!;

    this.initEventListeners();
    this.update();
  }

  private createElement(): HTMLElement {
    const html = `
      <div class="range-slider">
        <span data-element="from">${this.formatValue(this.selected.from)}</span>
        <div class="range-slider__inner">
          <div class="range-slider__progress"></div>
          <span class="range-slider__thumb-left"></span>
          <span class="range-slider__thumb-right"></span>
        </div>
        <span data-element="to">${this.formatValue(this.selected.to)}</span>
      </div>
      `;

    return createElement(html);
  }

  private initEventListeners(): void {
    this.thumbLeft.addEventListener("pointerdown", (e) =>
      this.onThumbPointerDown(e, "left"),
    );
    this.thumbLeft.addEventListener("dragstart", (e) => e.preventDefault());

    this.thumbRight.addEventListener("pointerdown", (e) =>
      this.onThumbPointerDown(e, "right"),
    );
    this.thumbRight.addEventListener("dragstart", (e) => e.preventDefault());
  }

  private onThumbPointerDown(
    event: PointerEvent,
    thumb: "left" | "right",
  ): void {
    event.preventDefault();
    this.activeThumb = thumb;
    this.element.classList.add("range-slider_dragging");

    document.addEventListener("pointermove", this.boundPointerMove);
    document.addEventListener("pointerup", this.boundPointerUp);
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.activeThumb) return;
    event.preventDefault();
    this.moveX(event.clientX);
  }

  private onPointerUp(): void {
    this.finishDrag();

    document.removeEventListener("pointermove", this.boundPointerMove);
    document.removeEventListener("pointerup", this.boundPointerUp);
    this.element.classList.remove("range-slider_dragging");
  }

  private moveX(clientX: number): void {
    if (!this.activeThumb || !this.innerElement) return;

    const rect = this.innerElement.getBoundingClientRect();
    const left = rect.left;
    const width = rect.width;

    if (width === 0) return;

    let percent = (clientX - left) / width;
    percent = Math.max(0, Math.min(1, percent));

    const value = Math.round(this.min + (this.max - this.min) * percent);
    if (this.activeThumb === "left") {
      this.selected.from = Math.min(value, this.selected.to);
    } else {
      this.selected.to = Math.max(value, this.selected.from);
    }

    this.update();
  }

  private finishDrag(): void {
    if (this.activeThumb) {
      this.activeThumb = null;
      this.dispatchRangeSelect();
    }
  }

  private update(): void {
    const range = this.max - this.min;

    const leftValue =
      range === 0 ? 0 : ((this.selected.from - this.min) / range) * 100;
    const rightValue =
      range === 0 ? 0 : ((this.selected.to - this.min) / range) * 100;

    this.thumbLeft.style.left = `${leftValue}%`;
    this.thumbRight.style.right = `${100 - rightValue}%`;

    this.progressBar.style.left = `${leftValue}%`;
    this.progressBar.style.right = `${100 - rightValue}%`;

    this.fromElement.textContent = this.formatValue(this.selected.from);
    this.toElement.textContent = this.formatValue(this.selected.to);
  }

  private dispatchRangeSelect(): void {
    const event = new CustomEvent("range-select", {
      detail: {
        from: this.selected.from,
        to: this.selected.to,
      },
      bubbles: true,
    });
    this.element.dispatchEvent(event);
  }

  remove(): void {
    this.element?.remove();
  }

  destroy(): void {
    document.removeEventListener("pointermove", this.boundPointerMove);
    document.removeEventListener("pointerup", this.boundPointerUp);

    this.remove();
  }
}
