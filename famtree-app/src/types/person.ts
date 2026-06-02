export type LifeStatus = 'alive' | 'dead';

export interface Person {
  id: string;
  name: string;
  village: string;
  current_address: string;
  life_status: LifeStatus;
  notes: string;
  pos_x?: number;
  pos_y?: number;
}
