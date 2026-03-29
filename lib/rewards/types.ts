export type RewardOptionSource = "campaign" | "user_voucher" | "rank";

export type RewardCategory = "order" | "reward" | "rating_prompt" | "general";

export type RewardSelection = {
  source: RewardOptionSource;
  id: string;
} | null;

export type OrderValueRule = {
  id: string;
  label: string;
  description: string;
  minOrderAmount: number;
  percentOff: number | null;
  fixedAmountOff: number | null;
  freeShipping: boolean;
  isActive: boolean;
};

export type SeasonalRule = {
  id: string;
  label: string;
  description: string;
  percentOff: number | null;
  fixedAmountOff: number | null;
  freeShipping: boolean;
  months: number[];
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
};

export type HolidayBonusRule = {
  id: string;
  label: string;
  monthDay: string;
};

export type LoyaltyTierRule = {
  id: string;
  name: string;
  badge: string;
  minPoints: number;
  maxPoints: number | null;
  percentOff: number;
  monthlyFreeShippingLimit: number | null;
  freeShippingAlways: boolean;
  isActive: boolean;
};

export type StoreSettings = {
  storeName: string;
  contactNumber: string;
  storeAddress: string;
  deliveryFee: number;
  advanceNoticeDays: number;
  gcashAccountName: string;
  gcashAccountNumber: string;
  gcashQrUrl: string;
  gcashQrPublicId: string;
  mayaAccountName: string;
  mayaAccountNumber: string;
  mayaQrUrl: string;
  mayaQrPublicId: string;
};

export type RewardSettings = {
  rewardsEnabled: boolean;
  welcomeVoucherEnabled: boolean;
  welcomeVoucherPercent: number;
  orderValueRules: OrderValueRule[];
  seasonalRules: SeasonalRule[];
  loyaltyTiers: LoyaltyTierRule[];
  reviewPoints: number;
  firstOrderOfMonthPoints: number;
  holidayBonusPoints: number;
  holidayBonusDays: HolidayBonusRule[];
  socialSharePoints: number;
  rankUpVoucherPercent: number;
  comebackEnabled: boolean;
  comebackVoucherPercent: number;
  comebackInactiveDays: number;
  streakEnabled: boolean;
  streakRewardPercent: number;
  streakWeeksRequired: number;
  doublePointsEnabled: boolean;
  doublePointsMultiplier: number;
  doublePointsStartsAt: string | null;
  doublePointsEndsAt: string | null;
  lootSpinEnabled: boolean;
  lootSpinEveryOrders: number;
  lootSpinRewards: number[];
};

export type LoyaltyAccount = {
  userId: string;
  totalPoints: number;
  yearlyPoints: number;
  currentRank: string;
  lifetimeSpent: number;
  yearlySpent: number;
  totalOrders: number;
  deliveredOrders: number;
  streakWeeks: number;
  lastOrderAt: string | null;
  lastDeliveredOrderAt: string | null;
  resetYear: number;
};

export type LoyaltyTransaction = {
  id: string;
  transactionType: string;
  points: number;
  description: string;
  createdAt: string;
  orderId: string | null;
};

export type UserVoucher = {
  id: string;
  source: string;
  title: string;
  description: string;
  percentOff: number | null;
  fixedAmountOff: number | null;
  freeShipping: boolean;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  status: string;
  code: string | null;
  expiresAt: string | null;
  issuedAt: string;
};

export type RewardOption = {
  id: string;
  source: RewardOptionSource;
  title: string;
  description: string;
  percentOff: number | null;
  fixedAmountOff: number | null;
  freeShipping: boolean;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  expiresAt: string | null;
  badge: string | null;
};

export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  category: RewardCategory;
  readAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type RewardSummary = {
  storeSettings: StoreSettings;
  rewardSettings: RewardSettings;
  loyaltyAccount: LoyaltyAccount | null;
  activeVouchers: UserVoucher[];
  recentTransactions: LoyaltyTransaction[];
  notifications: NotificationRecord[];
  nonCancelledOrderCount: number;
  monthlyRankFreeShippingUsed: number;
};
