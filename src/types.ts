export type Category = "weekly" | "monthly";

export type Task = {
  id: string;
  name: string;
  description: string;
  category: Category;
  lastCompletedAt: string | null;
};
