import { required } from "../../shared/utils/required";

export default class Tooltip {
  static instance: Tooltip | null = null;
  element: HTMLDivElement | null = null;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  initialize(): void {
    document.addEventListener("pointerover", this.onPointerOver);
    document.addEventListener("pointerout", this.onPointerOut);
  }

  render(html: string): void {
    this.element = document.createElement("div");
    this.element.className = "tooltip";
    this.element.innerHTML = html;
    document.body.appendChild(this.element);
  }

  private getTooltipTarget(event: PointerEvent): HTMLElement | null {
    return (
      (event.target as HTMLElement)?.closest<HTMLElement>("[data-tooltip]") ??
      null
    );
  }

  private onPointerOver = (event: PointerEvent): void => {
    const target = this.getTooltipTarget(event);
    if (!target) return;

    const tooltipText = required(
      target.dataset.tooltip,
      `Element ${target.tagName} missing data-tooltip attribute value`,
    );

    this.render(tooltipText);
    document.addEventListener("pointermove", this.onPointerMove);

    const activeElement = required(
      this.element,
      "Tooltip element was not created after render",
    );
    this.positionTooltip(activeElement, event);
  };

  private onPointerOut = (event: PointerEvent): void => {
    const target = this.getTooltipTarget(event);
    if (!target) return;

    this.destroy();
  };

  private onPointerMove = (event: PointerEvent): void => {
    const element = required(this.element, "Cannot move non-existent tooltip");
    this.positionTooltip(element, event);
  };

  private positionTooltip(element: HTMLDivElement, event: PointerEvent): void {
    const offset = 10;
    element.style.left = `${event.clientX + offset}px`;
    element.style.top = `${event.clientY + offset}px`;
  }

  remove(): void {
    this.element?.remove();
  }

  destroy(): void {
    document.removeEventListener("pointermove", this.onPointerMove);
    this.remove();
    this.element = null;
  }

  static getInstance() {
    return required(
      Tooltip.instance,
      "Tooltip instance not initialized. Call new Tooltip() first.",
    );
  }
}
