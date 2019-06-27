declare module "object-path-resolve";

declare namespace frecent {
  interface Settings {
    decay: string;
    weight: number;
  }
  class Frecent {
    public constructor(settings: Settings);

    public items: any[];
    public settings: Settings;

    private frecency(visits: number, timestamp: Date): number;
    public get(includeMeta?: boolean): this;
    public load(items: any[]): this;
    public visit(predicate: (item: any) => boolean): this;
  }
}

declare function frecent(settings: frecent.Settings): frecent.Frecent;
