"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { getDefaultRewardSettings, getDefaultStoreSettings } from "@/lib/rewards/defaults";
import {
  applyRewardOption,
  buildCampaignRewardOptions,
  buildRankRewardOption,
  buildVoucherRewardOptions,
  findBestRewardOption,
  getNextLoyaltyTier,
  getNextOrderValueMilestone,
  getRankProgress,
} from "@/lib/rewards/engine";
import type { RewardOption, RewardSelection, RewardSummary } from "@/lib/rewards/types";

export function useRewards(user: User | null) {
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!user) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/rewards/summary", { cache: "no-store" });
    const body = (await response.json()) as { summary?: RewardSummary };

    if (!response.ok || !body.summary) {
      setSummary(null);
      setLoading(false);
      return;
    }

    setSummary(body.summary);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchSummary();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchSummary]);

  useEffect(() => {
    if (!user) return;

    const intervalId = window.setInterval(() => {
      void fetchSummary();
    }, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchSummary, user]);

  const storeSettings = summary?.storeSettings ?? getDefaultStoreSettings();
  const rewardSettings = summary?.rewardSettings ?? getDefaultRewardSettings();
  const availableOptions = useMemo(() => {
    if (!summary) return [] as RewardOption[];

    const rankOption = buildRankRewardOption(
      summary.loyaltyAccount,
      rewardSettings,
      summary.monthlyRankFreeShippingUsed
    );

    return [
      ...buildCampaignRewardOptions(rewardSettings, summary.nonCancelledOrderCount),
      ...buildVoucherRewardOptions(summary.activeVouchers),
      ...(rankOption ? [rankOption] : []),
    ];
  }, [rewardSettings, summary]);
  const rankProgress = useMemo(
    () => getRankProgress(summary?.loyaltyAccount?.yearlyPoints ?? 0, rewardSettings.loyaltyTiers),
    [rewardSettings.loyaltyTiers, summary?.loyaltyAccount?.yearlyPoints]
  );

  const getCartRewards = useCallback(
    (subtotal: number, deliveryFee: number, selection: RewardSelection, disableAutoSelection = false) => {
      const eligibleOptions = availableOptions.filter(
        (option) =>
          subtotal >= option.minOrderAmount &&
          applyRewardOption(subtotal, deliveryFee, option).total < subtotal + deliveryFee
      );
      const manualSelection = selection
        ? eligibleOptions.find((option) => option.source === selection.source && option.id === selection.id) ?? null
        : null;
      const selectedOption = disableAutoSelection
        ? manualSelection
        : manualSelection ?? findBestRewardOption(eligibleOptions, subtotal, deliveryFee);
      const computed = applyRewardOption(subtotal, deliveryFee, selectedOption);

      return {
        eligibleOptions,
        selectedOption,
        computed,
        nextMilestone: getNextOrderValueMilestone(subtotal, rewardSettings),
      };
    },
    [availableOptions, rewardSettings]
  );

  return {
    summary,
    loading,
    storeSettings,
    rewardSettings,
    availableOptions,
    rankProgress,
    nextRank: getNextLoyaltyTier(summary?.loyaltyAccount?.yearlyPoints ?? 0, rewardSettings.loyaltyTiers),
    refetch: fetchSummary,
    getCartRewards,
  };
}
