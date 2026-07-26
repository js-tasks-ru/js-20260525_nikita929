import { createElement } from "../../shared/utils/create-element";
import { escapeHtml } from "../../shared/utils/escape-html";
import { fetchJson } from "../../shared/utils/fetch-json";
import { required } from "../../shared/utils/required";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

interface ProductImage {
  url: string;
  source: string;
}

interface ImgurUploadResponse {
  data: {
    link: string;
  };
}

interface Category {
  id: string;
  title: string;
  // subcategories: Subcategory[];
  subcategories: Category[];
}

// interface Subcategory {
//   id: string;
//   title: string;
// }

interface ProductFormData {
  title: string;
  description: string;
  quantity: number;
  subcategory: string;
  status: number;
  price: number;
  discount: number;
  images: ProductImage[];
}

export default class ProductForm {
  productId?: string;
  element: HTMLElement | null = null;
  subElements: Record<string, HTMLElement> = {};
  categories: Category[] = [];
  formData: ProductFormData | null = null;

  defaultFormData: ProductFormData = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    price: 100,
    discount: 0,
    images: [],
  };

  constructor(productId?: string) {
    this.productId = productId;
  }

  async loadCategories(): Promise<Category[]> {
    return fetchJson<Category[]>(
      `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`,
    );
  }

  async loadProductData(id: string): Promise<ProductFormData[]> {
    return fetchJson<ProductFormData[]>(
      `${BACKEND_URL}/api/rest/products?id=${id}`,
    );
  }

  async render(): Promise<HTMLElement | null> {
    this.categories = await this.loadCategories();
    this.formData = this.productId
      ? (await this.loadProductData(this.productId))[0]
      : this.defaultFormData;
    this.element = createElement(this.getTemplate());
    this.subElements = this.getSubElements();

    this.subElement<HTMLFormElement>("productForm").addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        this.save();
      },
    );

    return this.element;
  }

  private subElement<T extends HTMLElement = HTMLElement>(name: string): T {
    return required(
      this.subElements[name] as T,
      `Sub-element "${name}" not found`,
    );
  }

  private getSubElements(): Record<string, HTMLElement> {
    const result: Record<string, HTMLElement> = {};
    const elements =
      this.element?.querySelectorAll<HTMLElement>("[data-element]") || [];
    for (const el of elements) {
      const name = el.getAttribute("data-element");
      if (name) {
        result[name] = el;
      }
    }
    return result;
  }

  private getTemplate(): string {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label" for="title">Название товара</label>
              <input
                id="title"
                required
                type="text"
                name="title"
                class="form-control"
                placeholder="Название товара"
                value="${escapeHtml(this.formData?.title || "")}"
              />
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label" for="description">Описание</label>
            <textarea
              id="description"
              required
              class="form-control"
              name="description"
              data-element="productDescription"
              placeholder="Описание товара"
            >${escapeHtml(this.formData?.description || "")}</textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list">${this.getImagesList()}</ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline">
              <span>Загрузить</span>
            </button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label" for="subcategory">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
              ${this.getCategoriesOptions()}
            </select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label" for="price">Цена ($)</label>
              <input
                id="price"
                required
                type="number"
                name="price"
                class="form-control"
                placeholder="100"
                value="${this.formData?.price ?? 100}"
              />
            </fieldset>
            <fieldset>
              <label class="form-label" for="discount">Скидка ($)</label>
              <input
                id="discount"
                required
                type="number"
                name="discount"
                class="form-control"
                placeholder="0"
                value="${this.formData?.discount ?? 0}"
              />
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label" for="quantity">Количество</label>
            <input
              id="quantity"
              required
              type="number"
              class="form-control"
              name="quantity"
              placeholder="1"
              value="${this.formData?.quantity ?? 1}"
            />
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label" for="status">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1" ${this.formData?.status === 1 ? "selected" : ""}>Активен</option>
              <option value="0" ${this.formData?.status === 0 ? "selected" : ""}>Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить товар" : "Добавить товар"}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  getImagesList(): string {
    return (this.formData?.images || [])
      .map(
        (image) => `
        <li class="products-edit__imagelist-item sortable-list__item">
          <input type="hidden" name="url" value="${escapeHtml(image.url)}">
          <input type="hidden" name="source" value="${escapeHtml(image.source)}">
          <span>
            <img src="icon-grab.svg" data-grab-handle alt="grab">
            <img class="sortable-table__cell-img" alt="${escapeHtml(image.source)}" src="${escapeHtml(image.url)}">
            <span>${escapeHtml(image.source)}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle alt="delete">
          </button>
        </li>
      `,
      )
      .join("");
  }

  getCategoriesOptions(): string {
    return this.categories
      .map((category) =>
        category.subcategories
          .map(
            (subcategory) => `
            <option value="${subcategory.id}" ${this.formData?.subcategory === subcategory.id ? "selected" : ""}>
              ${escapeHtml(category.title)} &gt; ${escapeHtml(subcategory.title)}
            </option>
          `,
          )
          .join(""),
      )
      .join("");
  }

  async save(): Promise<void> {
    const formData = new FormData(
      this.subElement<HTMLFormElement>("productForm"),
    );
    const productData: ProductFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      quantity: Number(formData.get("quantity")),
      subcategory: formData.get("subcategory") as string,
      status: Number(formData.get("status")),
      price: Number(formData.get("price")),
      discount: Number(formData.get("discount")),
      images: [],
    };

    const imageElements =
      this.subElement<HTMLDivElement>("imageListContainer")?.querySelectorAll(
        ".sortable-list__item",
      ) || [];

    for (const imageElement of imageElements) {
      const urlInput =
        imageElement.querySelector<HTMLInputElement>('input[name="url"]');
      const sourceInput = imageElement.querySelector<HTMLInputElement>(
        'input[name="source"]',
      );
      if (urlInput && sourceInput) {
        productData.images.push({
          url: urlInput.value,
          source: sourceInput.value,
        });
      }
    }

    const method = this.productId ? "PATCH" : "POST";
    const url = this.productId
      ? `${BACKEND_URL}/api/rest/products?id=${this.productId}`
      : `${BACKEND_URL}/api/rest/products`;

    const result = await fetchJson<{ id: string }>(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const eventName = this.productId ? "product-updated" : "product-saved";
    const eventDetail = this.productId ?? result.id;

    this.element?.dispatchEvent(
      new CustomEvent(eventName, { detail: eventDetail, bubbles: true }),
    );
  }

  remove(): void {
    this.element?.remove();
    this.element = null;
  }

  destroy(): void {
    this.remove();
    this.element = null;
  }
}
