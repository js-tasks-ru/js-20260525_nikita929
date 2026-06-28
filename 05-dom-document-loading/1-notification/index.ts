import { createElement } from "../../shared/utils/create-element";

type NotificationType = "success" | "error";

interface Options {
  duration?: number;
  type?: NotificationType;
}

export default class NotificationMessage {
  private static activeNotification: NotificationMessage | null = null;
  private duration: number;
  private type: NotificationType;
  private message: string;
  private _element: HTMLElement | null = null;
  private timerId: number | null = null;

  constructor(
    message: string,
    { duration = 2000, type = "success" }: Options = {},
  ) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    this._element = this.createNotification();
    NotificationMessage.activeNotification = this;
  }

  get element(): HTMLElement {
    if (!this._element) {
      throw new Error("NotificationMessage has been destroyed");
    }
    return this._element;
  }

  private createNotification(): HTMLElement {
    const durationInSeconds = (this.duration / 1000).toFixed(0) + "s";

    const html = `
      <div class="notification ${this.type}" style="--value:${durationInSeconds}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `;

    return createElement(html);
  }

  show(target: HTMLElement = document.body): void {
    target.append(this._element!);
    this.startTimer();
  }

  remove(): void {
    if (this._element) {
      if (this._element.isConnected) {
        this._element.remove();
      } else {
        const parentElement = this._element.parentElement;
        if (parentElement && parentElement.isConnected) {
          parentElement.removeChild(this._element);
        }
      }
    }
  }

  destroy(): void {
    this.remove();
    this.clearTimer();

    if (NotificationMessage.activeNotification === this) {
      NotificationMessage.activeNotification = null;
    }
  }

  private startTimer(): void {
    this.timerId = window.setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}
