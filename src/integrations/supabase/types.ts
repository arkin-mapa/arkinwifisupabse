export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      credit_purchases: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["credit_purchase_status"] | null
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["credit_purchase_status"] | null
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["credit_purchase_status"] | null
          updated_at?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          id: string
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          id?: string
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["credit_transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      payment_method_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          method: Database["public"]["Enums"]["payment_method"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          method: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          method?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          duration: string
          id: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration: string
          id?: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          id?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          client_id: string
          created_at: string
          customer_name: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          plan_id: string | null
          quantity: number
          status: Database["public"]["Enums"]["purchase_status"] | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          customer_name: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          plan_id?: string | null
          quantity: number
          status?: Database["public"]["Enums"]["purchase_status"] | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          customer_name?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          plan_id?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["purchase_status"] | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      voucher_wallet: {
        Row: {
          client_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["purchase_status"] | null
          updated_at: string
          voucher_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["purchase_status"] | null
          updated_at?: string
          voucher_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["purchase_status"] | null
          updated_at?: string
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voucher_wallet_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          code: string
          created_at: string
          id: string
          is_copy: boolean | null
          original_voucher_id: string | null
          plan_id: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_copy?: boolean | null
          original_voucher_id?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_copy?: boolean | null
          original_voucher_id?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_original_voucher_id_fkey"
            columns: ["original_voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vouchers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_by_email: {
        Args: {
          user_email: string
        }
        Returns: string
      }
      handle_credit_payment_voucher_transfer: {
        Args: {
          p_client_id: string
          p_voucher_ids: string[]
        }
        Returns: undefined
      }
      transfer_credits: {
        Args: {
          from_client_id: string
          to_client_id: string
          transfer_amount: number
        }
        Returns: boolean
      }
      transfer_vouchers: {
        Args: {
          from_client_id: string
          to_client_id: string
          voucher_ids: string[]
        }
        Returns: boolean
      }
      transfer_vouchers_to_client: {
        Args: {
          p_client_id: string
          p_voucher_ids: string[]
        }
        Returns: undefined
      }
    }
    Enums: {
      credit_purchase_status: "pending" | "approved" | "rejected"
      credit_transaction_type: "deposit" | "purchase"
      payment_method: "cash" | "gcash" | "paymaya" | "credit"
      purchase_status: "pending" | "approved" | "rejected" | "cancelled"
      user_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
