import { ArtistTrackChartItemDaoInterface } from "@src/models/dao/artist-track-chart-item.dao";

export class ArtistTrackChartItemDao {
   private _chartId!: number;
   private _chartName!: string;
   private _trackId!: number;
   private _place!: number;
   private _playCount!: number | null;

   constructor(builder: ArtistTrackChartItemDaoBuilder) {
      this._chartId = builder.chartId;
      this._chartName = builder.chartName;
      this._trackId = builder.trackId;
      this._place = builder.place;
      this._playCount = builder.playCount;
   }

   public get chartId(): number {
      return this._chartId;
   }

   public get chartName(): string {
      return this._chartName;
   }

   public get trackId(): number {
      return this._trackId;
   }

   public get place(): number {
      return this._place;
   }

   public get playCount(): number | null {
      return this._playCount;
   }

   public static get Builder(): ArtistTrackChartItemDaoBuilder {
      return new ArtistTrackChartItemDaoBuilder();
   }

   public static fromDaoInterface(item: ArtistTrackChartItemDaoInterface): ArtistTrackChartItemDao | null {
      if (!item) {
         return null;
      }

      return this.Builder
         .withChartId(item.chartId)
         .withChartName(item.chartName)
         .withTrackId(item.trackId)
         .withPlace(item.place)
         .withPlayCount(item.playCount)
         .build();
   }
}

class ArtistTrackChartItemDaoBuilder {
   private _chartId!: number;
   private _chartName!: string;
   private _trackId!: number;
   private _place!: number;
   private _playCount!: number | null;

   public withChartId(chartId: number): ArtistTrackChartItemDaoBuilder {
      this._chartId = chartId;
      return this;
   }

   public withChartName(chartName: string): ArtistTrackChartItemDaoBuilder {
      this._chartName = chartName;
      return this;
   }

   public withTrackId(trackId: number): ArtistTrackChartItemDaoBuilder {
      this._trackId = trackId;
      return this;
   }

   public withPlace(place: number): ArtistTrackChartItemDaoBuilder {
      this._place = place;
      return this;
   }

   public withPlayCount(playCount: number | null): ArtistTrackChartItemDaoBuilder {
      this._playCount = playCount;
      return this;
   }

   public get chartId(): number {
      return this._chartId;
   }

   public get chartName(): string {
      return this._chartName;
   }

   public get trackId(): number {
      return this._trackId;
   }

   public get place(): number {
      return this._place;
   }

   public get playCount(): number | null {
      return this._playCount;
   }

   build(): ArtistTrackChartItemDao {
      return new ArtistTrackChartItemDao(this);
   }
}