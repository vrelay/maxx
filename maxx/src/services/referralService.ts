import { auth } from '../config/firebase';

export interface ReferralInfo {
  code: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  successfulReferralsList: any[];
  pendingReferralsList: any[];
}

export interface Reward {
  id: string;
  type: string;
  amount: number;
  expires_at: string;
  is_used: boolean;
  description: string;
}

class ReferralService {
  // private apiBaseUrl = "https://bapi.lookai.me/api";
  private apiBaseUrl = "http://10.145.59.119:3000/api"; // Match your looksmaxxing service


  private async getAuthToken(): Promise<string> {
    console.log("🔐 DEBUG: Getting auth token...");
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ DEBUG: No authenticated user found");
      throw new Error("User not authenticated");
    }
    console.log("✅ DEBUG: User found:", user.uid);
    const token = await user.getIdToken();
    console.log("✅ DEBUG: Token obtained, length:", token.length);
    return token;
  }

  private async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}) {
    console.log(`🌐 DEBUG: Making request to ${endpoint}`);
    console.log("🌐 DEBUG: Request options:", options);
    
    const token = await this.getAuthToken();
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    console.log("🌐 DEBUG: Full URL:", url);
    console.log("🌐 DEBUG: Using token:", token.substring(0, 20) + "...");
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    console.log("🌐 DEBUG: Response status:", response.status);
    console.log("🌐 DEBUG: Response headers:", Object.fromEntries(response.headers.entries()));
    
    return response;
  }

  async generateReferralCode(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log("🔄 DEBUG: Generating referral code...");
    try {
      const response = await this.makeAuthenticatedRequest('/referral/generate', {
        method: 'POST',
      });
      
      console.log("🌐 DEBUG: Generate response status:", response.status);
      const result = await response.json();
      console.log("🌐 DEBUG: Generate response data:", result);
      
      if (result.success) {
        console.log("✅ DEBUG: Referral code generated successfully:", result.data);
      } else {
        console.log("❌ DEBUG: Failed to generate referral code:", result.error);
      }
      
      return result;
    } catch (error) {
      console.error("❌ DEBUG: Error generating referral code:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async claimReferralCode(code: string): Promise<{ success: boolean; error?: string }> {
    console.log("🔄 DEBUG: Claiming referral code:", code);
    try {
      const response = await this.makeAuthenticatedRequest('/referral/claim', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      
      console.log("🌐 DEBUG: Claim response status:", response.status);
      const result = await response.json();
      console.log("🌐 DEBUG: Claim response data:", result);
      
      if (result.success) {
        console.log("✅ DEBUG: Referral code claimed successfully");
      } else {
        console.log("❌ DEBUG: Failed to claim referral code:", result.error);
      }
      
      return result;
    } catch (error) {
      console.error("❌ DEBUG: Error claiming referral code:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getReferralInfo(): Promise<{ success: boolean; data?: ReferralInfo; error?: string }> {
    console.log("🔄 DEBUG: Getting referral info...");
    try {
      const response = await this.makeAuthenticatedRequest('/referral/info');
      
      console.log("🌐 DEBUG: Info response status:", response.status);
      const result = await response.json();
      console.log("🌐 DEBUG: Info response data:", result);
      
      if (result.success) {
        console.log("✅ DEBUG: Referral info retrieved successfully:", result.data);
      } else {
        console.log("❌ DEBUG: Failed to get referral info:", result.error);
      }
      
      return result;
    } catch (error) {
      console.error("❌ DEBUG: Error getting referral info:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getRewards(): Promise<{ success: boolean; data?: Reward[]; error?: string }> {
    try {
      const response = await this.makeAuthenticatedRequest('/referral/rewards');
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkActiveRewards(): Promise<{ success: boolean; data?: { hasActiveRewards: boolean; rewards: Reward[] }; error?: string }> {
    try {
      const response = await this.makeAuthenticatedRequest('/referral/check-rewards');
      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  generateShareUrl(code: string): string {
    return `https://yourapp.com/invite?code=${code}`;
  }

  generateShareMessage(code: string): string {
    return `Join me on Maxx! Use my referral code: ${code} 🚀`;
  }
}

export default new ReferralService();
