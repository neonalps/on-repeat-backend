
import { AccountChartDao } from "@src/models/classes/dao/account-chart";
import { AccountChartItemDao } from "@src/models/classes/dao/account-chart-item";

export class AccountChartDetailsDao {
   private _chart!: AccountChartDao;
   private _items!: AccountChartItemDao[];

   constructor(builder: AccountChartDetailsDaoBuilder) {
      this._chart = builder.chart;
      this._items = builder.items;
   }

   public get chart(): AccountChartDao {
      return this._chart;
   }

   public get items(): AccountChartItemDao[] {
      return this._items;
   }

   public static get Builder(): AccountChartDetailsDaoBuilder {
      return new AccountChartDetailsDaoBuilder();
   }
}

class AccountChartDetailsDaoBuilder {
   private _chart!: AccountChartDao;
   private _items!: AccountChartItemDao[];

   public withChart(chart: AccountChartDao): AccountChartDetailsDaoBuilder {
      this._chart = chart;
      return this;
   }

   public withItems(items: AccountChartItemDao[]): AccountChartDetailsDaoBuilder {
      this._items = items;
      return this;
   }

   public get chart(): AccountChartDao {
      return this._chart;
   }

   public get items(): AccountChartItemDao[] {
      return this._items;
   }

   build(): AccountChartDetailsDao {
      return new AccountChartDetailsDao(this);
   }
}