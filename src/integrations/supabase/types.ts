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
      analyst_assignments: {
        Row: {
          alert_id: string | null
          analyst_id: string | null
          assigned_by: string | null
          created_at: string
          id: string
          notes: string | null
          resolution_quality_score: number | null
          resolution_time: unknown | null
          response_time: unknown | null
          status: string
          updated_at: string
        }
        Insert: {
          alert_id?: string | null
          analyst_id?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          resolution_quality_score?: number | null
          resolution_time?: unknown | null
          response_time?: unknown | null
          status?: string
          updated_at?: string
        }
        Update: {
          alert_id?: string | null
          analyst_id?: string | null
          assigned_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          resolution_quality_score?: number | null
          resolution_time?: unknown | null
          response_time?: unknown | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analyst_assignments_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "security_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      api_access_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: string
          request_body: Json | null
          request_timestamp: string | null
          response_time_ms: number | null
          status_code: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address: string
          request_body?: Json | null
          request_timestamp?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: string
          request_body?: Json | null
          request_timestamp?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          last_request_at: string | null
          requests_count: number | null
          updated_at: string | null
          user_id: string
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          last_request_at?: string | null
          requests_count?: number | null
          updated_at?: string | null
          user_id: string
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          last_request_at?: string | null
          requests_count?: number | null
          updated_at?: string | null
          user_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_calls_count: number
          created_at: string | null
          id: string
          period_end: string
          period_start: string
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_calls_count?: number
          created_at?: string | null
          id?: string
          period_end: string
          period_start: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_calls_count?: number
          created_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          event_type: string
          hash: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          resource_id: string
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          event_type: string
          hash: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          resource_id: string
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          event_type?: string
          hash?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          resource_id?: string
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["auth_event_type"]
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["auth_event_type"]
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["auth_event_type"]
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automated_responses: {
        Row: {
          action: Database["public"]["Enums"]["threat_response_action"]
          created_at: string | null
          custom_config: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          severity_threshold: string
          updated_at: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["threat_response_action"]
          created_at?: string | null
          custom_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          severity_threshold: string
          updated_at?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["threat_response_action"]
          created_at?: string | null
          custom_config?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          severity_threshold?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      churn_risk_metrics: {
        Row: {
          company_id: string
          created_at: string
          engagement_level: number | null
          features_used_count: number | null
          id: string
          last_activity_date: string | null
          payment_delays_count: number | null
          prediction_factors: Json | null
          risk_score: number
          support_tickets_count: number | null
          updated_at: string
          usage_trend: Json | null
        }
        Insert: {
          company_id: string
          created_at?: string
          engagement_level?: number | null
          features_used_count?: number | null
          id?: string
          last_activity_date?: string | null
          payment_delays_count?: number | null
          prediction_factors?: Json | null
          risk_score: number
          support_tickets_count?: number | null
          updated_at?: string
          usage_trend?: Json | null
        }
        Update: {
          company_id?: string
          created_at?: string
          engagement_level?: number | null
          features_used_count?: number | null
          id?: string
          last_activity_date?: string | null
          payment_delays_count?: number | null
          prediction_factors?: Json | null
          risk_score?: number
          support_tickets_count?: number | null
          updated_at?: string
          usage_trend?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "churn_risk_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          name: string
          size_range: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          size_range?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          size_range?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_ai_models: {
        Row: {
          active: boolean | null
          company_id: string
          created_at: string
          id: string
          last_trained_at: string | null
          model_metadata: Json
          model_parameters: Json | null
          negotiation_parameters: Json | null
          performance_metrics: Json | null
          sentiment_analysis_enabled: boolean | null
          training_history: Json[] | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          company_id: string
          created_at?: string
          id?: string
          last_trained_at?: string | null
          model_metadata?: Json
          model_parameters?: Json | null
          negotiation_parameters?: Json | null
          performance_metrics?: Json | null
          sentiment_analysis_enabled?: boolean | null
          training_history?: Json[] | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          company_id?: string
          created_at?: string
          id?: string
          last_trained_at?: string | null
          model_metadata?: Json
          model_parameters?: Json | null
          negotiation_parameters?: Json | null
          performance_metrics?: Json | null
          sentiment_analysis_enabled?: boolean | null
          training_history?: Json[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_ai_models_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_segments: {
        Row: {
          assigned_at: string
          company_id: string
          id: string
          metadata: Json | null
          score: number | null
          segment_id: string
        }
        Insert: {
          assigned_at?: string
          company_id: string
          id?: string
          metadata?: Json | null
          score?: number | null
          segment_id: string
        }
        Update: {
          assigned_at?: string
          company_id?: string
          id?: string
          metadata?: Json | null
          score?: number | null
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_segments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_segments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "customer_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_alerts: {
        Row: {
          alert_type: string
          content: Json
          created_at: string | null
          error_message: string | null
          id: string
          recipient: string
          sent_at: string | null
          status: string
          takedown_request_id: string | null
        }
        Insert: {
          alert_type: string
          content?: Json
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient: string
          sent_at?: string | null
          status?: string
          takedown_request_id?: string | null
        }
        Update: {
          alert_type?: string
          content?: Json
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          takedown_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_alerts_takedown_request_id_fkey"
            columns: ["takedown_request_id"]
            isOneToOne: false
            referencedRelation: "takedown_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_audit_logs: {
        Row: {
          action_type: string
          created_at: string
          details: Json
          document_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          details: Json
          document_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          details?: Json
          document_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_audit_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          created_at: string
          description: string | null
          detection_pattern: Json
          framework: string
          id: string
          rule_name: string
          severity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          detection_pattern: Json
          framework: string
          id?: string
          rule_name: string
          severity: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          detection_pattern?: Json
          framework?: string
          id?: string
          rule_name?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_scan_history: {
        Row: {
          changes_detected: boolean | null
          created_at: string | null
          document_id: string | null
          id: string
          new_score: number | null
          previous_score: number | null
          scan_date: string | null
          scan_details: Json | null
        }
        Insert: {
          changes_detected?: boolean | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          new_score?: number | null
          previous_score?: number | null
          scan_date?: string | null
          scan_details?: Json | null
        }
        Update: {
          changes_detected?: boolean | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          new_score?: number | null
          previous_score?: number | null
          scan_date?: string | null
          scan_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_scan_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_violations: {
        Row: {
          created_at: string
          details: Json
          detected_at: string
          document_id: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          rule_id: string | null
          severity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details: Json
          detected_at?: string
          document_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          severity: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json
          detected_at?: string
          document_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          rule_id?: string | null
          severity?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_violations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_violations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      content_fingerprints: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          filename: string
          fingerprint: string
          id: string
          metadata: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          filename: string
          fingerprint: string
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          filename?: string
          fingerprint?: string
          id?: string
          metadata?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      customer_segments: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          id: string
          name: string
          priority: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name: string
          priority?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          priority?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          company_id: string | null
          created_at: string
          deal_date: string
          final_price: number | null
          id: string
          initial_price: number
          model_predictions: Json | null
          negotiation_history: Json | null
          product_details: Json | null
          status: string
          training_features: Json | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          deal_date: string
          final_price?: number | null
          id?: string
          initial_price: number
          model_predictions?: Json | null
          negotiation_history?: Json | null
          product_details?: Json | null
          status: string
          training_features?: Json | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          deal_date?: string
          final_price?: number | null
          id?: string
          initial_price?: number
          model_predictions?: Json | null
          negotiation_history?: Json | null
          product_details?: Json | null
          status?: string
          training_features?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_signals: {
        Row: {
          id: string
          metadata: Json | null
          pricing_model_id: string | null
          signal_type: string
          signal_value: number
          timestamp: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          pricing_model_id?: string | null
          signal_type: string
          signal_value: number
          timestamp?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          pricing_model_id?: string | null
          signal_type?: string
          signal_value?: number
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_signals_pricing_model_id_fkey"
            columns: ["pricing_model_id"]
            isOneToOne: false
            referencedRelation: "pricing_models"
            referencedColumns: ["id"]
          },
        ]
      }
      document_ai_entities: {
        Row: {
          bounding_box: Json | null
          confidence: number
          content: string
          created_at: string
          document_analysis_id: string
          entity_type: string
          id: string
          page_number: number | null
        }
        Insert: {
          bounding_box?: Json | null
          confidence: number
          content: string
          created_at?: string
          document_analysis_id: string
          entity_type: string
          id?: string
          page_number?: number | null
        }
        Update: {
          bounding_box?: Json | null
          confidence?: number
          content?: string
          created_at?: string
          document_analysis_id?: string
          entity_type?: string
          id?: string
          page_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_ai_entities_document_analysis_id_fkey"
            columns: ["document_analysis_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis: {
        Row: {
          analyzed_by: string | null
          compliance_score: number
          content_hash: string
          created_at: string
          document_ai_analysis: Json | null
          document_name: string
          frameworks: Database["public"]["Enums"]["compliance_framework"][]
          id: string
          last_scan_at: string | null
          next_scan_at: string | null
          recommendations: Json | null
          scan_frequency: string | null
          updated_at: string
          violations: Json | null
        }
        Insert: {
          analyzed_by?: string | null
          compliance_score: number
          content_hash: string
          created_at?: string
          document_ai_analysis?: Json | null
          document_name: string
          frameworks: Database["public"]["Enums"]["compliance_framework"][]
          id?: string
          last_scan_at?: string | null
          next_scan_at?: string | null
          recommendations?: Json | null
          scan_frequency?: string | null
          updated_at?: string
          violations?: Json | null
        }
        Update: {
          analyzed_by?: string | null
          compliance_score?: number
          content_hash?: string
          created_at?: string
          document_ai_analysis?: Json | null
          document_name?: string
          frameworks?: Database["public"]["Enums"]["compliance_framework"][]
          id?: string
          last_scan_at?: string | null
          next_scan_at?: string | null
          recommendations?: Json | null
          scan_frequency?: string | null
          updated_at?: string
          violations?: Json | null
        }
        Relationships: []
      }
      document_comprehend_analysis: {
        Row: {
          created_at: string
          document_id: string | null
          dominant_language: number | null
          entities: Json | null
          id: string
          key_phrases: Json | null
          language_code: string | null
          pii_entities: Json | null
          sentiment: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          dominant_language?: number | null
          entities?: Json | null
          id?: string
          key_phrases?: Json | null
          language_code?: string | null
          pii_entities?: Json | null
          sentiment?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          dominant_language?: number | null
          entities?: Json | null
          id?: string
          key_phrases?: Json | null
          language_code?: string | null
          pii_entities?: Json | null
          sentiment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_comprehend_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          key_version: number
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          key_version: number
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          key_version?: number
          user_id?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          category: Database["public"]["Enums"]["integration_category"] | null
          config_schema: Json | null
          connection_status: boolean | null
          created_at: string
          credentials: Json
          id: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          last_error: string | null
          last_sync_at: string | null
          provider: Database["public"]["Enums"]["integration_provider"] | null
          sync_frequency: unknown | null
          updated_at: string
          webhook_events: Json | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["integration_category"] | null
          config_schema?: Json | null
          connection_status?: boolean | null
          created_at?: string
          credentials: Json
          id?: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          last_error?: string | null
          last_sync_at?: string | null
          provider?: Database["public"]["Enums"]["integration_provider"] | null
          sync_frequency?: unknown | null
          updated_at?: string
          webhook_events?: Json | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["integration_category"] | null
          config_schema?: Json | null
          connection_status?: boolean | null
          created_at?: string
          credentials?: Json
          id?: string
          integration_type?: Database["public"]["Enums"]["integration_type"]
          last_error?: string | null
          last_sync_at?: string | null
          provider?: Database["public"]["Enums"]["integration_provider"] | null
          sync_frequency?: unknown | null
          updated_at?: string
          webhook_events?: Json | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          billing_reason: string | null
          created_at: string
          currency: string
          id: string
          invoice_pdf_url: string | null
          status: string
          stripe_invoice_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          billing_reason?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf_url?: string | null
          status: string
          stripe_invoice_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          billing_reason?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_pdf_url?: string | null
          status?: string
          stripe_invoice_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      legal_notices: {
        Row: {
          content: Json
          created_at: string | null
          delivery_status: string | null
          id: string
          notice_type: Database["public"]["Enums"]["legal_notice_type"]
          offender_id: string | null
          response_details: Json | null
          response_received_at: string | null
          sent_at: string | null
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          notice_type: Database["public"]["Enums"]["legal_notice_type"]
          offender_id?: string | null
          response_details?: Json | null
          response_received_at?: string | null
          sent_at?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          delivery_status?: string | null
          id?: string
          notice_type?: Database["public"]["Enums"]["legal_notice_type"]
          offender_id?: string | null
          response_details?: Json | null
          response_received_at?: string | null
          sent_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_notices_offender_id_fkey"
            columns: ["offender_id"]
            isOneToOne: false
            referencedRelation: "repeat_offenders"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_scraping_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          result: Json | null
          status: string
          url: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          result?: Json | null
          status?: string
          url: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          result?: Json | null
          status?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      meeting_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          meeting_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          meeting_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          meeting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attachments_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meeting_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_note_vectors: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          note_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          note_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          note_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_note_vectors_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "meeting_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      meeting_screenshots: {
        Row: {
          created_at: string | null
          encrypted_ocr_text: string | null
          encrypted_summary: string | null
          encryption_iv: string | null
          encryption_key_id: string | null
          id: string
          image_path: string
          meeting_date: string | null
          ocr_text: string | null
          summary: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_ocr_text?: string | null
          encrypted_summary?: string | null
          encryption_iv?: string | null
          encryption_key_id?: string | null
          id?: string
          image_path: string
          meeting_date?: string | null
          ocr_text?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_ocr_text?: string | null
          encrypted_summary?: string | null
          encryption_iv?: string | null
          encryption_key_id?: string | null
          id?: string
          image_path?: string
          meeting_date?: string | null
          ocr_text?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          created_at: string
          id: string
          identifier: string | null
          is_enabled: boolean
          secret_key: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier?: string | null
          is_enabled?: boolean
          secret_key?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string | null
          is_enabled?: boolean
          secret_key?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mfa_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          user_id: string
          verification_code: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          user_id: string
          verification_code: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
          verification_code?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      negotiation_strategies: {
        Row: {
          base_discount: number
          counteroffer_strategy: Json | null
          created_at: string
          deal_size_range: string
          id: string
          max_discount: number
          updated_at: string
          urgency_level: string
        }
        Insert: {
          base_discount: number
          counteroffer_strategy?: Json | null
          created_at?: string
          deal_size_range: string
          id?: string
          max_discount: number
          updated_at?: string
          urgency_level: string
        }
        Update: {
          base_discount?: number
          counteroffer_strategy?: Json | null
          created_at?: string
          deal_size_range?: string
          id?: string
          max_discount?: number
          updated_at?: string
          urgency_level?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          event_type: string
          experiment_id: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          processed_at: string | null
          provider_type: string
          raw_event: Json | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          experiment_id?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          provider_type: string
          raw_event?: Json | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          experiment_id?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          provider_type?: string
          raw_event?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "pricing_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string
          card_last_four: string
          created_at: string
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          card_brand: string
          card_last_four: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          card_brand?: string
          card_last_four?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_providers: {
        Row: {
          configuration: Json
          created_at: string
          id: string
          is_active: boolean | null
          provider_type: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider_type: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          provider_type?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      piracy_detections: {
        Row: {
          automated_actions: Json[] | null
          confidence: number
          detected_at: string
          detection_details: Json | null
          detection_method:
            | Database["public"]["Enums"]["detection_method"]
            | null
          fingerprint_id: string | null
          id: string
          metadata: Json | null
          original_content_url: string | null
          risk_assessment: Json | null
          source_url: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          automated_actions?: Json[] | null
          confidence: number
          detected_at?: string
          detection_details?: Json | null
          detection_method?:
            | Database["public"]["Enums"]["detection_method"]
            | null
          fingerprint_id?: string | null
          id?: string
          metadata?: Json | null
          original_content_url?: string | null
          risk_assessment?: Json | null
          source_url: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          automated_actions?: Json[] | null
          confidence?: number
          detected_at?: string
          detection_details?: Json | null
          detection_method?:
            | Database["public"]["Enums"]["detection_method"]
            | null
          fingerprint_id?: string | null
          id?: string
          metadata?: Json | null
          original_content_url?: string | null
          risk_assessment?: Json | null
          source_url?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "piracy_detections_fingerprint_id_fkey"
            columns: ["fingerprint_id"]
            isOneToOne: false
            referencedRelation: "content_fingerprints"
            referencedColumns: ["id"]
          },
        ]
      }
      piracy_site_scans: {
        Row: {
          completed_at: string | null
          created_at: string | null
          detected_links: Json | null
          error_message: string | null
          id: string
          metadata: Json | null
          priority: number | null
          scan_status: string
          scan_type: string
          url: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          detected_links?: Json | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          priority?: number | null
          scan_status?: string
          scan_type?: string
          url: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          detected_links?: Json | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          priority?: number | null
          scan_status?: string
          scan_type?: string
          url?: string
        }
        Relationships: []
      }
      playbook_actions: {
        Row: {
          action_config: Json
          action_type: Database["public"]["Enums"]["security_action_type"]
          created_at: string | null
          execution_order: number
          id: string
          playbook_id: string | null
          updated_at: string | null
        }
        Insert: {
          action_config?: Json
          action_type: Database["public"]["Enums"]["security_action_type"]
          created_at?: string | null
          execution_order: number
          id?: string
          playbook_id?: string | null
          updated_at?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: Database["public"]["Enums"]["security_action_type"]
          created_at?: string | null
          execution_order?: number
          id?: string
          playbook_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_actions_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "security_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      price_adjustments: {
        Row: {
          adjustment_reason: string | null
          created_at: string
          demand_signals: Json | null
          id: string
          new_price: number
          previous_price: number
          pricing_model_id: string | null
        }
        Insert: {
          adjustment_reason?: string | null
          created_at?: string
          demand_signals?: Json | null
          id?: string
          new_price: number
          previous_price: number
          pricing_model_id?: string | null
        }
        Update: {
          adjustment_reason?: string | null
          created_at?: string
          demand_signals?: Json | null
          id?: string
          new_price?: number
          previous_price?: number
          pricing_model_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_adjustments_pricing_model_id_fkey"
            columns: ["pricing_model_id"]
            isOneToOne: false
            referencedRelation: "pricing_models"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_experiment_users: {
        Row: {
          conversion_status: string | null
          conversion_value: number | null
          created_at: string
          experiment_id: string | null
          id: string
          user_id: string | null
          variant: string
        }
        Insert: {
          conversion_status?: string | null
          conversion_value?: number | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          user_id?: string | null
          variant: string
        }
        Update: {
          conversion_status?: string | null
          conversion_value?: number | null
          created_at?: string
          experiment_id?: string | null
          id?: string
          user_id?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_experiment_users_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "pricing_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_experiments: {
        Row: {
          confidence_level: number | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          payment_config: Json | null
          payment_provider_id: string | null
          results: Json | null
          sample_size: number | null
          start_date: string
          status: string
          target_metrics: Json
          updated_at: string
          variants: Json
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          payment_config?: Json | null
          payment_provider_id?: string | null
          results?: Json | null
          sample_size?: number | null
          start_date: string
          status?: string
          target_metrics: Json
          updated_at?: string
          variants: Json
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          payment_config?: Json | null
          payment_provider_id?: string | null
          results?: Json | null
          sample_size?: number | null
          start_date?: string
          status?: string
          target_metrics?: Json
          updated_at?: string
          variants?: Json
        }
        Relationships: [
          {
            foreignKeyName: "pricing_experiments_payment_provider_id_fkey"
            columns: ["payment_provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_models: {
        Row: {
          adjustment_frequency: unknown | null
          base_price: number
          configuration: Json | null
          created_at: string
          current_price: number
          id: string
          last_adjusted_at: string | null
          max_price: number
          min_price: number
          model_type: Database["public"]["Enums"]["pricing_model_type"]
          name: string
          updated_at: string
        }
        Insert: {
          adjustment_frequency?: unknown | null
          base_price: number
          configuration?: Json | null
          created_at?: string
          current_price: number
          id?: string
          last_adjusted_at?: string | null
          max_price: number
          min_price: number
          model_type: Database["public"]["Enums"]["pricing_model_type"]
          name: string
          updated_at?: string
        }
        Update: {
          adjustment_frequency?: unknown | null
          base_price?: number
          configuration?: Json | null
          created_at?: string
          current_price?: number
          id?: string
          last_adjusted_at?: string | null
          max_price?: number
          min_price?: number
          model_type?: Database["public"]["Enums"]["pricing_model_type"]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_provider: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          mfa_enabled: boolean | null
          mfa_type: string | null
          organization: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          website: string | null
        }
        Insert: {
          auth_provider?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          mfa_enabled?: boolean | null
          mfa_type?: string | null
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          auth_provider?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          mfa_enabled?: boolean | null
          mfa_type?: string | null
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          ai_recommendations: Json | null
          confidence_score: number | null
          content: Json | null
          created_at: string
          deal_id: string | null
          id: string
          predicted_customer_reaction: string | null
          rationale: string | null
          status: string
          suggested_price: number
          updated_at: string
        }
        Insert: {
          ai_recommendations?: Json | null
          confidence_score?: number | null
          content?: Json | null
          created_at?: string
          deal_id?: string | null
          id?: string
          predicted_customer_reaction?: string | null
          rationale?: string | null
          status: string
          suggested_price: number
          updated_at?: string
        }
        Update: {
          ai_recommendations?: Json | null
          confidence_score?: number | null
          content?: Json | null
          created_at?: string
          deal_id?: string | null
          id?: string
          predicted_customer_reaction?: string | null
          rationale?: string | null
          status?: string
          suggested_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      repeat_offenders: {
        Row: {
          created_at: string | null
          domain: string
          first_detected_at: string | null
          id: string
          last_detected_at: string | null
          risk_score: number | null
          status: string | null
          updated_at: string | null
          violation_count: number | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          first_detected_at?: string | null
          id?: string
          last_detected_at?: string | null
          risk_score?: number | null
          status?: string | null
          updated_at?: string | null
          violation_count?: number | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          first_detected_at?: string | null
          id?: string
          last_detected_at?: string | null
          risk_score?: number | null
          status?: string | null
          updated_at?: string | null
          violation_count?: number | null
        }
        Relationships: []
      }
      response_logs: {
        Row: {
          action_details: Json | null
          action_taken: Database["public"]["Enums"]["threat_response_action"]
          alert_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          response_id: string | null
          success: boolean
        }
        Insert: {
          action_details?: Json | null
          action_taken: Database["public"]["Enums"]["threat_response_action"]
          alert_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          response_id?: string | null
          success: boolean
        }
        Update: {
          action_details?: Json | null
          action_taken?: Database["public"]["Enums"]["threat_response_action"]
          alert_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          response_id?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "response_logs_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "security_alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_logs_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "automated_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permissions: Database["public"]["Enums"]["permission"][]
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permissions: Database["public"]["Enums"]["permission"][]
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Database["public"]["Enums"]["permission"][]
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          ai_risk_score: number | null
          assigned_to: string | null
          attack_type: string | null
          compliance_tags: string[] | null
          created_at: string
          description: string | null
          destination_ip: string | null
          escalation_level: string | null
          expected_resolution_time: unknown | null
          false_positive_likelihood: number | null
          id: string
          impact_assessment: Json | null
          mitigation_steps: Json | null
          priority: number | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          source_ip: string | null
          status: Database["public"]["Enums"]["alert_status"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_risk_score?: number | null
          assigned_to?: string | null
          attack_type?: string | null
          compliance_tags?: string[] | null
          created_at?: string
          description?: string | null
          destination_ip?: string | null
          escalation_level?: string | null
          expected_resolution_time?: unknown | null
          false_positive_likelihood?: number | null
          id?: string
          impact_assessment?: Json | null
          mitigation_steps?: Json | null
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          source_ip?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_risk_score?: number | null
          assigned_to?: string | null
          attack_type?: string | null
          compliance_tags?: string[] | null
          created_at?: string
          description?: string | null
          destination_ip?: string | null
          escalation_level?: string | null
          expected_resolution_time?: unknown | null
          false_positive_likelihood?: number | null
          id?: string
          impact_assessment?: Json | null
          mitigation_steps?: Json | null
          priority?: number | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          source_ip?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action_type: string
          affected_systems: string[] | null
          alert_id: string | null
          compliance_category: string | null
          created_at: string
          details: Json
          id: string
          performed_by: string | null
        }
        Insert: {
          action_type: string
          affected_systems?: string[] | null
          alert_id?: string | null
          compliance_category?: string | null
          created_at?: string
          details?: Json
          id?: string
          performed_by?: string | null
        }
        Update: {
          action_type?: string
          affected_systems?: string[] | null
          alert_id?: string | null
          compliance_category?: string | null
          created_at?: string
          details?: Json
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_logs_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "security_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      security_incidents: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json
          playbook_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          trigger_type: Database["public"]["Enums"]["security_playbook_trigger"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json
          playbook_id?: string | null
          resolved_at?: string | null
          severity: string
          status: string
          trigger_type: Database["public"]["Enums"]["security_playbook_trigger"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json
          playbook_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          trigger_type?: Database["public"]["Enums"]["security_playbook_trigger"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_incidents_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "security_playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      security_playbooks: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          severity: string
          trigger_type: Database["public"]["Enums"]["security_playbook_trigger"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          severity: string
          trigger_type: Database["public"]["Enums"]["security_playbook_trigger"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          severity?: string
          trigger_type?: Database["public"]["Enums"]["security_playbook_trigger"]
          updated_at?: string | null
        }
        Relationships: []
      }
      siem_configurations: {
        Row: {
          api_key: string
          created_at: string | null
          endpoint_url: string
          id: string
          is_active: boolean | null
          platform: Database["public"]["Enums"]["siem_platform_type"]
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          endpoint_url: string
          id?: string
          is_active?: boolean | null
          platform: Database["public"]["Enums"]["siem_platform_type"]
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          endpoint_url?: string
          id?: string
          is_active?: boolean | null
          platform?: Database["public"]["Enums"]["siem_platform_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      takedown_requests: {
        Row: {
          alert_sent: boolean | null
          compliance_notes: string | null
          compliance_report: Json | null
          compliance_status: string | null
          detection_id: string | null
          id: string
          last_action_at: string | null
          notes: string | null
          platform: string
          resolved_at: string | null
          status: string | null
          submitted_at: string
        }
        Insert: {
          alert_sent?: boolean | null
          compliance_notes?: string | null
          compliance_report?: Json | null
          compliance_status?: string | null
          detection_id?: string | null
          id?: string
          last_action_at?: string | null
          notes?: string | null
          platform: string
          resolved_at?: string | null
          status?: string | null
          submitted_at?: string
        }
        Update: {
          alert_sent?: boolean | null
          compliance_notes?: string | null
          compliance_report?: Json | null
          compliance_status?: string | null
          detection_id?: string | null
          id?: string
          last_action_at?: string | null
          notes?: string | null
          platform?: string
          resolved_at?: string | null
          status?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "takedown_requests_detection_id_fkey"
            columns: ["detection_id"]
            isOneToOne: false
            referencedRelation: "piracy_detections"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          metadata: Json | null
          payment_method_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_method_id?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          metadata?: Json | null
          payment_method_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          invite_sent_date: string | null
          metadata: Json | null
          name: string | null
          signup_date: string
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          invite_sent_date?: string | null
          metadata?: Json | null
          name?: string | null
          signup_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          invite_sent_date?: string | null
          metadata?: Json | null
          name?: string | null
          signup_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_configurations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          type: string
          updated_at: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          type: string
          updated_at?: string
          user_id: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          type?: string
          updated_at?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      compliance_reports: {
        Row: {
          compliance_status: string | null
          latest_action: string | null
          oldest_case: string | null
          pending_alerts: number | null
          platform: string | null
          resolved_cases: number | null
          success_rate: number | null
          total_cases: number | null
        }
        Relationships: []
      }
      piracy_statistics: {
        Row: {
          pending_takedowns: number | null
          success_rate: number | null
          total_piracy_cases: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      check_api_usage_limits: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      check_document_analysis_rate_limit: {
        Args: {
          p_user_id: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_user_id: string
          p_ip_address: string
          p_window_minutes?: number
          p_max_requests?: number
        }
        Returns: boolean
      }
      generate_log_hash: {
        Args: {
          p_event_type: string
          p_user_id: string
          p_resource_type: string
          p_resource_id: string
          p_action: string
          p_old_data: Json
          p_new_data: Json
          p_metadata: Json
          p_ip_address: string
          p_user_agent: string
          p_created_at: string
        }
        Returns: string
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_meeting_notes: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          note_id: string
          content: string
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      verify_audit_log_chain: {
        Args: Record<PropertyKey, never>
        Returns: {
          log_id: string
          is_valid: boolean
          error_message: string
        }[]
      }
      verify_audit_logs: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      alert_severity: "low" | "medium" | "high" | "critical"
      alert_status:
        | "new"
        | "investigating"
        | "mitigated"
        | "false_positive"
        | "resolved"
      app_role: "admin" | "compliance_officer" | "auditor" | "viewer"
      auth_event_type:
        | "login_success"
        | "login_failure"
        | "logout"
        | "token_refresh"
        | "mfa_success"
        | "mfa_failure"
        | "session_expired"
        | "suspicious_activity"
      compliance_framework: "GDPR" | "HIPAA" | "SOC2"
      content_type: "video" | "audio" | "image"
      detection_method:
        | "fingerprint"
        | "web_scan"
        | "text_recognition"
        | "honeypot"
      integration_category: "siem" | "cloud" | "identity"
      integration_provider:
        | "splunk"
        | "datadog"
        | "aws_security_hub"
        | "aws"
        | "azure"
        | "google_cloud"
        | "okta"
        | "auth0"
      integration_type: "salesforce" | "hubspot" | "zoho"
      legal_notice_type:
        | "warning"
        | "cease_and_desist"
        | "dmca_takedown"
        | "legal_action"
      permission:
        | "manage_users"
        | "manage_projects"
        | "view_all_projects"
        | "edit_vfx"
        | "edit_sound"
        | "view_analytics"
        | "manage_team"
        | "upload_assets"
        | "download_assets"
        | "comment"
      permission_type:
        | "view:users"
        | "manage:users"
        | "view:compliance"
        | "manage:compliance"
        | "view:alerts"
        | "manage:alerts"
        | "view:reports"
        | "generate:reports"
        | "view:ai_insights"
        | "manage:ai_monitoring"
      pricing_model_type: "fixed" | "usage_based" | "tiered" | "dynamic"
      security_action_type:
        | "block_access"
        | "notify_security"
        | "increase_monitoring"
        | "require_mfa"
        | "lock_account"
        | "log_incident"
      security_playbook_trigger:
        | "pii_detected"
        | "unauthorized_access"
        | "sensitive_data_access"
        | "multiple_failed_logins"
      siem_platform_type: "splunk" | "qradar" | "sentinel" | "arcsight"
      subscription_tier: "free" | "pro" | "enterprise"
      threat_response_action: "block_ip" | "lock_account" | "send_alert"
      user_role:
        | "analyst"
        | "manager"
        | "compliance_officer"
        | "admin"
        | "freelancer"
        | "director"
        | "vfx_artist"
        | "sound_engineer"
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
