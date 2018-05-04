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
  datum: object;
}
