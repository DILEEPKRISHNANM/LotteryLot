import { clientGridColumnConfig } from "@/types/gridTypes";

export interface Client {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
  client_details: {
    id: string;
    display_text?: string;
    logo_url?: string;
  } | null;
}

export const clientGridConfig: clientGridColumnConfig[] = [
  {
    id: "slNo",
    accessorKey: "slNo",
    header: "slNo",
    type: "number",
    fallBackValue: 0,
  },
  {
    id: "username",
    accessorKey: "username",
    header: "Username",
    type: "text",
    fallBackValue: "-",
  },
  {
    id: "displayText",
    accessorKey: "client_details.display_text",
    header: "Display Text",
    type: "text",
    fallBackValue: "-",
  },
  {
    id: "isActive",
    accessorKey: "is_active",
    header: "Status",
    type: "boolean",
    fallBackValue: false,
  },
  {
    id: "createdAt",
    accessorKey: "created_at",
    header: "Created At",
    type: "date",
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: "Actions",
    type: "text",
  },
];
