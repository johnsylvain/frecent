export interface Settings {
  decay: string;
  weight: number;
}

export interface Item {
  meta: {
    visits: number;
    lastVisit: Date;
    weight: number;
  };
  data: object;
}

export interface Mappings {
  hour: number;
  day: number;
  week: number;
  month: number;
};
