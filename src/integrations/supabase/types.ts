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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      claro_audit_log: {
        Row: {
          action: string
          actor_address: string | null
          amount_avax: number | null
          amount_usd: number | null
          id: string
          ip_hash: string | null
          metadata: Json | null
          occurred_at: string | null
          org_contract: string
          target_address: string | null
          tx_hash: string | null
        }
        Insert: {
          action: string
          actor_address?: string | null
          amount_avax?: number | null
          amount_usd?: number | null
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          occurred_at?: string | null
          org_contract: string
          target_address?: string | null
          tx_hash?: string | null
        }
        Update: {
          action?: string
          actor_address?: string | null
          amount_avax?: number | null
          amount_usd?: number | null
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          occurred_at?: string | null
          org_contract?: string
          target_address?: string | null
          tx_hash?: string | null
        }
        Relationships: []
      }
      claro_documents: {
        Row: {
          created_at: string | null
          description: string | null
          doc_type: string | null
          file_mime_type: string | null
          file_size_bytes: number | null
          file_url: string
          id: string
          ipfs_hash: string | null
          is_public: boolean | null
          milestone_id: string | null
          org_contract: string
          project_id: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          file_mime_type?: string | null
          file_size_bytes?: number | null
          file_url: string
          id?: string
          ipfs_hash?: string | null
          is_public?: boolean | null
          milestone_id?: string | null
          org_contract: string
          project_id?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          file_mime_type?: string | null
          file_size_bytes?: number | null
          file_url?: string
          id?: string
          ipfs_hash?: string | null
          is_public?: boolean | null
          milestone_id?: string | null
          org_contract?: string
          project_id?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_documents_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "claro_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claro_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claro_donations: {
        Row: {
          amount_avax: number
          amount_usd: number | null
          created_at: string | null
          donated_at: string | null
          donor_address: string
          donor_email: string | null
          id: string
          is_anonymous: boolean | null
          message: string | null
          onchain_project_id: string | null
          org_contract: string
          project_id: string | null
          tx_hash: string | null
        }
        Insert: {
          amount_avax: number
          amount_usd?: number | null
          created_at?: string | null
          donated_at?: string | null
          donor_address: string
          donor_email?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          onchain_project_id?: string | null
          org_contract: string
          project_id?: string | null
          tx_hash?: string | null
        }
        Update: {
          amount_avax?: number
          amount_usd?: number | null
          created_at?: string | null
          donated_at?: string | null
          donor_address?: string
          donor_email?: string | null
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          onchain_project_id?: string | null
          org_contract?: string
          project_id?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "claro_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_org_transparency"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_public_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_transparency_score"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claro_donations_tx_hash_fkey"
            columns: ["tx_hash"]
            isOneToOne: false
            referencedRelation: "claro_transactions"
            referencedColumns: ["tx_hash"]
          },
        ]
      }
      claro_impact_metrics: {
        Row: {
          created_at: string | null
          evidence_url: string | null
          id: string
          is_public: boolean | null
          metric_name: string
          metric_unit: string | null
          metric_value: number
          org_contract: string
          period_end: string | null
          period_start: string | null
          project_id: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          evidence_url?: string | null
          id?: string
          is_public?: boolean | null
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          org_contract: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          evidence_url?: string | null
          id?: string
          is_public?: boolean | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          org_contract?: string
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_impact_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claro_milestones: {
        Row: {
          completed_date: string | null
          created_at: string | null
          description: string | null
          evidence_type: string | null
          evidence_url: string | null
          id: string
          is_public: boolean | null
          org_contract: string
          project_id: string
          sort_order: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
          verified_by: string | null
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type?: string | null
          evidence_url?: string | null
          id?: string
          is_public?: boolean | null
          org_contract: string
          project_id: string
          sort_order?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          description?: string | null
          evidence_type?: string | null
          evidence_url?: string | null
          id?: string
          is_public?: boolean | null
          org_contract?: string
          project_id?: string
          sort_order?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claro_organizations: {
        Row: {
          contact_email: string | null
          contract_address: string
          country: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          external_id: string | null
          external_source: string | null
          factory_address: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          org_type: string | null
          owner_address: string
          social_instagram: string | null
          social_twitter: string | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          contact_email?: string | null
          contract_address: string
          country: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          external_source?: string | null
          factory_address: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          org_type?: string | null
          owner_address: string
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          contact_email?: string | null
          contract_address?: string
          country?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          external_source?: string | null
          factory_address?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          org_type?: string | null
          owner_address?: string
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      claro_payment_justifications: {
        Row: {
          approved_by: string | null
          created_at: string | null
          document_id: string | null
          id: string
          justification: string
          org_contract: string
          tx_hash: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          justification: string
          org_contract: string
          tx_hash?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          justification?: string
          org_contract?: string
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_payment_justifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "claro_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claro_payment_justifications_tx_hash_fkey"
            columns: ["tx_hash"]
            isOneToOne: false
            referencedRelation: "claro_transactions"
            referencedColumns: ["tx_hash"]
          },
        ]
      }
      claro_project_updates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          org_contract: string
          project_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          org_contract: string
          project_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          org_contract?: string
          project_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claro_projects: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          external_id: string | null
          external_source: string | null
          github_url: string | null
          hypercert_tx_hash: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          last_synced_at: string | null
          name: string
          onchain_project_id: string | null
          org_contract: string
          start_date: string | null
          status: string | null
          target_usd: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          external_source?: string | null
          github_url?: string | null
          hypercert_tx_hash?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_synced_at?: string | null
          name: string
          onchain_project_id?: string | null
          org_contract: string
          start_date?: string | null
          status?: string | null
          target_usd?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          external_id?: string | null
          external_source?: string | null
          github_url?: string | null
          hypercert_tx_hash?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          last_synced_at?: string | null
          name?: string
          onchain_project_id?: string | null
          org_contract?: string
          start_date?: string | null
          status?: string | null
          target_usd?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_projects_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "claro_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_projects_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_org_transparency"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_projects_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_public_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_projects_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_transparency_score"
            referencedColumns: ["contract_address"]
          },
        ]
      }
      claro_reports: {
        Row: {
          created_at: string | null
          generated_at: string | null
          id: string
          is_public: boolean | null
          language: string | null
          model_used: string | null
          org_contract: string
          project_id: string | null
          report_text: string
          total_avax: number | null
          total_usd: number | null
          tx_count: number | null
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          is_public?: boolean | null
          language?: string | null
          model_used?: string | null
          org_contract: string
          project_id?: string | null
          report_text: string
          total_avax?: number | null
          total_usd?: number | null
          tx_count?: number | null
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          id?: string
          is_public?: boolean | null
          language?: string | null
          model_used?: string | null
          org_contract?: string
          project_id?: string | null
          report_text?: string
          total_avax?: number | null
          total_usd?: number | null
          tx_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_reports_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "claro_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_reports_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_org_transparency"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_reports_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_public_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_reports_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_transparency_score"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claro_sync_log: {
        Row: {
          error_message: string | null
          id: string
          org_contract: string
          records_synced: number | null
          source: string
          status: string | null
          sync_type: string
          synced_at: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          org_contract: string
          records_synced?: number | null
          source: string
          status?: string | null
          sync_type: string
          synced_at?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          org_contract?: string
          records_synced?: number | null
          source?: string
          status?: string | null
          sync_type?: string
          synced_at?: string | null
        }
        Relationships: []
      }
      claro_team_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          name: string
          org_contract: string
          role: string | null
          sort_order: number | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          org_contract: string
          role?: string | null
          sort_order?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          org_contract?: string
          role?: string | null
          sort_order?: number | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_team_members_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "claro_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_team_members_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_org_transparency"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_team_members_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_public_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_team_members_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_transparency_score"
            referencedColumns: ["contract_address"]
          },
        ]
      }
      claro_testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          is_public: boolean | null
          is_verified: boolean | null
          org_contract: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_name: string
          author_role?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          is_verified?: boolean | null
          org_contract: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_name?: string
          author_role?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          is_verified?: boolean | null
          org_contract?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_testimonials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claro_transactions: {
        Row: {
          amount_avax: number | null
          amount_usd: number | null
          block_number: number | null
          block_timestamp: string | null
          contract_address: string
          created_at: string | null
          employee_address: string | null
          employee_name: string | null
          from_address: string | null
          id: string
          network: string | null
          onchain_project_id: string | null
          org_contract: string | null
          project_id: string | null
          synced_at: string | null
          to_address: string | null
          tx_hash: string
          tx_type: string | null
        }
        Insert: {
          amount_avax?: number | null
          amount_usd?: number | null
          block_number?: number | null
          block_timestamp?: string | null
          contract_address: string
          created_at?: string | null
          employee_address?: string | null
          employee_name?: string | null
          from_address?: string | null
          id?: string
          network?: string | null
          onchain_project_id?: string | null
          org_contract?: string | null
          project_id?: string | null
          synced_at?: string | null
          to_address?: string | null
          tx_hash: string
          tx_type?: string | null
        }
        Update: {
          amount_avax?: number | null
          amount_usd?: number | null
          block_number?: number | null
          block_timestamp?: string | null
          contract_address?: string
          created_at?: string | null
          employee_address?: string | null
          employee_name?: string | null
          from_address?: string | null
          id?: string
          network?: string | null
          onchain_project_id?: string | null
          org_contract?: string | null
          project_id?: string | null
          synced_at?: string | null
          to_address?: string | null
          tx_hash?: string
          tx_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_transactions_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "claro_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_transactions_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_org_transparency"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_transactions_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_public_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_transactions_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_transparency_score"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_org_transparency: {
        Row: {
          active_projects: number | null
          contract_address: string | null
          country: string | null
          description: string | null
          documents_count: number | null
          last_transaction_at: string | null
          milestones_completed: number | null
          milestones_total: number | null
          name: string | null
          org_type: string | null
          total_disbursed_avax: number | null
          total_disbursed_usd: number | null
          total_donors: number | null
          total_projects: number | null
          total_received_avax: number | null
          total_received_usd: number | null
          total_transactions: number | null
          verified: boolean | null
          verified_at: string | null
          website: string | null
        }
        Relationships: []
      }
      v_public_donations: {
        Row: {
          amount_avax: number | null
          amount_usd: number | null
          created_at: string | null
          donated_at: string | null
          donor_address: string | null
          id: string | null
          is_anonymous: boolean | null
          message: string | null
          onchain_project_id: string | null
          org_contract: string | null
          project_id: string | null
          tx_hash: string | null
        }
        Insert: {
          amount_avax?: number | null
          amount_usd?: number | null
          created_at?: string | null
          donated_at?: string | null
          donor_address?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          message?: string | null
          onchain_project_id?: string | null
          org_contract?: string | null
          project_id?: string | null
          tx_hash?: string | null
        }
        Update: {
          amount_avax?: number | null
          amount_usd?: number | null
          created_at?: string | null
          donated_at?: string | null
          donor_address?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          message?: string | null
          onchain_project_id?: string | null
          org_contract?: string | null
          project_id?: string | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "claro_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_org_transparency"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_public_organizations"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_org_contract_fkey"
            columns: ["org_contract"]
            isOneToOne: false
            referencedRelation: "v_transparency_score"
            referencedColumns: ["contract_address"]
          },
          {
            foreignKeyName: "claro_donations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "claro_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claro_donations_tx_hash_fkey"
            columns: ["tx_hash"]
            isOneToOne: false
            referencedRelation: "claro_transactions"
            referencedColumns: ["tx_hash"]
          },
        ]
      }
      v_public_organizations: {
        Row: {
          contract_address: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          factory_address: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string | null
          org_type: string | null
          owner_address: string | null
          social_instagram: string | null
          social_twitter: string | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          contract_address?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          factory_address?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string | null
          org_type?: string | null
          owner_address?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          contract_address?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          factory_address?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string | null
          org_type?: string | null
          owner_address?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      v_transparency_score: {
        Row: {
          contract_address: string | null
          documents: number | null
          impact_metrics: number | null
          milestones_done: number | null
          name: string | null
          projects: number | null
          transactions: number | null
          transparency_score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
