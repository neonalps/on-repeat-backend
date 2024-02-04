import { AccountChartDaoInterface } from "@src/models/dao/account-chart.dao";
import { isNotDefined } from "@src/util/common";

export class AccountChartDao {
    private _id!: number;
    private _accountId!: number;
    private _name!: string;
    private _type!: string;
    private _from!: Date;
    private _to!: Date;
    private _thumbnailUrl!: string | null;
    private _createdAt!: Date;
 
    constructor(builder: AccountChartDaoBuilder) {
       this._id = builder.id;
       this._accountId = builder.accountId;
       this._name = builder.name;
       this._type = builder.type;
       this._from = builder.from;
       this._to = builder.to;
       this._thumbnailUrl = builder.thumbnailUrl;
       this._createdAt = builder.createdAt;
    }
 
    public get id(): number {
       return this._id;
    }
 
    public get accountId(): number {
       return this._accountId;
    }
 
    public get name(): string {
       return this._name;
    }
 
    public get type(): string {
       return this._type;
    }
 
    public get from(): Date {
       return this._from;
    }
 
    public get to(): Date {
       return this._to;
    }
 
    public get thumbnailUrl(): string | null {
       return this._thumbnailUrl;
    }
 
    public get createdAt(): Date {
       return this._createdAt;
    }
 
    public static get Builder(): AccountChartDaoBuilder {
       return new AccountChartDaoBuilder();
    }

    public static fromDaoInterface(item: AccountChartDaoInterface): AccountChartDao | null {
        if (isNotDefined(item)) {
            return null;
        }

        return this.Builder
            .withId(item.id)
            .withAccountId(item.accountId)
            .withName(item.name)
            .withType(item.type)
            .withFrom(item.from)
            .withTo(item.to)
            .withThumbnailUrl(item.thumbnailUrl)
            .withCreatedAt(item.createdAt)
            .build();
    }
 }
 
 class AccountChartDaoBuilder {
    private _id!: number;
    private _accountId!: number;
    private _name!: string;
    private _type!: string;
    private _from!: Date;
    private _to!: Date;
    private _thumbnailUrl!: string | null;
    private _createdAt!: Date;
 
    public withId(id: number): AccountChartDaoBuilder {
       this._id = id;
       return this;
    }
 
    public withAccountId(accountId: number): AccountChartDaoBuilder {
       this._accountId = accountId;
       return this;
    }
 
    public withName(name: string): AccountChartDaoBuilder {
       this._name = name;
       return this;
    }
 
    public withType(type: string): AccountChartDaoBuilder {
       this._type = type;
       return this;
    }
 
    public withFrom(from: Date): AccountChartDaoBuilder {
       this._from = from;
       return this;
    }
 
    public withTo(to: Date): AccountChartDaoBuilder {
       this._to = to;
       return this;
    }
 
    public withThumbnailUrl(thumbnailUrl: string | null): AccountChartDaoBuilder {
       this._thumbnailUrl = thumbnailUrl;
       return this;
    }
 
    public withCreatedAt(createdAt: Date): AccountChartDaoBuilder {
       this._createdAt = createdAt;
       return this;
    }
 
    public get id(): number {
       return this._id;
    }
 
    public get accountId(): number {
       return this._accountId;
    }
 
    public get name(): string {
       return this._name;
    }
 
    public get type(): string {
       return this._type;
    }
 
    public get from(): Date {
       return this._from;
    }
 
    public get to(): Date {
       return this._to;
    }
 
    public get thumbnailUrl(): string | null {
       return this._thumbnailUrl;
    }
 
    public get createdAt(): Date {
       return this._createdAt;
    }
 
    build(): AccountChartDao {
       return new AccountChartDao(this);
    }
 }