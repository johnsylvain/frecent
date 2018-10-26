declare module "object-path-resolve";

declare module "frecent" {
  export interface Settings {
    decay: string;
    weight: number;
  }

  export class Frecent {
    constructor(settings: Settings);

    clean: boolean;
    items: Array<any>;
    settings: Settings;

    frecency(visits: number, timestamp: Date): number;
    get(includeMeta: boolean): this;
    load(items: Array<any>): this;
    visit(key: string, item: any): this;
  }

  export function fn(settings: Settings): Frecent;
}
