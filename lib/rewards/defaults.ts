import type {
  HolidayBonusRule,
  LoyaltyTierRule,
  OrderValueRule,
  RewardSettings,
  SeasonalRule,
  StoreSettings,
} from "@/lib/rewards/types";

const DEFAULT_ORDER_VALUE_RULES: OrderValueRule[] = [
  {
    id: "free_shipping_600",
    label: "Free Shipping",
    description: "Free shipping on orders worth PHP 600 or more.",
    minOrderAmount: 600,
    percentOff: null,
    fixedAmountOff: null,
    freeShipping: true,
    isActive: true,
  },
  {
    id: "ten_percent_800",
    label: "10% off",
    description: "Save 10% on orders worth PHP 800 or more.",
    minOrderAmount: 800,
    percentOff: 10,
    fixedAmountOff: null,
    freeShipping: false,
    isActive: true,
  },
  {
    id: "fifteen_percent_1200",
    label: "15% off",
    description: "Save 15% on orders worth PHP 1,200 or more.",
    minOrderAmount: 1200,
    percentOff: 15,
    fixedAmountOff: null,
    freeShipping: false,
    isActive: true,
  },
  {
    id: "twenty_percent_1500",
    label: "20% off",
    description: "Save 20% on orders worth PHP 1,500 or more.",
    minOrderAmount: 1500,
    percentOff: 20,
    fixedAmountOff: null,
    freeShipping: false,
    isActive: true,
  },
];

const DEFAULT_SEASONAL_RULES: SeasonalRule[] = [
  {
    id: "pasko_promo",
    label: "Pasko Promo",
    description: "15% off every December.",
    percentOff: 15,
    fixedAmountOff: null,
    freeShipping: false,
    months: [12],
    startDate: null,
    endDate: null,
    isActive: true,
  },
  {
    id: "buwan_ng_wika",
    label: "Buwan ng Wika",
    description: "12% off every August.",
    percentOff: 12,
    fixedAmountOff: null,
    freeShipping: false,
    months: [8],
    startDate: null,
    endDate: null,
    isActive: true,
  },
];

const DEFAULT_LOYALTY_TIERS: LoyaltyTierRule[] = [
  {
    id: "baguhan",
    name: "Baguhan",
    badge: "Baguhan",
    minPoints: 0,
    maxPoints: 199,
    percentOff: 0,
    monthlyFreeShippingLimit: null,
    freeShippingAlways: false,
    isActive: true,
  },
  {
    id: "bronze_suki",
    name: "Bronze Suki",
    badge: "Bronze",
    minPoints: 200,
    maxPoints: 499,
    percentOff: 10,
    monthlyFreeShippingLimit: 1,
    freeShippingAlways: false,
    isActive: true,
  },
  {
    id: "silver_suki",
    name: "Silver Suki",
    badge: "Silver",
    minPoints: 500,
    maxPoints: 999,
    percentOff: 15,
    monthlyFreeShippingLimit: 2,
    freeShippingAlways: false,
    isActive: true,
  },
  {
    id: "gold_suki",
    name: "Gold Suki",
    badge: "Gold",
    minPoints: 1000,
    maxPoints: 1999,
    percentOff: 20,
    monthlyFreeShippingLimit: null,
    freeShippingAlways: true,
    isActive: true,
  },
  {
    id: "diamond_suki",
    name: "Diamond Suki",
    badge: "Diamond",
    minPoints: 2000,
    maxPoints: null,
    percentOff: 25,
    monthlyFreeShippingLimit: null,
    freeShippingAlways: true,
    isActive: true,
  },
];

