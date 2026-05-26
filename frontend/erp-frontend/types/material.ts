export type MaterialType = {
  id: number;
  name: string;
  width_cm: number;
  length_cm: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type MaterialTypePayload = {
  name: string;
  width_cm: number;
  length_cm: number;
  is_active?: boolean;
};