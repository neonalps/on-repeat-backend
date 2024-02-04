import { TrackChartItemDaoInterface } from "@src/models/dao/track-chart-item.dao";

export class TrackChartItemDao {
   private _chartId!: number;
   private _chartName!: string;
   private _place!: number;
   private _playCount!: number | null;

   constructor(builder: TrackChartItemDaoBuilder) {
      this._chartId = builder.chartId;
      this._chartName = builder.chartName;
      this._place = builder.place;
      this._playCount = builder.playCount;
   }

   public get chartId(): number {
      return this._chartId;
   }

   public get chartName(): string {
      return this._chartName;
   }

   public get place(): number {
      return this._place;
   }

   public get playCount(): number | null {
      return this._playCount;
   }

   public static get Builder(): TrackChartItemDaoBuilder {
      return new TrackChartItemDaoBuilder();
   }

   public static fromDaoInterface(item: TrackChartItemDaoInterface): TrackChartItemDao | null {
      if (!item) {
         return null;
      }

      return this.Builder
         .withChartId(item.chartId)
         .withChartName(item.chartName)
         .withPlace(item.place)
         .withPlayCount(item.playCount)
         .build();
   }
}

class TrackChartItemDaoBuilder {
   private _chartId!: number;
   private _chartName!: string;
   private _place!: number;
   private _playCount!: number | null;

   public withChartId(chartId: number): TrackChartItemDaoBuilder {
      this._chartId = chartId;
      return this;
   }

   public withChartName(chartName: string): TrackChartItemDaoBuilder {
      this._chartName = chartName;
      return this;
   }

   public withPlace(place: number): TrackChartItemDaoBuilder {
      this._place = place;
      return this;
   }

   public withPlayCount(playCount: number | null): TrackChartItemDaoBuilder {
      this._playCount = playCount;
      return this;
   }

   public get chartId(): number {
      return this._chartId;
   }

   public get chartName(): string {
      return this._chartName;
   }

   public get place(): number {
      return this._place;
   }

   public get playCount(): number | null {
      return this._playCount;
   }

   build(): TrackChartItemDao {
      return new TrackChartItemDao(this);
   }
}