const DEFAULT_HOLIDAY_RULES: HolidayBonusRule[] = [
  { id: "new_year", label: "New Year", monthDay: "01-01" },
  { id: "araw_ng_kagitingan", label: "Araw ng Kagitingan", monthDay: "04-09" },
  { id: "independence_day", label: "Independence Day", monthDay: "06-12" },
  { id: "national_heroes_day", label: "National Heroes Day", monthDay: "08-31" },
  { id: "bonifacio_day", label: "Bonifacio Day", monthDay: "11-30" },
  { id: "christmas", label: "Christmas Day", monthDay: "12-25" },
  { id: "rizal_day", label: "Rizal Day", monthDay: "12-30" },
];

function cloneArray<T>(value: T[]): T[] {
  return JSON.parse(JSON.stringify(value)) as T[];
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getDefaultStoreSettings(): StoreSettings {
  return {
    storeName: "Ate Ai's Kitchen",
    contactNumber: "0917-888-1122",
    storeAddress: "Poblacion, San Pedro, Laguna",
    deliveryFee: 50,
    advanceNoticeDays: 3,
  };
}

export function getDefaultRewardSettings(): RewardSettings {
  return {
    rewardsEnabled: true,
    welcomeVoucherEnabled: true,
    welcomeVoucherPercent: 10,
    orderValueRules: cloneArray(DEFAULT_ORDER_VALUE_RULES),
    seasonalRules: cloneArray(DEFAULT_SEASONAL_RULES),
    loyaltyTiers: cloneArray(DEFAULT_LOYALTY_TIERS),
    reviewPoints: 10,
    firstOrderOfMonthPoints: 20,
    holidayBonusPoints: 15,
    holidayBonusDays: cloneArray(DEFAULT_HOLIDAY_RULES),
    socialSharePoints: 25,
    rankUpVoucherPercent: 10,
    comebackEnabled: true,
    comebackVoucherPercent: 15,
    comebackInactiveDays: 30,
    streakEnabled: true,
    streakRewardPercent: 10,
    streakWeeksRequired: 3,
    doublePointsEnabled: false,
    doublePointsMultiplier: 2,
    doublePointsStartsAt: null,
    doublePointsEndsAt: null,
    lootSpinEnabled: false,
    lootSpinEveryOrders: 10,
    lootSpinRewards: [5, 10, 15, 20],
  };
}

export function normalizeStoreSettings(value: unknown): StoreSettings {
  const fallback = getDefaultStoreSettings();
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  return {
    storeName: typeof record.storeName === "string" && record.storeName.trim() ? record.storeName.trim() : fallback.storeName,
    contactNumber:
      typeof record.contactNumber === "string" && record.contactNumber.trim()
        ? record.contactNumber.trim()
        : fallback.contactNumber,
    storeAddress:
      typeof record.storeAddress === "string" && record.storeAddress.trim()
        ? record.storeAddress.trim()
        : fallback.storeAddress,
    deliveryFee: Math.max(0, toNumber(record.deliveryFee, fallback.deliveryFee)),
    advanceNoticeDays: Math.max(0, Math.floor(toNumber(record.advanceNoticeDays, fallback.advanceNoticeDays))),
  };
}

function normalizeOrderValueRules(value: unknown): OrderValueRule[] {
  const fallback = getDefaultRewardSettings().orderValueRules;
  if (!Array.isArray(value)) return fallback;

  return value.map((item, index) => {
    const source = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const defaultRule = fallback[index] ?? fallback[fallback.length - 1];
    return {
      id: typeof source.id === "string" && source.id.trim() ? source.id : defaultRule.id,
      label: typeof source.label === "string" && source.label.trim() ? source.label : defaultRule.label,
      description:
        typeof source.description === "string" && source.description.trim()
          ? source.description
          : defaultRule.description,
      minOrderAmount: Math.max(0, toNumber(source.minOrderAmount, defaultRule.minOrderAmount)),
      percentOff:
        source.percentOff === null || source.percentOff === undefined
          ? null
          : Math.max(0, toNumber(source.percentOff, defaultRule.percentOff ?? 0)),
      fixedAmountOff:
        source.fixedAmountOff === null || source.fixedAmountOff === undefined
          ? null
          : Math.max(0, toNumber(source.fixedAmountOff, defaultRule.fixedAmountOff ?? 0)),
      freeShipping: Boolean(source.freeShipping),
      isActive: source.isActive === undefined ? defaultRule.isActive : Boolean(source.isActive),
    };
  });
}

function normalizeSeasonalRules(value: unknown): SeasonalRule[] {
  const fallback = getDefaultRewardSettings().seasonalRules;
  if (!Array.isArray(value)) return fallback;

  return value.map((item, index) => {
    const source = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const defaultRule = fallback[index] ?? fallback[fallback.length - 1];
    return {
      id: typeof source.id === "string" && source.id.trim() ? source.id : defaultRule.id,
      label: typeof source.label === "string" && source.label.trim() ? source.label : defaultRule.label,
      description:
        typeof source.description === "string" && source.description.trim()
          ? source.description
          : defaultRule.description,
      percentOff:
        source.percentOff === null || source.percentOff === undefined
          ? null
          : Math.max(0, toNumber(source.percentOff, defaultRule.percentOff ?? 0)),
      fixedAmountOff:
        source.fixedAmountOff === null || source.fixedAmountOff === undefined
          ? null
          : Math.max(0, toNumber(source.fixedAmountOff, defaultRule.fixedAmountOff ?? 0)),
      freeShipping: Boolean(source.freeShipping),
      months: Array.isArray(source.months)
        ? source.months.map((entry) => Math.max(1, Math.min(12, Math.floor(toNumber(entry, 1)))))
        : defaultRule.months,
      startDate: typeof source.startDate === "string" ? source.startDate : defaultRule.startDate,
      endDate: typeof source.endDate === "string" ? source.endDate : defaultRule.endDate,
      isActive: source.isActive === undefined ? defaultRule.isActive : Boolean(source.isActive),
    };
  });
}

function normalizeLoyaltyTiers(value: unknown): LoyaltyTierRule[] {
  const fallback = getDefaultRewardSettings().loyaltyTiers;
  if (!Array.isArray(value)) return fallback;

  return value.map((item, index) => {
    const source = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const defaultRule = fallback[index] ?? fallback[fallback.length - 1];
    return {
      id: typeof source.id === "string" && source.id.trim() ? source.id : defaultRule.id,
      name: typeof source.name === "string" && source.name.trim() ? source.name : defaultRule.name,
      badge: typeof source.badge === "string" && source.badge.trim() ? source.badge : defaultRule.badge,
      minPoints: Math.max(0, Math.floor(toNumber(source.minPoints, defaultRule.minPoints))),
      maxPoints:
        source.maxPoints === null || source.maxPoints === undefined
          ? null
          : Math.max(0, Math.floor(toNumber(source.maxPoints, defaultRule.maxPoints ?? 0))),
      percentOff: Math.max(0, toNumber(source.percentOff, defaultRule.percentOff)),
      monthlyFreeShippingLimit:
        source.monthlyFreeShippingLimit === null || source.monthlyFreeShippingLimit === undefined
          ? null
          : Math.max(0, Math.floor(toNumber(source.monthlyFreeShippingLimit, defaultRule.monthlyFreeShippingLimit ?? 0))),
      freeShippingAlways:
        source.freeShippingAlways === undefined ? defaultRule.freeShippingAlways : Boolean(source.freeShippingAlways),
      isActive: source.isActive === undefined ? defaultRule.isActive : Boolean(source.isActive),
    };
  });
}

function normalizeHolidayRules(value: unknown): HolidayBonusRule[] {
  const fallback = getDefaultRewardSettings().holidayBonusDays;
  if (!Array.isArray(value)) return fallback;

  return value.map((item, index) => {
    const source = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const defaultRule = fallback[index] ?? fallback[fallback.length - 1];
    return {
      id: typeof source.id === "string" && source.id.trim() ? source.id : defaultRule.id,
      label: typeof source.label === "string" && source.label.trim() ? source.label : defaultRule.label,
      monthDay:
        typeof source.monthDay === "string" && /^\d{2}-\d{2}$/.test(source.monthDay)
          ? source.monthDay
          : defaultRule.monthDay,
    };
  });
}

export function normalizeRewardSettings(value: unknown): RewardSettings {
  const fallback = getDefaultRewardSettings();
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const record = value as Record<string, unknown>;

  return {
    rewardsEnabled: record.rewardsEnabled === undefined ? fallback.rewardsEnabled : Boolean(record.rewardsEnabled),
    welcomeVoucherEnabled:
      record.welcomeVoucherEnabled === undefined ? fallback.welcomeVoucherEnabled : Boolean(record.welcomeVoucherEnabled),
    welcomeVoucherPercent: Math.max(0, toNumber(record.welcomeVoucherPercent, fallback.welcomeVoucherPercent)),
    orderValueRules: normalizeOrderValueRules(record.orderValueRules),
    seasonalRules: normalizeSeasonalRules(record.seasonalRules),
    loyaltyTiers: normalizeLoyaltyTiers(record.loyaltyTiers),
    reviewPoints: Math.max(0, Math.floor(toNumber(record.reviewPoints, fallback.reviewPoints))),
    firstOrderOfMonthPoints: Math.max(
      0,
      Math.floor(toNumber(record.firstOrderOfMonthPoints, fallback.firstOrderOfMonthPoints))
    ),
    holidayBonusPoints: Math.max(0, Math.floor(toNumber(record.holidayBonusPoints, fallback.holidayBonusPoints))),
    holidayBonusDays: normalizeHolidayRules(record.holidayBonusDays),
    socialSharePoints: Math.max(0, Math.floor(toNumber(record.socialSharePoints, fallback.socialSharePoints))),
    rankUpVoucherPercent: Math.max(0, toNumber(record.rankUpVoucherPercent, fallback.rankUpVoucherPercent)),
    comebackEnabled: record.comebackEnabled === undefined ? fallback.comebackEnabled : Boolean(record.comebackEnabled),
    comebackVoucherPercent: Math.max(0, toNumber(record.comebackVoucherPercent, fallback.comebackVoucherPercent)),
    comebackInactiveDays: Math.max(1, Math.floor(toNumber(record.comebackInactiveDays, fallback.comebackInactiveDays))),
    streakEnabled: record.streakEnabled === undefined ? fallback.streakEnabled : Boolean(record.streakEnabled),
    streakRewardPercent: Math.max(0, toNumber(record.streakRewardPercent, fallback.streakRewardPercent)),
    streakWeeksRequired: Math.max(1, Math.floor(toNumber(record.streakWeeksRequired, fallback.streakWeeksRequired))),
    doublePointsEnabled:
      record.doublePointsEnabled === undefined ? fallback.doublePointsEnabled : Boolean(record.doublePointsEnabled),
    doublePointsMultiplier: Math.max(1, Math.floor(toNumber(record.doublePointsMultiplier, fallback.doublePointsMultiplier))),
    doublePointsStartsAt:
      typeof record.doublePointsStartsAt === "string" ? record.doublePointsStartsAt : fallback.doublePointsStartsAt,
    doublePointsEndsAt:
      typeof record.doublePointsEndsAt === "string" ? record.doublePointsEndsAt : fallback.doublePointsEndsAt,
    lootSpinEnabled: record.lootSpinEnabled === undefined ? fallback.lootSpinEnabled : Boolean(record.lootSpinEnabled),
    lootSpinEveryOrders: Math.max(1, Math.floor(toNumber(record.lootSpinEveryOrders, fallback.lootSpinEveryOrders))),
    lootSpinRewards: Array.isArray(record.lootSpinRewards)
      ? record.lootSpinRewards.map((entry) => Math.max(0, toNumber(entry, 0)))
      : fallback.lootSpinRewards,
  };
}
