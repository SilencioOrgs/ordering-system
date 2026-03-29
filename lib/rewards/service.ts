import { getDefaultRewardSettings, getDefaultStoreSettings, normalizeRewardSettings, normalizeStoreSettings } from "@/lib/rewards/defaults";
import {
  buildCampaignRewardOptions,
  buildRankRewardOption,
  buildVoucherRewardOptions,
  formatMonthDay,
  getCurrentLoyaltyTier,
  getCurrentMonthRange,
  getPhilippineDateParts,
  isDoublePointsActive,
} from "@/lib/rewards/engine";
import type {
  LoyaltyAccount,
  LoyaltyTransaction,
  NotificationRecord,
  RewardCategory,
  RewardSettings,
  RewardSummary,
  StoreSettings,
  UserVoucher,
} from "@/lib/rewards/types";
import type { createServiceClient } from "@/lib/supabase/service";

type SupabaseClientLike = ReturnType<typeof createServiceClient>;

type OrderRewardRow = {
  id: string;
  user_id: string | null;
  order_number: string;
  subtotal: number | string | null;
  delivery_fee: number | string | null;
  total: number | string | null;
  status: string;
  created_at: string;
  scheduled_date: string | null;
};

type StoreSettingsRow = {
  store_name: unknown;
  contact_number: unknown;
  store_address: unknown;
  delivery_fee: unknown;
  advance_notice_days: unknown;
};

type RewardSettingsRow = {
  rewards_enabled: unknown;
  welcome_voucher_enabled: unknown;
  welcome_voucher_percent: unknown;
  order_value_rules: unknown;
  seasonal_rules: unknown;
  loyalty_tiers: unknown;
  review_points: unknown;
  first_order_of_month_points: unknown;
  holiday_bonus_points: unknown;
  holiday_bonus_days: unknown;
  social_share_points: unknown;
  rank_up_voucher_percent: unknown;
  comeback_enabled: unknown;
  comeback_voucher_percent: unknown;
  comeback_inactive_days: unknown;
  streak_enabled: unknown;
  streak_reward_percent: unknown;
  streak_weeks_required: unknown;
  double_points_enabled: unknown;
  double_points_multiplier: unknown;
  double_points_starts_at: unknown;
  double_points_ends_at: unknown;
  loot_spin_enabled: unknown;
  loot_spin_every_orders: unknown;
  loot_spin_rewards: unknown;
};

type LoyaltyAccountRow = {
  user_id: string;
  total_points: unknown;
  yearly_points: unknown;
  current_rank: unknown;
  lifetime_spent: unknown;
  yearly_spent: unknown;
  total_orders: unknown;
  delivered_orders: unknown;
  streak_weeks: unknown;
  last_order_at: string | null;
  last_delivered_order_at: string | null;
  reset_year: unknown;
};

type VoucherRow = {
  id: string;
  source: string;
  title: string;
  description: string;
  percent_off: unknown;
  fixed_amount_off: unknown;
  free_shipping: unknown;
  min_order_amount: unknown;
  max_discount_amount: unknown;
  status: string;
  code: string | null;
  expires_at: string | null;
  issued_at: string;
};

type LoyaltyTransactionRow = {
  id: string;
  transaction_type: string;
  points: unknown;
  description: string;
  created_at: string;
  order_id: string | null;
};

