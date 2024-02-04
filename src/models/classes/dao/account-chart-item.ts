import { AccountChartItemDaoInterface } from "@src/models/dao/account-chart-item.dao";
import { isNotDefined } from "@src/util/common";

export class AccountChartItemDao {
   private _id!: number;
   private _chartId!: number;
   private _itemId!: number;
   private _place!: number;
   private _playCount!: number | null;

   constructor(builder: AccountChartTrackDaoBuilder) {
      this._id = builder.id;
      this._chartId = builder.chartId;
      this._itemId = builder.itemId;
      this._place = builder.place;
      this._playCount = builder.playCount;
   }

   public get id(): number {
      return this._id;
   }

   public get chartId(): number {
      return this._chartId;
   }

   public get itemId(): number {
      return this._itemId;
   }

   public get place(): number {
      return this._place;
   }

   public get playCount(): number | null {
      return this._playCount;
   }

   public static get Builder(): AccountChartTrackDaoBuilder {
      return new AccountChartTrackDaoBuilder();
   }

   public static fromDaoInterface(item: AccountChartItemDaoInterface): AccountChartItemDao | null {
      if (isNotDefined(item)) {
         return null;
      }

      return this.Builder
         .withId(item.id)
         .withChartId(item.chartId)
         .withItemId(item.itemId)
         .withPlace(item.place)
         .withPlayCount(item.playCount)
         .build();
   }
}

class AccountChartTrackDaoBuilder {
   private _id!: number;
   private _chartId!: number;
   private _itemId!: number;
   private _place!: number;
   private _playCount!: number | null;

   public withId(id: number): AccountChartTrackDaoBuilder {
      this._id = id;
      return this;
   }

   public withChartId(chartId: number): AccountChartTrackDaoBuilder {
      this._chartId = chartId;
      return this;
   }

   public withItemId(itemId: number): AccountChartTrackDaoBuilder {
      this._itemId = itemId;
      return this;
   }

   public withPlace(place: number): AccountChartTrackDaoBuilder {
      this._place = place;
      return this;
   }

   public withPlayCount(playCount: number | null): AccountChartTrackDaoBuilder {
      this._playCount = playCount;
      return this;
   }

   public get id(): number {
      return this._id;
   }

   public get chartId(): number {
      return this._chartId;
   }

   public get itemId(): number {
      return this._itemId;
   }

   public get place(): number {
      return this._place;
   }

   public get playCount(): number | null {
      return this._playCount;
   }

   build(): AccountChartItemDao {
      return new AccountChartItemDao(this);
   }
}