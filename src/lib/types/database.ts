export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      andon_categories: {
        Row: {
          active: boolean
          color: string | null
          display_order: number
          escalate_manager_seconds: number
          escalate_owner_seconds: number | null
          icon: string | null
          id: string
          name: string
          slug: string
          stops_line: boolean
        }
        Insert: {
          active?: boolean
          color?: string | null
          display_order?: number
          escalate_manager_seconds?: number
          escalate_owner_seconds?: number | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          stops_line?: boolean
        }
        Update: {
          active?: boolean
          color?: string | null
          display_order?: number
          escalate_manager_seconds?: number
          escalate_owner_seconds?: number | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          stops_line?: boolean
        }
        Relationships: []
      }
      andon_pulls: {
        Row: {
          acknowledged_at: string | null
          category_id: string | null
          chain_id: string
          created_at: string
          escalated_manager_at: string | null
          escalated_owner_at: string | null
          id: string
          location_id: string
          note: string | null
          related_order_id: string | null
          resolved_at: string | null
          root_cause: string | null
          state: Database["public"]["Enums"]["andon_state"]
          station_id: string | null
          station_slug: Database["public"]["Enums"]["station_slug"] | null
          triggered_at: string
          triggered_by_employee_id: string | null
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          category_id?: string | null
          chain_id: string
          created_at?: string
          escalated_manager_at?: string | null
          escalated_owner_at?: string | null
          id?: string
          location_id: string
          note?: string | null
          related_order_id?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          state?: Database["public"]["Enums"]["andon_state"]
          station_id?: string | null
          station_slug?: Database["public"]["Enums"]["station_slug"] | null
          triggered_at?: string
          triggered_by_employee_id?: string | null
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          category_id?: string | null
          chain_id?: string
          created_at?: string
          escalated_manager_at?: string | null
          escalated_owner_at?: string | null
          id?: string
          location_id?: string
          note?: string | null
          related_order_id?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          state?: Database["public"]["Enums"]["andon_state"]
          station_id?: string | null
          station_slug?: Database["public"]["Enums"]["station_slug"] | null
          triggered_at?: string
          triggered_by_employee_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "andon_pulls_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "andon_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "andon_pulls_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_triggered_by_employee_id_fkey"
            columns: ["triggered_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      chains: {
        Row: {
          brand_color: string | null
          created_at: string
          currency: string
          id: string
          logo_url: string | null
          name: string
          settings: Json
          slug: string
          timezone: string
          updated_at: string
        }
        Insert: {
          brand_color?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json
          slug: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          brand_color?: string | null
          created_at?: string
          currency?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json
          slug?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          avg_ticket_cents: number
          customer_id: string
          favorite_product_id: string | null
          last_order_at: string | null
          lifecycle_stage: Database["public"]["Enums"]["customer_lifecycle"]
          ltv_percentile: number | null
          preferred_channel: Database["public"]["Enums"]["channel_slug"] | null
          preferred_hour: number | null
          total_orders: number
          total_revenue_cents: number
          updated_at: string
        }
        Insert: {
          avg_ticket_cents?: number
          customer_id: string
          favorite_product_id?: string | null
          last_order_at?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["customer_lifecycle"]
          ltv_percentile?: number | null
          preferred_channel?: Database["public"]["Enums"]["channel_slug"] | null
          preferred_hour?: number | null
          total_orders?: number
          total_revenue_cents?: number
          updated_at?: string
        }
        Update: {
          avg_ticket_cents?: number
          customer_id?: string
          favorite_product_id?: string | null
          last_order_at?: string | null
          lifecycle_stage?: Database["public"]["Enums"]["customer_lifecycle"]
          ltv_percentile?: number | null
          preferred_channel?: Database["public"]["Enums"]["channel_slug"] | null
          preferred_hour?: number | null
          total_orders?: number
          total_revenue_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_profiles_favorite_product_id_fkey"
            columns: ["favorite_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          chain_id: string
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          whatsapp_phone: string | null
        }
        Insert: {
          chain_id: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Update: {
          chain_id?: string
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_events: {
        Row: {
          chain_id: string
          created_at: string
          driver_external_id: string | null
          driver_name: string | null
          eta_seconds: number | null
          event_type: string
          id: string
          location_id: string
          order_id: string
          payload: Json
        }
        Insert: {
          chain_id: string
          created_at?: string
          driver_external_id?: string | null
          driver_name?: string | null
          eta_seconds?: number | null
          event_type: string
          id?: string
          location_id: string
          order_id: string
          payload?: Json
        }
        Update: {
          chain_id?: string
          created_at?: string
          driver_external_id?: string | null
          driver_name?: string | null
          eta_seconds?: number | null
          event_type?: string
          id?: string
          location_id?: string
          order_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_events_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "dispatch_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean
          avatar_url: string | null
          chain_id: string
          created_at: string
          default_station_slug:
            | Database["public"]["Enums"]["station_slug"]
            | null
          email: string | null
          first_name: string
          hired_at: string
          id: string
          last_name: string
          location_id: string
          notes: string | null
          phone: string | null
          pin_hash: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          chain_id: string
          created_at?: string
          default_station_slug?:
            | Database["public"]["Enums"]["station_slug"]
            | null
          email?: string | null
          first_name: string
          hired_at?: string
          id?: string
          last_name: string
          location_id: string
          notes?: string | null
          phone?: string | null
          pin_hash: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          chain_id?: string
          created_at?: string
          default_station_slug?:
            | Database["public"]["Enums"]["station_slug"]
            | null
          email?: string | null
          first_name?: string
          hired_at?: string
          id?: string
          last_name?: string
          location_id?: string
          notes?: string | null
          phone?: string | null
          pin_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      experiments_pdca: {
        Row: {
          act_decision: string | null
          chain_id: string
          check_result: Json | null
          closed_at: string | null
          created_at: string
          do_notes: string | null
          hypothesis_id: string | null
          id: string
          phase: string
          plan: Json | null
          started_at: string | null
          updated_at: string
        }
        Insert: {
          act_decision?: string | null
          chain_id: string
          check_result?: Json | null
          closed_at?: string | null
          created_at?: string
          do_notes?: string | null
          hypothesis_id?: string | null
          id?: string
          phase?: string
          plan?: Json | null
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          act_decision?: string | null
          chain_id?: string
          check_result?: Json | null
          closed_at?: string | null
          created_at?: string
          do_notes?: string | null
          hypothesis_id?: string | null
          id?: string
          phase?: string
          plan?: Json | null
          started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_pdca_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_pdca_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "kaizen_hypotheses"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          category: string | null
          chain_id: string
          created_at: string
          customer_id: string | null
          free_text: string | null
          id: string
          internal_case: boolean
          location_id: string
          order_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          responded_at: string | null
          root_cause: string | null
          routed_to_google: boolean
          star_rating: number | null
        }
        Insert: {
          category?: string | null
          chain_id: string
          created_at?: string
          customer_id?: string | null
          free_text?: string | null
          id?: string
          internal_case?: boolean
          location_id: string
          order_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          root_cause?: string | null
          routed_to_google?: boolean
          star_rating?: number | null
        }
        Update: {
          category?: string | null
          chain_id?: string
          created_at?: string
          customer_id?: string | null
          free_text?: string | null
          id?: string
          internal_case?: boolean
          location_id?: string
          order_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          root_cause?: string | null
          routed_to_google?: boolean
          star_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "feedback_responses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
        ]
      }
      hold_categories: {
        Row: {
          active: boolean
          default_window_seconds: number
          fifo_required: boolean
          haccp_critical: boolean
          id: string
          kind: Database["public"]["Enums"]["hold_kind"]
          name: string
        }
        Insert: {
          active?: boolean
          default_window_seconds: number
          fifo_required?: boolean
          haccp_critical?: boolean
          id?: string
          kind: Database["public"]["Enums"]["hold_kind"]
          name: string
        }
        Update: {
          active?: boolean
          default_window_seconds?: number
          fifo_required?: boolean
          haccp_critical?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["hold_kind"]
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          active: boolean
          allergens: string[]
          chain_id: string
          created_at: string
          id: string
          name: string
          slug: string
          unit: string
        }
        Insert: {
          active?: boolean
          allergens?: string[]
          chain_id: string
          created_at?: string
          id?: string
          name: string
          slug: string
          unit?: string
        }
        Update: {
          active?: boolean
          allergens?: string[]
          chain_id?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          chain_id: string
          created_at: string
          delta: number
          id: string
          inventory_item_id: string
          location_id: string
          lot_id: string | null
          reason: string
          related_order_id: string | null
        }
        Insert: {
          chain_id: string
          created_at?: string
          delta: number
          id?: string
          inventory_item_id: string
          location_id: string
          lot_id?: string | null
          reason: string
          related_order_id?: string | null
        }
        Update: {
          chain_id?: string
          created_at?: string
          delta?: number
          id?: string
          inventory_item_id?: string
          location_id?: string
          lot_id?: string | null
          reason?: string
          related_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "inventory_transactions_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
        ]
      }
      kaizen_hypotheses: {
        Row: {
          chain_id: string
          created_at: string
          generated_at: string
          hypothesis: string
          id: string
          metric_baseline: number | null
          metric_target: number | null
          outcome: string | null
          period_end: string | null
          period_start: string | null
          status: string
          success_metric: string | null
          suggested_action: string | null
          title: string
          updated_at: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          generated_at?: string
          hypothesis: string
          id?: string
          metric_baseline?: number | null
          metric_target?: number | null
          outcome?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          success_metric?: string | null
          suggested_action?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          generated_at?: string
          hypothesis?: string
          id?: string
          metric_baseline?: number | null
          metric_target?: number | null
          outcome?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          success_metric?: string | null
          suggested_action?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kaizen_hypotheses_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      location_product_availability: {
        Row: {
          available: boolean
          location_id: string
          product_id: string
          reason: string | null
          set_at: string
        }
        Insert: {
          available?: boolean
          location_id: string
          product_id: string
          reason?: string | null
          set_at?: string
        }
        Update: {
          available?: boolean
          location_id?: string
          product_id?: string
          reason?: string | null
          set_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_product_availability_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_product_availability_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "location_product_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          chain_id: string
          city: string | null
          created_at: string
          current_mode: Database["public"]["Enums"]["kitchen_mode"]
          has_dining_area: boolean
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          name: string
          settings: Json
          short_name: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          chain_id: string
          city?: string | null
          created_at?: string
          current_mode?: Database["public"]["Enums"]["kitchen_mode"]
          has_dining_area?: boolean
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          settings?: Json
          short_name?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          chain_id?: string
          city?: string | null
          created_at?: string
          current_mode?: Database["public"]["Enums"]["kitchen_mode"]
          has_dining_area?: boolean
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          settings?: Json
          short_name?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          chain_id: string
          created_at: string
          expires_at: string | null
          external_lot_code: string | null
          id: string
          inventory_item_id: string
          qty_initial: number | null
          qty_remaining: number | null
          received_at: string | null
          supplier: string | null
        }
        Insert: {
          chain_id: string
          created_at?: string
          expires_at?: string | null
          external_lot_code?: string | null
          id?: string
          inventory_item_id: string
          qty_initial?: number | null
          qty_remaining?: number | null
          received_at?: string | null
          supplier?: string | null
        }
        Update: {
          chain_id?: string
          created_at?: string
          expires_at?: string | null
          external_lot_code?: string | null
          id?: string
          inventory_item_id?: string
          qty_initial?: number | null
          qty_remaining?: number | null
          received_at?: string | null
          supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor_employee_id: string | null
          actor_user_id: string | null
          chain_id: string
          created_at: string
          event_type: string
          id: string
          order_id: string
          payload: Json
        }
        Insert: {
          actor_employee_id?: string | null
          actor_user_id?: string | null
          chain_id: string
          created_at?: string
          event_type: string
          id?: string
          order_id: string
          payload?: Json
        }
        Update: {
          actor_employee_id?: string | null
          actor_user_id?: string | null
          chain_id?: string
          created_at?: string
          event_type?: string
          id?: string
          order_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "order_events_actor_employee_id_fkey"
            columns: ["actor_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          chain_id: string
          created_at: string
          id: string
          is_veggie: boolean
          modifiers: Json
          notes: string | null
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string | null
          qty: number
          unit_price_cents: number
          uses_beyond_meat: boolean
        }
        Insert: {
          chain_id: string
          created_at?: string
          id?: string
          is_veggie?: boolean
          modifiers?: Json
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug?: string | null
          qty?: number
          unit_price_cents?: number
          uses_beyond_meat?: boolean
        }
        Update: {
          chain_id?: string
          created_at?: string
          id?: string
          is_veggie?: boolean
          modifiers?: Json
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string | null
          qty?: number
          unit_price_cents?: number
          uses_beyond_meat?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "order_items_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_station_tasks: {
        Row: {
          chain_id: string
          completed_at: string | null
          completed_by_employee_id: string | null
          created_at: string
          finish_target_at: string
          id: string
          location_id: string
          order_id: string
          order_item_id: string
          quality_deadline_at: string | null
          sequence: number
          sigma_seconds: number
          start_target_at: string
          started_at: string | null
          started_by_employee_id: string | null
          station_id: string | null
          station_slug: Database["public"]["Enums"]["station_slug"]
          status: Database["public"]["Enums"]["task_status"]
          target_seconds: number
          updated_at: string
        }
        Insert: {
          chain_id: string
          completed_at?: string | null
          completed_by_employee_id?: string | null
          created_at?: string
          finish_target_at: string
          id?: string
          location_id: string
          order_id: string
          order_item_id: string
          quality_deadline_at?: string | null
          sequence?: number
          sigma_seconds?: number
          start_target_at: string
          started_at?: string | null
          started_by_employee_id?: string | null
          station_id?: string | null
          station_slug: Database["public"]["Enums"]["station_slug"]
          status?: Database["public"]["Enums"]["task_status"]
          target_seconds: number
          updated_at?: string
        }
        Update: {
          chain_id?: string
          completed_at?: string | null
          completed_by_employee_id?: string | null
          created_at?: string
          finish_target_at?: string
          id?: string
          location_id?: string
          order_id?: string
          order_item_id?: string
          quality_deadline_at?: string | null
          sequence?: number
          sigma_seconds?: number
          start_target_at?: string
          started_at?: string | null
          started_by_employee_id?: string | null
          station_id?: string | null
          station_slug?: Database["public"]["Enums"]["station_slug"]
          status?: Database["public"]["Enums"]["task_status"]
          target_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_station_tasks_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_completed_by_employee_id_fkey"
            columns: ["completed_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "order_station_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_station_tasks_view"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "order_station_tasks_started_by_employee_id_fkey"
            columns: ["started_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "stations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          chain_id: string
          channel: Database["public"]["Enums"]["channel_slug"]
          complexity_score: number
          confirmed_at: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          dispatch_target_at: string | null
          dispatched_at: string | null
          driver_eta_seconds: number | null
          external_id: string | null
          id: string
          in_kitchen_at: string | null
          is_vip: boolean
          items_count: number
          location_id: string
          notes: string | null
          order_code: string
          placed_at: string
          ready_at: string | null
          sla_target_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at: string
        }
        Insert: {
          chain_id: string
          channel: Database["public"]["Enums"]["channel_slug"]
          complexity_score?: number
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          dispatch_target_at?: string | null
          dispatched_at?: string | null
          driver_eta_seconds?: number | null
          external_id?: string | null
          id?: string
          in_kitchen_at?: string | null
          is_vip?: boolean
          items_count?: number
          location_id: string
          notes?: string | null
          order_code: string
          placed_at?: string
          ready_at?: string | null
          sla_target_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Update: {
          chain_id?: string
          channel?: Database["public"]["Enums"]["channel_slug"]
          complexity_score?: number
          confirmed_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          dispatch_target_at?: string | null
          dispatched_at?: string | null
          driver_eta_seconds?: number | null
          external_id?: string | null
          id?: string
          in_kitchen_at?: string | null
          is_vip?: boolean
          items_count?: number
          location_id?: string
          notes?: string | null
          order_code?: string
          placed_at?: string
          ready_at?: string | null
          sla_target_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal_cents?: number
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      par_levels: {
        Row: {
          inventory_item_id: string
          location_id: string
          par_min: number
          par_target: number
          unit: string
          updated_at: string
        }
        Insert: {
          inventory_item_id: string
          location_id: string
          par_min?: number
          par_target?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          inventory_item_id?: string
          location_id?: string
          par_min?: number
          par_target?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "par_levels_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "par_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "par_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      product_categories: {
        Row: {
          active: boolean
          chain_id: string
          created_at: string
          display_order: number
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          chain_id: string
          created_at?: string
          display_order?: number
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          chain_id?: string
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      product_modifiers: {
        Row: {
          active: boolean
          chain_id: string
          created_at: string
          extra_seconds: number
          id: string
          name: string
          price_cents: number
          slug: string
          station_slug: Database["public"]["Enums"]["station_slug"] | null
        }
        Insert: {
          active?: boolean
          chain_id: string
          created_at?: string
          extra_seconds?: number
          id?: string
          name: string
          price_cents?: number
          slug: string
          station_slug?: Database["public"]["Enums"]["station_slug"] | null
        }
        Update: {
          active?: boolean
          chain_id?: string
          created_at?: string
          extra_seconds?: number
          id?: string
          name?: string
          price_cents?: number
          slug?: string
          station_slug?: Database["public"]["Enums"]["station_slug"] | null
        }
        Relationships: [
          {
            foreignKeyName: "product_modifiers_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      product_station_steps: {
        Row: {
          chain_id: string
          confidence_level: string
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quality_window_seconds: number | null
          sequence: number
          sigma_seconds: number
          station_slug: Database["public"]["Enums"]["station_slug"]
          target_seconds: number
          updated_at: string
        }
        Insert: {
          chain_id: string
          confidence_level?: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quality_window_seconds?: number | null
          sequence?: number
          sigma_seconds?: number
          station_slug: Database["public"]["Enums"]["station_slug"]
          target_seconds: number
          updated_at?: string
        }
        Update: {
          chain_id?: string
          confidence_level?: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quality_window_seconds?: number | null
          sequence?: number
          sigma_seconds?: number
          station_slug?: Database["public"]["Enums"]["station_slug"]
          target_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_station_steps_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_station_steps_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          allergens: string[]
          beyond_meat_option: boolean
          category_id: string | null
          chain_id: string
          complexity_factor: number
          cost_cents: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_veggie: boolean
          name: string
          price_cents: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          allergens?: string[]
          beyond_meat_option?: boolean
          category_id?: string | null
          chain_id: string
          complexity_factor?: number
          cost_cents?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_veggie?: boolean
          name: string
          price_cents: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          allergens?: string[]
          beyond_meat_option?: boolean
          category_id?: string | null
          chain_id?: string
          complexity_factor?: number
          cost_cents?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_veggie?: boolean
          name?: string
          price_cents?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_hold_batches: {
        Row: {
          chain_id: string
          created_at: string
          expires_at: string
          id: string
          kind: Database["public"]["Enums"]["hold_kind"]
          location_id: string
          notes: string | null
          prepared_at: string
          prepared_by_employee_id: string | null
          qty_discarded: number
          qty_initial: number
          qty_remaining: number
          status: string
          updated_at: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          expires_at: string
          id?: string
          kind: Database["public"]["Enums"]["hold_kind"]
          location_id: string
          notes?: string | null
          prepared_at?: string
          prepared_by_employee_id?: string | null
          qty_discarded?: number
          qty_initial: number
          qty_remaining: number
          status?: string
          updated_at?: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["hold_kind"]
          location_id?: string
          notes?: string | null
          prepared_at?: string
          prepared_by_employee_id?: string | null
          qty_discarded?: number
          qty_initial?: number
          qty_remaining?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_hold_batches_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_hold_batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_hold_batches_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "quality_hold_batches_prepared_by_employee_id_fkey"
            columns: ["prepared_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_assignments: {
        Row: {
          chain_id: string
          created_at: string
          employee_id: string
          id: string
          shift_id: string
          station_slug: Database["public"]["Enums"]["station_slug"] | null
        }
        Insert: {
          chain_id: string
          created_at?: string
          employee_id: string
          id?: string
          shift_id: string
          station_slug?: Database["public"]["Enums"]["station_slug"] | null
        }
        Update: {
          chain_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          shift_id?: string
          station_slug?: Database["public"]["Enums"]["station_slug"] | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_assignments_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          chain_id: string
          created_at: string
          ends_at: string
          id: string
          label: string | null
          location_id: string
          starts_at: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          ends_at: string
          id?: string
          label?: string | null
          location_id: string
          starts_at: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          label?: string | null
          location_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      skills_matrix: {
        Row: {
          assessed_at: string
          chain_id: string
          employee_id: string
          id: string
          level: number
          notes: string | null
          station_slug: Database["public"]["Enums"]["station_slug"]
        }
        Insert: {
          assessed_at?: string
          chain_id: string
          employee_id: string
          id?: string
          level: number
          notes?: string | null
          station_slug: Database["public"]["Enums"]["station_slug"]
        }
        Update: {
          assessed_at?: string
          chain_id?: string
          employee_id?: string
          id?: string
          level?: number
          notes?: string | null
          station_slug?: Database["public"]["Enums"]["station_slug"]
        }
        Relationships: [
          {
            foreignKeyName: "skills_matrix_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skills_matrix_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      stations: {
        Row: {
          chain_id: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          location_id: string
          name: string
          slug: Database["public"]["Enums"]["station_slug"]
          updated_at: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          location_id: string
          name: string
          slug: Database["public"]["Enums"]["station_slug"]
          updated_at?: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          location_id?: string
          name?: string
          slug?: Database["public"]["Enums"]["station_slug"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stations_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      temperature_readings: {
        Row: {
          chain_id: string
          device_label: string
          device_type: string
          id: string
          is_alert: boolean
          location_id: string
          recorded_at: string
          temperature_c: number
        }
        Insert: {
          chain_id: string
          device_label: string
          device_type: string
          id?: string
          is_alert?: boolean
          location_id: string
          recorded_at?: string
          temperature_c: number
        }
        Update: {
          chain_id?: string
          device_label?: string
          device_type?: string
          id?: string
          is_alert?: boolean
          location_id?: string
          recorded_at?: string
          temperature_c?: number
        }
        Relationships: [
          {
            foreignKeyName: "temperature_readings_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperature_readings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperature_readings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          chain_id: string | null
          created_at: string
          default_location_id: string | null
          full_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          chain_id?: string | null
          created_at?: string
          default_location_id?: string | null
          full_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          chain_id?: string | null
          created_at?: string
          default_location_id?: string | null
          full_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_default_location_id_fkey"
            columns: ["default_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_default_location_id_fkey"
            columns: ["default_location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          chain_id: string
          created_at: string
          id: string
          location_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          id?: string
          location_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          id?: string
          location_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          chain_id: string
          created_at: string
          direction: string
          from_phone: string | null
          id: string
          mode: string
          provider_message_id: string | null
          sent_at: string
          template_name: string | null
          thread_id: string | null
          to_phone: string | null
        }
        Insert: {
          body?: string | null
          chain_id: string
          created_at?: string
          direction: string
          from_phone?: string | null
          id?: string
          mode?: string
          provider_message_id?: string | null
          sent_at?: string
          template_name?: string | null
          thread_id?: string | null
          to_phone?: string | null
        }
        Update: {
          body?: string | null
          chain_id?: string
          created_at?: string
          direction?: string
          from_phone?: string | null
          id?: string
          mode?: string
          provider_message_id?: string | null
          sent_at?: string
          template_name?: string | null
          thread_id?: string | null
          to_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_threads: {
        Row: {
          chain_id: string
          created_at: string
          customer_id: string | null
          id: string
          last_message_at: string | null
          whatsapp_phone: string
        }
        Insert: {
          chain_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          whatsapp_phone: string
        }
        Update: {
          chain_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          whatsapp_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_threads_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_threads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_andon_pareto: {
        Row: {
          avg_resolution_sec: number | null
          category_name: string | null
          category_slug: string | null
          chain_id: string | null
          location_id: string | null
          pulls_30d: number | null
          resolved_30d: number | null
        }
        Relationships: [
          {
            foreignKeyName: "andon_pulls_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      mv_nps_by_location: {
        Row: {
          avg_rating: number | null
          chain_id: string | null
          day: string | null
          location_id: string | null
          nps: number | null
          pct_detractors: number | null
          pct_promoters: number | null
          responses: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      mv_station_stats_daily: {
        Row: {
          chain_id: string | null
          cpk_estimate: number | null
          day: string | null
          location_id: string | null
          mean_seconds: number | null
          sigma_seconds: number | null
          station_slug: Database["public"]["Enums"]["station_slug"] | null
          target_seconds_avg: number | null
          task_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_station_tasks_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      mv_throughput_hourly: {
        Row: {
          avg_complexity: number | null
          avg_door_to_door_sec: number | null
          chain_id: string | null
          delivered_count: number | null
          hour: string | null
          location_id: string | null
          orders_count: number | null
          revenue_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      order_station_tasks_view: {
        Row: {
          chain_id: string | null
          channel: Database["public"]["Enums"]["channel_slug"] | null
          completed_at: string | null
          complexity_score: number | null
          customer_name: string | null
          finish_target_at: string | null
          location_id: string | null
          modifiers: Json | null
          order_code: string | null
          order_id: string | null
          order_item_id: string | null
          product_name: string | null
          product_slug: string | null
          qty: number | null
          quality_deadline_at: string | null
          sigma_seconds: number | null
          sla_target_at: string | null
          start_target_at: string | null
          started_at: string | null
          station_slug: Database["public"]["Enums"]["station_slug"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          target_seconds: number | null
          task_id: string | null
          vip: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "order_station_tasks_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "order_station_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "v_active_orders_kitchen"
            referencedColumns: ["id"]
          },
        ]
      }
      v_active_orders_kitchen: {
        Row: {
          chain_id: string | null
          channel: Database["public"]["Enums"]["channel_slug"] | null
          complexity_score: number | null
          customer_name: string | null
          done_tasks: number | null
          id: string | null
          is_vip: boolean | null
          location_id: string | null
          order_code: string | null
          pending_tasks: number | null
          placed_at: string | null
          sla_remaining_sec: number | null
          sla_target_at: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_tasks: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      v_andon_pareto: {
        Row: {
          avg_resolution_sec: number | null
          category_name: string | null
          category_slug: string | null
          chain_id: string | null
          location_id: string | null
          pulls_30d: number | null
          resolved_30d: number | null
        }
        Relationships: [
          {
            foreignKeyName: "andon_pulls_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "andon_pulls_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      v_nps_by_location: {
        Row: {
          avg_rating: number | null
          chain_id: string | null
          day: string | null
          location_id: string | null
          nps: number | null
          pct_detractors: number | null
          pct_promoters: number | null
          responses: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      v_station_live_metrics: {
        Row: {
          eta_to_idle_sec: number | null
          location_id: string | null
          queue_depth: number | null
          station_slug: Database["public"]["Enums"]["station_slug"] | null
          utilization: number | null
        }
        Relationships: []
      }
      v_station_stats_daily: {
        Row: {
          chain_id: string | null
          cpk_estimate: number | null
          day: string | null
          location_id: string | null
          mean_seconds: number | null
          sigma_seconds: number | null
          station_slug: Database["public"]["Enums"]["station_slug"] | null
          target_seconds_avg: number | null
          task_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_station_tasks_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_station_tasks_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
      v_throughput_hourly: {
        Row: {
          avg_complexity: number | null
          avg_door_to_door_sec: number | null
          chain_id: string | null
          delivered_count: number | null
          hour: string | null
          location_id: string | null
          orders_count: number | null
          revenue_cents: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "v_station_live_metrics"
            referencedColumns: ["location_id"]
          },
        ]
      }
    }
    Functions: {
      andon_pull: {
        Args: {
          p_category_slug?: string
          p_employee_id: string
          p_location_id: string
          p_note?: string
          p_station_slug: Database["public"]["Enums"]["station_slug"]
        }
        Returns: {
          acknowledged_at: string | null
          category_id: string | null
          chain_id: string
          created_at: string
          escalated_manager_at: string | null
          escalated_owner_at: string | null
          id: string
          location_id: string
          note: string | null
          related_order_id: string | null
          resolved_at: string | null
          root_cause: string | null
          state: Database["public"]["Enums"]["andon_state"]
          station_id: string | null
          station_slug: Database["public"]["Enums"]["station_slug"] | null
          triggered_at: string
          triggered_by_employee_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "andon_pulls"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_chain_id: { Args: never; Returns: string }
      ensure_in_realtime: {
        Args: { _schema: string; _table: string }
        Returns: undefined
      }
      has_any_role: {
        Args: { _roles: Database["public"]["Enums"]["app_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      kds_complete_task: {
        Args: { p_employee_id: string; p_task_id: string }
        Returns: {
          chain_id: string
          completed_at: string | null
          completed_by_employee_id: string | null
          created_at: string
          finish_target_at: string
          id: string
          location_id: string
          order_id: string
          order_item_id: string
          quality_deadline_at: string | null
          sequence: number
          sigma_seconds: number
          start_target_at: string
          started_at: string | null
          started_by_employee_id: string | null
          station_id: string | null
          station_slug: Database["public"]["Enums"]["station_slug"]
          status: Database["public"]["Enums"]["task_status"]
          target_seconds: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "order_station_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      kds_start_task: {
        Args: { p_employee_id: string; p_task_id: string }
        Returns: {
          chain_id: string
          completed_at: string | null
          completed_by_employee_id: string | null
          created_at: string
          finish_target_at: string
          id: string
          location_id: string
          order_id: string
          order_item_id: string
          quality_deadline_at: string | null
          sequence: number
          sigma_seconds: number
          start_target_at: string
          started_at: string | null
          started_by_employee_id: string | null
          station_id: string | null
          station_slug: Database["public"]["Enums"]["station_slug"]
          status: Database["public"]["Enums"]["task_status"]
          target_seconds: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "order_station_tasks"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      place_order_with_items: {
        Args: {
          p_chain_id: string
          p_channel: Database["public"]["Enums"]["channel_slug"]
          p_customer_name: string
          p_customer_phone: string
          p_dispatch_target_at?: string
          p_driver_eta_seconds?: number
          p_external_id?: string
          p_is_vip?: boolean
          p_items: Json
          p_location_id: string
        }
        Returns: {
          chain_id: string
          channel: Database["public"]["Enums"]["channel_slug"]
          complexity_score: number
          confirmed_at: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          dispatch_target_at: string | null
          dispatched_at: string | null
          driver_eta_seconds: number | null
          external_id: string | null
          id: string
          in_kitchen_at: string | null
          is_vip: boolean
          items_count: number
          location_id: string
          notes: string | null
          order_code: string
          placed_at: string
          ready_at: string | null
          sla_target_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal_cents: number
          total_cents: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      refresh_all_mv: { Args: never; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      andon_state:
        | "open"
        | "acknowledged"
        | "escalated_manager"
        | "escalated_owner"
        | "resolved"
        | "cancelled"
      app_role:
        | "owner"
        | "ops_manager"
        | "manager"
        | "station_employee"
        | "viewer"
      channel_slug:
        | "rappi"
        | "pedidosya"
        | "salon"
        | "whatsapp"
        | "web"
        | "kiosk"
      customer_lifecycle:
        | "new"
        | "occasional"
        | "regular"
        | "vip"
        | "at_risk"
        | "lost"
      hold_kind:
        | "patty_cooked"
        | "caramelized_onion"
        | "blanched_fries"
        | "toasted_bun"
        | "assembled_burger"
      kitchen_mode: "normal" | "turbo" | "degraded" | "opening" | "closing"
      order_status:
        | "draft"
        | "confirmed"
        | "in_kitchen"
        | "ready"
        | "dispatched"
        | "delivered"
        | "cancelled"
      station_slug: "armado" | "plancha" | "freidora" | "despacho"
      task_status: "queued" | "in_progress" | "completed" | "skipped"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      andon_state: [
        "open",
        "acknowledged",
        "escalated_manager",
        "escalated_owner",
        "resolved",
        "cancelled",
      ],
      app_role: [
        "owner",
        "ops_manager",
        "manager",
        "station_employee",
        "viewer",
      ],
      channel_slug: ["rappi", "pedidosya", "salon", "whatsapp", "web", "kiosk"],
      customer_lifecycle: [
        "new",
        "occasional",
        "regular",
        "vip",
        "at_risk",
        "lost",
      ],
      hold_kind: [
        "patty_cooked",
        "caramelized_onion",
        "blanched_fries",
        "toasted_bun",
        "assembled_burger",
      ],
      kitchen_mode: ["normal", "turbo", "degraded", "opening", "closing"],
      order_status: [
        "draft",
        "confirmed",
        "in_kitchen",
        "ready",
        "dispatched",
        "delivered",
        "cancelled",
      ],
      station_slug: ["armado", "plancha", "freidora", "despacho"],
      task_status: ["queued", "in_progress", "completed", "skipped"],
    },
  },
} as const