type UserNotificationRow = {
  id: string;
  title: string;
  body: string;
  category: RewardCategory;
  read_at: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

function toArray<T>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCurrentYear(now = new Date()) {
  return getPhilippineDateParts(now).year;
}

export async function loadStoreAndRewardSettings(supabase: SupabaseClientLike): Promise<{
  storeSettings: StoreSettings;
  rewardSettings: RewardSettings;
}> {
  const [storeResponse, rewardResponse] = await Promise.all([
    supabase
      .from("store_settings")
      .select("store_name, contact_number, store_address, delivery_fee, advance_notice_days")
      .limit(1)
      .maybeSingle(),
    supabase
      .from("reward_settings")
      .select(
        `
        rewards_enabled,
        welcome_voucher_enabled,
        welcome_voucher_percent,
        order_value_rules,
        seasonal_rules,
        loyalty_tiers,
        review_points,
        first_order_of_month_points,
        holiday_bonus_points,
        holiday_bonus_days,
        social_share_points,
        rank_up_voucher_percent,
        comeback_enabled,
        comeback_voucher_percent,
        comeback_inactive_days,
        streak_enabled,
        streak_reward_percent,
        streak_weeks_required,
        double_points_enabled,
        double_points_multiplier,
        double_points_starts_at,
        double_points_ends_at,
        loot_spin_enabled,
        loot_spin_every_orders,
        loot_spin_rewards
      `
      )
      .limit(1)
      .maybeSingle(),
  ]);

  const storeRow = (storeResponse.data as StoreSettingsRow | null | undefined) ?? null;
  const rewardRow = (rewardResponse.data as RewardSettingsRow | null | undefined) ?? null;

  const storeSettings = normalizeStoreSettings(
    storeRow
      ? {
          storeName: storeRow.store_name,
          contactNumber: storeRow.contact_number,
          storeAddress: storeRow.store_address,
          deliveryFee: storeRow.delivery_fee,
          advanceNoticeDays: storeRow.advance_notice_days,
        }
      : getDefaultStoreSettings()
  );

  const rewardSettings = normalizeRewardSettings(
    rewardRow
      ? {
          rewardsEnabled: rewardRow.rewards_enabled,
          welcomeVoucherEnabled: rewardRow.welcome_voucher_enabled,
          welcomeVoucherPercent: rewardRow.welcome_voucher_percent,
          orderValueRules: rewardRow.order_value_rules,
          seasonalRules: rewardRow.seasonal_rules,
          loyaltyTiers: rewardRow.loyalty_tiers,
          reviewPoints: rewardRow.review_points,
          firstOrderOfMonthPoints: rewardRow.first_order_of_month_points,
          holidayBonusPoints: rewardRow.holiday_bonus_points,
          holidayBonusDays: rewardRow.holiday_bonus_days,
          socialSharePoints: rewardRow.social_share_points,
          rankUpVoucherPercent: rewardRow.rank_up_voucher_percent,
          comebackEnabled: rewardRow.comeback_enabled,
          comebackVoucherPercent: rewardRow.comeback_voucher_percent,
          comebackInactiveDays: rewardRow.comeback_inactive_days,
          streakEnabled: rewardRow.streak_enabled,
          streakRewardPercent: rewardRow.streak_reward_percent,
          streakWeeksRequired: rewardRow.streak_weeks_required,
          doublePointsEnabled: rewardRow.double_points_enabled,
          doublePointsMultiplier: rewardRow.double_points_multiplier,
          doublePointsStartsAt: rewardRow.double_points_starts_at,
          doublePointsEndsAt: rewardRow.double_points_ends_at,
          lootSpinEnabled: rewardRow.loot_spin_enabled,
          lootSpinEveryOrders: rewardRow.loot_spin_every_orders,
          lootSpinRewards: rewardRow.loot_spin_rewards,
        }
      : getDefaultRewardSettings()
  );

  return { storeSettings, rewardSettings };
}

export async function ensureLoyaltyAccount(
  supabase: SupabaseClientLike,
  userId: string,
  rewardSettings: RewardSettings
): Promise<LoyaltyAccount> {
  const response = await supabase
    .from("loyalty_accounts")
    .select(
      `
      user_id,
      total_points,
      yearly_points,
      current_rank,
      lifetime_spent,
      yearly_spent,
      total_orders,
      delivered_orders,
      streak_weeks,
      last_order_at,
      last_delivered_order_at,
      reset_year
    `
    )
    .eq("user_id", userId)
    .maybeSingle();

  const data = (response.data as LoyaltyAccountRow | null | undefined) ?? null;
  const currentYear = getCurrentYear();

  const baseAccount: LoyaltyAccount = data
    ? {
        userId: data.user_id,
        totalPoints: toNumber(data.total_points),
        yearlyPoints: toNumber(data.yearly_points),
        currentRank: typeof data.current_rank === "string" ? data.current_rank : "Baguhan",
        lifetimeSpent: toNumber(data.lifetime_spent),
        yearlySpent: toNumber(data.yearly_spent),
        totalOrders: toNumber(data.total_orders),
        deliveredOrders: toNumber(data.delivered_orders),
        streakWeeks: toNumber(data.streak_weeks),
        lastOrderAt: data.last_order_at,
        lastDeliveredOrderAt: data.last_delivered_order_at,
        resetYear: toNumber(data.reset_year) || currentYear,
      }
    : {
        userId,
        totalPoints: 0,
        yearlyPoints: 0,
        currentRank: "Baguhan",
        lifetimeSpent: 0,
        yearlySpent: 0,
        totalOrders: 0,
        deliveredOrders: 0,
        streakWeeks: 0,
        lastOrderAt: null,
        lastDeliveredOrderAt: null,
        resetYear: currentYear,
      };

  const normalized =
    baseAccount.resetYear === currentYear
      ? baseAccount
      : {
          ...baseAccount,
          yearlyPoints: 0,
          yearlySpent: 0,
          currentRank: getCurrentLoyaltyTier(0, rewardSettings.loyaltyTiers)?.name ?? "Baguhan",
          resetYear: currentYear,
        };

  await supabase.from("loyalty_accounts").upsert(
    {
      user_id: normalized.userId,
      total_points: normalized.totalPoints,
      yearly_points: normalized.yearlyPoints,
      current_rank: normalized.currentRank,
      lifetime_spent: normalized.lifetimeSpent,
      yearly_spent: normalized.yearlySpent,
      total_orders: normalized.totalOrders,
      delivered_orders: normalized.deliveredOrders,
      streak_weeks: normalized.streakWeeks,
      last_order_at: normalized.lastOrderAt,
      last_delivered_order_at: normalized.lastDeliveredOrderAt,
      reset_year: normalized.resetYear,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return normalized;
}

export async function createUserNotification(
  supabase: SupabaseClientLike,
  userId: string,
  title: string,
  body: string,
  category: RewardCategory,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("user_notifications").insert({
    user_id: userId,
    title,
    body,
    category,
    metadata,
  });
}

export async function issueUserVoucher(
  supabase: SupabaseClientLike,
  userId: string,
  payload: {
    source: string;
    title: string;
    description: string;
    percentOff?: number | null;
    fixedAmountOff?: number | null;
    freeShipping?: boolean;
    minOrderAmount?: number;
    maxDiscountAmount?: number | null;
    expiresAt?: string | null;
    code?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  const response = await supabase
    .from("user_vouchers")
    .insert({
      user_id: userId,
      source: payload.source,
      title: payload.title,
      description: payload.description,
      percent_off: payload.percentOff ?? null,
      fixed_amount_off: payload.fixedAmountOff ?? null,
      free_shipping: payload.freeShipping ?? false,
      min_order_amount: payload.minOrderAmount ?? 0,
      max_discount_amount: payload.maxDiscountAmount ?? null,
      status: "active",
      code: payload.code ?? null,
      expires_at: payload.expiresAt ?? null,
      metadata: payload.metadata ?? {},
    })
    .select("id")
    .single();

  const voucherId = response.data?.id ?? null;

  await createUserNotification(supabase, userId, payload.title, payload.description, "reward", {
    source: payload.source,
    voucherId,
  });

  return voucherId;
}

export async function ensureComebackVoucher(
  supabase: SupabaseClientLike,
  userId: string,
  rewardSettings: RewardSettings
) {
  if (!rewardSettings.rewardsEnabled || !rewardSettings.comebackEnabled) {
    return;
  }

  const latestOrderResponse = await supabase
    .from("orders")
    .select("created_at")
    .eq("user_id", userId)
    .neq("status", "Cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestOrder = latestOrderResponse.data;
  if (!latestOrder?.created_at) {
    return;
  }

  const inactiveSince = new Date(latestOrder.created_at);
  const threshold = Date.now() - rewardSettings.comebackInactiveDays * 24 * 60 * 60 * 1000;

  if (inactiveSince.getTime() > threshold) {
    return;
  }

  const existingVoucherResponse = await supabase
    .from("user_vouchers")
    .select("id")
    .eq("user_id", userId)
    .eq("source", "comeback")
    .in("status", ["active", "used"])
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingVoucherResponse.data?.id) {
    return;
  }

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  await issueUserVoucher(supabase, userId, {
    source: "comeback",
    title: "Saan ka na?",
    description: `${rewardSettings.comebackVoucherPercent}% off on your next order.`,
    percentOff: rewardSettings.comebackVoucherPercent,
    expiresAt,
  });
}

export async function getRewardSummary(
  supabase: SupabaseClientLike,
  userId: string
): Promise<RewardSummary> {
  const { storeSettings, rewardSettings } = await loadStoreAndRewardSettings(supabase);
  const loyaltyAccount = await ensureLoyaltyAccount(supabase, userId, rewardSettings);

  await ensureComebackVoucher(supabase, userId, rewardSettings);

  const { start, end } = getCurrentMonthRange();

  const [
    vouchersResponse,
    transactionResponse,
    notificationsResponse,
    nonCancelledOrdersResponse,
    rankOrdersResponse,
  ] = await Promise.all([
    supabase
      .from("user_vouchers")
      .select(
        `
        id,
        source,
        title,
        description,
        percent_off,
        fixed_amount_off,
        free_shipping,
        min_order_amount,
        max_discount_amount,
        status,
        code,
        expires_at,
        issued_at
      `
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("issued_at", { ascending: false }),
    supabase
      .from("loyalty_transactions")
      .select("id, transaction_type, points, description, created_at, order_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("user_notifications")
      .select("id, title, body, category, read_at, created_at, metadata")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "Cancelled"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("reward_source", "rank")
      .gt("shipping_discount_amount", 0)
      .neq("status", "Cancelled")
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  return {
    storeSettings,
    rewardSettings,
    loyaltyAccount,
    activeVouchers: toArray<VoucherRow>(vouchersResponse.data).map(
      (voucher): UserVoucher => ({
        id: voucher.id,
        source: voucher.source,
        title: voucher.title,
        description: voucher.description,
        percentOff: voucher.percent_off === null ? null : toNumber(voucher.percent_off),
        fixedAmountOff: voucher.fixed_amount_off === null ? null : toNumber(voucher.fixed_amount_off),
        freeShipping: Boolean(voucher.free_shipping),
        minOrderAmount: toNumber(voucher.min_order_amount),
        maxDiscountAmount: voucher.max_discount_amount === null ? null : toNumber(voucher.max_discount_amount),
        status: voucher.status,
        code: voucher.code,
        expiresAt: voucher.expires_at,
        issuedAt: voucher.issued_at,
      })
    ),
    recentTransactions: toArray<LoyaltyTransactionRow>(transactionResponse.data).map(
      (entry): LoyaltyTransaction => ({
        id: entry.id,
        transactionType: entry.transaction_type,
        points: toNumber(entry.points),
        description: entry.description,
        createdAt: entry.created_at,
        orderId: entry.order_id,
      })
    ),
    notifications: toArray<UserNotificationRow>(notificationsResponse.data).map(
      (entry): NotificationRecord => ({
        id: entry.id,
        title: entry.title,
        body: entry.body,
        category: entry.category,
        readAt: entry.read_at,
        createdAt: entry.created_at,
        metadata: entry.metadata ?? {},
      })
    ),
    nonCancelledOrderCount: nonCancelledOrdersResponse.count ?? 0,
    monthlyRankFreeShippingUsed: rankOrdersResponse.count ?? 0,
  };
}

function getWeekStamp(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}

function getExpiryDate(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function awardDeliveredOrderRewards(
  supabase: SupabaseClientLike,
  order: OrderRewardRow,
  rewardSettings: RewardSettings
) {
  if (!order.user_id) {
    return;
  }

  const loyaltyAccount = await ensureLoyaltyAccount(supabase, order.user_id, rewardSettings);
  const orderTotal = toNumber(order.total) || toNumber(order.subtotal) + toNumber(order.delivery_fee);
  const basePoints = Math.max(0, Math.round(orderTotal));
  let bonusPoints = 0;
  const transactions: Array<{
    transaction_type: string;
    points: number;
    description: string;
    order_id: string;
  }> = [
    {
      transaction_type: "order_spend",
      points: basePoints,
      description: `Earned ${basePoints} points from order ${order.order_number}.`,
      order_id: order.id,
    },
  ];

  if (isDoublePointsActive(rewardSettings)) {
    const extra = basePoints * Math.max(0, rewardSettings.doublePointsMultiplier - 1);
    if (extra > 0) {
      bonusPoints += extra;
      transactions.push({
        transaction_type: "double_points",
        points: extra,
        description: `Double points bonus on order ${order.order_number}.`,
        order_id: order.id,
      });
    }
  }

  const { start, end } = getCurrentMonthRange(new Date(order.created_at));
  const deliveredThisMonthResponse = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", order.user_id)
    .eq("status", "Delivered")
    .neq("id", order.id)
    .gte("created_at", start)
    .lt("created_at", end);

  if ((deliveredThisMonthResponse.count ?? 0) === 0 && rewardSettings.firstOrderOfMonthPoints > 0) {
    bonusPoints += rewardSettings.firstOrderOfMonthPoints;
    transactions.push({
      transaction_type: "first_order_of_month",
      points: rewardSettings.firstOrderOfMonthPoints,
      description: "First delivered order of the month bonus.",
      order_id: order.id,
    });
  }

  const holidayMatch = rewardSettings.holidayBonusDays.find(
    (rule) => rule.monthDay === formatMonthDay(new Date(order.created_at))
  );

  if (holidayMatch && rewardSettings.holidayBonusPoints > 0) {
    bonusPoints += rewardSettings.holidayBonusPoints;
    transactions.push({
      transaction_type: "holiday_bonus",
      points: rewardSettings.holidayBonusPoints,
      description: `${holidayMatch.label} bonus points.`,
      order_id: order.id,
    });
  }

  const nextYearlyPoints = loyaltyAccount.yearlyPoints + basePoints + bonusPoints;
  const previousTier = getCurrentLoyaltyTier(loyaltyAccount.yearlyPoints, rewardSettings.loyaltyTiers);
  const nextTier = getCurrentLoyaltyTier(nextYearlyPoints, rewardSettings.loyaltyTiers);

  let nextStreakWeeks = loyaltyAccount.streakWeeks || 0;
  const previousWeekStamp = getWeekStamp(loyaltyAccount.lastDeliveredOrderAt);
  const currentWeekStamp = getWeekStamp(order.created_at);
  if (!previousWeekStamp || !currentWeekStamp) {
    nextStreakWeeks = 1;
  } else if (currentWeekStamp === previousWeekStamp) {
    nextStreakWeeks = Math.max(1, loyaltyAccount.streakWeeks);
  } else {
    const previousDate = new Date(loyaltyAccount.lastDeliveredOrderAt ?? order.created_at);
    const currentDate = new Date(order.created_at);
    const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / 86400000);
    nextStreakWeeks = dayDiff >= 7 && dayDiff <= 13 ? loyaltyAccount.streakWeeks + 1 : 1;
  }

  await supabase.from("orders").update({
    points_earned: basePoints,
    bonus_points_earned: bonusPoints,
  }).eq("id", order.id);

  await supabase.from("loyalty_accounts").upsert(
    {
      user_id: loyaltyAccount.userId,
      total_points: loyaltyAccount.totalPoints + basePoints + bonusPoints,
      yearly_points: nextYearlyPoints,
      current_rank: nextTier?.name ?? loyaltyAccount.currentRank,
      lifetime_spent: loyaltyAccount.lifetimeSpent + orderTotal,
      yearly_spent: loyaltyAccount.yearlySpent + orderTotal,
      total_orders: loyaltyAccount.totalOrders + 1,
      delivered_orders: loyaltyAccount.deliveredOrders + 1,
      streak_weeks: nextStreakWeeks,
      last_order_at: order.created_at,
      last_delivered_order_at: order.created_at,
      reset_year: getCurrentYear(new Date(order.created_at)),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (transactions.length > 0) {
    await supabase.from("loyalty_transactions").insert(
      transactions.map((entry) => ({
        user_id: order.user_id,
        order_id: entry.order_id,
        transaction_type: entry.transaction_type,
        points: entry.points,
        description: entry.description,
      }))
    );
  }

  await createUserNotification(
    supabase,
    order.user_id,
    `You earned ${basePoints + bonusPoints} points`,
    `Order ${order.order_number} added ${basePoints + bonusPoints} points to your account.`,
    "reward",
    { orderId: order.id }
  );

  if (
    previousTier &&
    nextTier &&
    previousTier.id !== nextTier.id &&
    rewardSettings.rankUpVoucherPercent > 0
  ) {
    await issueUserVoucher(supabase, order.user_id, {
      source: "rank_up",
      title: `Rank-up reward: ${nextTier.name}`,
      description: `${rewardSettings.rankUpVoucherPercent}% off for reaching ${nextTier.name}.`,
      percentOff: rewardSettings.rankUpVoucherPercent,
      expiresAt: getExpiryDate(30),
      metadata: { rank: nextTier.name },
    });
  }

  if (
    rewardSettings.streakEnabled &&
    nextStreakWeeks >= rewardSettings.streakWeeksRequired &&
    loyaltyAccount.streakWeeks < rewardSettings.streakWeeksRequired
  ) {
    await issueUserVoucher(supabase, order.user_id, {
      source: "streak",
      title: "Streak bonus unlocked",
      description: `${rewardSettings.streakRewardPercent}% off for ordering ${rewardSettings.streakWeeksRequired} weeks in a row.`,
      percentOff: rewardSettings.streakRewardPercent,
      expiresAt: getExpiryDate(14),
      metadata: { streakWeeks: nextStreakWeeks },
    });
  }
}

export async function awardReviewPoints(
  supabase: SupabaseClientLike,
  userId: string,
  orderId: string,
  orderNumber: string,
  rewardSettings: RewardSettings
) {
  if (rewardSettings.reviewPoints <= 0) {
    return;
  }

  const existingReviewBonusResponse = await supabase
    .from("loyalty_transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("order_id", orderId)
    .eq("transaction_type", "review_bonus")
    .maybeSingle();

  if (existingReviewBonusResponse.data?.id) {
    return;
  }

  const loyaltyAccount = await ensureLoyaltyAccount(supabase, userId, rewardSettings);
  const nextYearlyPoints = loyaltyAccount.yearlyPoints + rewardSettings.reviewPoints;
  const previousTier = getCurrentLoyaltyTier(loyaltyAccount.yearlyPoints, rewardSettings.loyaltyTiers);
  const nextTier = getCurrentLoyaltyTier(nextYearlyPoints, rewardSettings.loyaltyTiers);

  await supabase.from("loyalty_transactions").insert({
    user_id: userId,
    order_id: orderId,
    transaction_type: "review_bonus",
    points: rewardSettings.reviewPoints,
    description: `Review bonus for order ${orderNumber}.`,
  });

  await supabase.from("loyalty_accounts").upsert(
    {
      user_id: loyaltyAccount.userId,
      total_points: loyaltyAccount.totalPoints + rewardSettings.reviewPoints,
      yearly_points: nextYearlyPoints,
      current_rank: nextTier?.name ?? loyaltyAccount.currentRank,
      lifetime_spent: loyaltyAccount.lifetimeSpent,
      yearly_spent: loyaltyAccount.yearlySpent,
      total_orders: loyaltyAccount.totalOrders,
      delivered_orders: loyaltyAccount.deliveredOrders,
      streak_weeks: loyaltyAccount.streakWeeks,
      last_order_at: loyaltyAccount.lastOrderAt,
      last_delivered_order_at: loyaltyAccount.lastDeliveredOrderAt,
      reset_year: loyaltyAccount.resetYear,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  await createUserNotification(
    supabase,
    userId,
    "Thanks for the review",
    `You earned ${rewardSettings.reviewPoints} points for sharing feedback on order ${orderNumber}.`,
    "reward",
    { orderId }
  );

  if (
    previousTier &&
    nextTier &&
    previousTier.id !== nextTier.id &&
    rewardSettings.rankUpVoucherPercent > 0
  ) {
    await issueUserVoucher(supabase, userId, {
      source: "rank_up",
      title: `Rank-up reward: ${nextTier.name}`,
      description: `${rewardSettings.rankUpVoucherPercent}% off for reaching ${nextTier.name}.`,
      percentOff: rewardSettings.rankUpVoucherPercent,
      expiresAt: getExpiryDate(30),
      metadata: { rank: nextTier.name, via: "review" },
    });
  }
}

export async function markNotificationRead(
  supabase: SupabaseClientLike,
  userId: string,
  notificationId: string | null,
  markAll = false
) {
  if (markAll) {
    await supabase
      .from("user_notifications")
      .update({ read_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    return;
  }

  if (!notificationId) {
    return;
  }

  await supabase
    .from("user_notifications")
    .update({ read_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", notificationId);
}

export function getAvailableRewardOptions(summary: RewardSummary, now = new Date()) {
  return [
    ...buildCampaignRewardOptions(summary.rewardSettings, summary.nonCancelledOrderCount, now),
    ...buildVoucherRewardOptions(summary.activeVouchers),
    ...(
      (() => {
        const rankOption = buildRankRewardOption(
          summary.loyaltyAccount,
          summary.rewardSettings,
          summary.monthlyRankFreeShippingUsed
        );
        return rankOption ? [rankOption] : [];
      })()
    ),
  ];
}
