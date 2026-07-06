import { escapeHtml } from '../../shared/utils/escape-html';
import { fetchJson } from '../../shared/utils/fetch-json';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

interface ProductImage {
  url: string;
  source: string;
}

interface ImgurUploadResponse {
  data: {
    link: string;
  };
}

export default class ProductForm {
  productId?: string;

  constructor(productId?: string) {
    this.productId = productId;
  }

  async render(): Promise<HTMLElement | null> {
  }

  async save(): Promise<void> {
  }
}
