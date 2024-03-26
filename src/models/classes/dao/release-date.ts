export class ReleaseDateDao {
    private _releaseDate!: Date;
    private _precision!: string;
 
    constructor(builder: ReleaseDateDaoBuilder) {
       this._releaseDate = builder.releaseDate;
       this._precision = builder.precision;
    }
 
    public get releaseDate(): Date {
       return this._releaseDate;
    }
 
    public get precision(): string {
       return this._precision;
    }
 
    public static get Builder(): ReleaseDateDaoBuilder {
       return new ReleaseDateDaoBuilder();
    }
 }
 
 class ReleaseDateDaoBuilder {
    private _releaseDate!: Date;
    private _precision!: string;
 
    public withReleaseDate(releaseDate: Date): ReleaseDateDaoBuilder {
       this._releaseDate = releaseDate;
       return this;
    }
 
    public withPrecision(precision: string): ReleaseDateDaoBuilder {
       this._precision = precision;
       return this;
    }
 
    public get releaseDate(): Date {
       return this._releaseDate;
    }
 
    public get precision(): string {
       return this._precision;
    }
 
    build(): ReleaseDateDao {
       return new ReleaseDateDao(this);
    }
 }