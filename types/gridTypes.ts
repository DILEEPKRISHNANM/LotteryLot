export interface clientGridColumnConfig {
  id: string;
  accessorKey: string;
  header: string;
  type: "text" | "number" | "date" | "boolean" | "checkbox";
  fallBackValue?: string | number | boolean;
}
