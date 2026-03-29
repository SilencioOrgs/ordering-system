import type {
  LoyaltyAccount,
  LoyaltyTierRule,
  RewardOption,
  RewardSelection,
  RewardSettings,
  SeasonalRule,
  StoreSettings,
  UserVoucher,
} from "@/lib/rewards/types";

type DateParts = {
  year: number;
  month: number;
  day: number;
};

export function getPhilippineDateParts(date = new Date()): DateParts {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const read = (type: string) => Number(parts.find((entry) => entry.type === type)?.value ?? "0");

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

export function formatMonthDay(date = new Date()) {
  const parts = getPhilippineDateParts(date);
  return `${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

export function formatYmd(date = new Date()) {
  const parts = getPhilippineDateParts(date);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function parseYmd(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

function toComparableNumber(parts: DateParts) {
  return parts.year * 10000 + parts.month * 100 + parts.day;
}

export function addDaysToYmd(baseYmd: string, days: number) {
  const parsed = parseYmd(baseYmd);
  if (!parsed) return baseYmd;
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + days));
  return formatYmd(date);
}

export function getMinimumScheduledDate(advanceNoticeDays: number, now = new Date()) {
  return addDaysToYmd(formatYmd(now), Math.max(0, advanceNoticeDays));
}

export function isScheduledDateAllowed(
  scheduledDate: string | null | undefined,
  storeSettings: StoreSettings,
  now = new Date()
) {
  if (!scheduledDate) return false;
  const parsed = parseYmd(scheduledDate);
  if (!parsed) return false;
  const minDate = parseYmd(getMinimumScheduledDate(storeSettings.advanceNoticeDays, now));
  if (!minDate) return false;
  return toComparableNumber(parsed) >= toComparableNumber(minDate);
}

function isSeasonalRuleActive(rule: SeasonalRule, now = new Date()) {
  if (!rule.isActive) return false;
  const current = getPhilippineDateParts(now);

  if (rule.months.length > 0 && !rule.months.includes(current.month)) {
    return false;
  }

  if (rule.startDate && rule.endDate) {
    const currentYmd = formatYmd(now);
    return currentYmd >= rule.startDate && currentYmd <= rule.endDate;
  }

  return true;
}

export function getCurrentLoyaltyTier(points: number, tiers: LoyaltyTierRule[]) {
  const activeTiers = [...tiers].filter((tier) => tier.isActive).sort((a, b) => a.minPoints - b.minPoints);
  return (
    activeTiers.find((tier) => points >= tier.minPoints && (tier.maxPoints === null || points <= tier.maxPoints)) ??
    activeTiers[0] ??
    null
  );
}

export function getNextLoyaltyTier(points: number, tiers: LoyaltyTierRule[]) {
  const activeTiers = [...tiers].filter((tier) => tier.isActive).sort((a, b) => a.minPoints - b.minPoints);
  return activeTiers.find((tier) => tier.minPoints > points) ?? null;
}

export function getRankProgress(points: number, tiers: LoyaltyTierRule[]) {
  const currentTier = getCurrentLoyaltyTier(points, tiers);
  const nextTier = getNextLoyaltyTier(points, tiers);

  if (!currentTier) {
    return {
      currentTier: null,
      nextTier,
      pointsToNextRank: nextTier ? nextTier.minPoints - points : 0,
      progressPercent: 0,
    };
  }

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      pointsToNextRank: 0,
      progressPercent: 100,
    };
  }

  const currentSpan = Math.max(1, nextTier.minPoints - currentTier.minPoints);
  const gained = Math.max(0, points - currentTier.minPoints);

  return {
    currentTier,
    nextTier,
    pointsToNextRank: Math.max(0, nextTier.minPoints - points),
    progressPercent: Math.min(100, Math.round((gained / currentSpan) * 100)),
  };
}

export function buildCampaignRewardOptions(
  rewardSettings: RewardSettings,
  nonCancelledOrderCount: number,
  now = new Date()
) {
  if (!rewardSettings.rewardsEnabled) {
    return [] satisfies RewardOption[];
  }

  const options: RewardOption[] = [];

  if (rewardSettings.welcomeVoucherEnabled && nonCancelledOrderCount === 0) {
    options.push({
      id: "welcome_first_order",
      source: "campaign",
      title: "First Order",
      description: `${rewardSettings.welcomeVoucherPercent}% off for your first order.`,
      percentOff: rewardSettings.welcomeVoucherPercent,
      fixedAmountOff: null,
      freeShipping: false,
      minOrderAmount: 0,
      maxDiscountAmount: null,
      expiresAt: null,
      badge: "New",
    });
  }

  for (const rule of rewardSettings.orderValueRules) {
    if (!rule.isActive) continue;
    options.push({
      id: rule.id,
      source: "campaign",
      title: rule.label,
      description: rule.description,
      percentOff: rule.percentOff,
      fixedAmountOff: rule.fixedAmountOff,
      freeShipping: rule.freeShipping,
      minOrderAmount: rule.minOrderAmount,
      maxDiscountAmount: null,
      expiresAt: null,
      badge: "Cart bonus",
    });
  }

  for (const rule of rewardSettings.seasonalRules) {
    if (!isSeasonalRuleActive(rule, now)) continue;
    options.push({
      id: rule.id,
      source: "campaign",
      title: rule.label,
      description: rule.description,
      percentOff: rule.percentOff,
      fixedAmountOff: rule.fixedAmountOff,
      freeShipping: rule.freeShipping,
      minOrderAmount: 0,
      maxDiscountAmount: null,
      expiresAt: rule.endDate,
      badge: "Seasonal",
    });
  }

  return options;
}

export function buildVoucherRewardOptions(vouchers: UserVoucher[]): RewardOption[] {
  return vouchers
    .filter((voucher) => voucher.status === "active")
    .map((voucher) => ({
      id: voucher.id,
      source: "user_voucher",
      title: voucher.title,
      description: voucher.description,
      percentOff: voucher.percentOff,
      fixedAmountOff: voucher.fixedAmountOff,
      freeShipping: voucher.freeShipping,
      minOrderAmount: voucher.minOrderAmount,
      maxDiscountAmount: voucher.maxDiscountAmount,
      expiresAt: voucher.expiresAt,
      badge: "Voucher",
    }));
}

export function buildRankRewardOption(
  loyaltyAccount: LoyaltyAccount | null,
  rewardSettings: RewardSettings,
  monthlyRankFreeShippingUsed: number
) {
  if (!rewardSettings.rewardsEnabled || !loyaltyAccount) {
    return null;
  }

  const tier = getCurrentLoyaltyTier(loyaltyAccount.yearlyPoints, rewardSettings.loyaltyTiers);
  if (!tier || !tier.isActive || tier.name === "Baguhan") {
    return null;
  }

  const freeShippingAvailable =
    tier.freeShippingAlways ||
    (tier.monthlyFreeShippingLimit !== null && monthlyRankFreeShippingUsed < tier.monthlyFreeShippingLimit);

  if (tier.percentOff <= 0 && !freeShippingAvailable) {
    return null;
  }

  let description = `${tier.name} perk`;
  if (tier.freeShippingAlways) {
    description += " with free shipping on every delivery order.";
  } else if (tier.monthlyFreeShippingLimit !== null) {
    const remaining = Math.max(0, tier.monthlyFreeShippingLimit - monthlyRankFreeShippingUsed);
    description += ` with ${remaining} free shipping reward(s) left this month.`;
  }

  return {
    id: tier.id,
    source: "rank" as const,
    title: `${tier.name} perk`,
    description,
    percentOff: tier.percentOff || null,
    fixedAmountOff: null,
    freeShipping: freeShippingAvailable,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    expiresAt: null,
    badge: tier.badge,
  };
}

export function isRewardOptionEligible(option: RewardOption, subtotal: number) {
  return subtotal >= option.minOrderAmount;
}

export function applyRewardOption(subtotal: number, deliveryFee: number, option: RewardOption | null) {
  if (!option) {
    return {
      discountAmount: 0,
      shippingDiscountAmount: 0,
      total: Math.max(0, subtotal + deliveryFee),
    };
  }

  const percentDiscount =
    option.percentOff && option.percentOff > 0 ? (subtotal * option.percentOff) / 100 : 0;
  const fixedDiscount = option.fixedAmountOff && option.fixedAmountOff > 0 ? option.fixedAmountOff : 0;
  const rawDiscount = Math.max(percentDiscount, fixedDiscount);
  const discountAmount = Math.max(
    0,
    Math.min(
      subtotal,
      option.maxDiscountAmount !== null ? Math.min(rawDiscount, option.maxDiscountAmount) : rawDiscount
    )
  );
  const shippingDiscountAmount = option.freeShipping ? Math.max(0, deliveryFee) : 0;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount - shippingDiscountAmount);

  return {
    discountAmount,
    shippingDiscountAmount,
    total,
  };
}

export function getRewardSavings(subtotal: number, deliveryFee: number, option: RewardOption) {
  const { discountAmount, shippingDiscountAmount } = applyRewardOption(subtotal, deliveryFee, option);
  return discountAmount + shippingDiscountAmount;
}

export function findBestRewardOption(options: RewardOption[], subtotal: number, deliveryFee: number) {
  return (
    options
      .filter((option) => isRewardOptionEligible(option, subtotal))
      .sort(
        (left, right) => getRewardSavings(subtotal, deliveryFee, right) - getRewardSavings(subtotal, deliveryFee, left)
      )[0] ?? null
  );
}

export function resolveRewardOption(
  options: RewardOption[],
  subtotal: number,
  selection: RewardSelection
) {
  if (!selection) return null;

  const matched =
    options.find((option) => option.source === selection.source && option.id === selection.id) ?? null;

  if (!matched || !isRewardOptionEligible(matched, subtotal)) {
    return null;
  }

  return matched;
}

export function getNextOrderValueMilestone(subtotal: number, rewardSettings: RewardSettings) {
  const nextRule =
    [...rewardSettings.orderValueRules]
      .filter((rule) => rule.isActive && rule.minOrderAmount > subtotal)
      .sort((a, b) => a.minOrderAmount - b.minOrderAmount)[0] ?? null;

  if (!nextRule) {
    return null;
  }

  return {
    rule: nextRule,
    amountLeft: Math.max(0, nextRule.minOrderAmount - subtotal),
  };
}

export function getCurrentMonthRange(now = new Date()) {
  const parts = getPhilippineDateParts(now);
  const start = `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-01`;
  const nextMonth = parts.month === 12 ? { year: parts.year + 1, month: 1 } : { year: parts.year, month: parts.month + 1 };
  const end = `${String(nextMonth.year).padStart(4, "0")}-${String(nextMonth.month).padStart(2, "0")}-01`;
  return { start, end };
}

export function isDoublePointsActive(rewardSettings: RewardSettings, now = new Date()) {
  if (!rewardSettings.doublePointsEnabled) return false;
  const current = now.toISOString();
  if (rewardSettings.doublePointsStartsAt && current < rewardSettings.doublePointsStartsAt) return false;
  if (rewardSettings.doublePointsEndsAt && current > rewardSettings.doublePointsEndsAt) return false;
  return true;
}
