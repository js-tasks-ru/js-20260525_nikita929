import ColumnChart from '../../../08-async-code-fetch-api/1-column-chart/src/index';
import SortableTable from '../../../08-async-code-fetch-api/2-sortable-table-v3/src/index';
import RangePicker from '../../../07-forms-fetch-api/2-range-picker/src/index';

import header from './bestsellers-header';
import { fetchJson } from '../../shared/utils/fetch-json';
import { createElement } from '../../shared/utils/create-element';

const BACKEND_URL = 'https://course-js.javascript.ru/';

type PageComponents = {
  sortableTable: SortableTable;
  ordersChart: ColumnChart;
  salesChart: ColumnChart;
  customersChart: ColumnChart;
  rangePicker: RangePicker;
};

export default class Page {

}
