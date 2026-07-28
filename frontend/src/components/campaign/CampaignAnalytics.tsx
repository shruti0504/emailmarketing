"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getCampaignAnalytics, getCampaignById } from "@/lib/campaigns.api";
import { Campaign, CampaignAnalytics as AnalyticsData, RecipientStatus } from "@/types/campaign";
import Badge from "../ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";

interface CampaignAnalyticsProps {
  campaignId: string;
}

export default function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isPollingActive, setIsPollingActive] = useState(true);

  const fetchAnalyticsData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError("");

      const [campData, analyticsData] = await Promise.all([
        getCampaignById(campaignId),
        getCampaignAnalytics(campaignId),
      ]);

      setCampaign(campData);
      setAnalytics(analyticsData);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error("Failed to load campaign analytics:", err);
      setError(
        err.response?.data?.message || "Failed to fetch live analytics data."
      );
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [campaignId]);

  // Initial load
  useEffect(() => {
    fetchAnalyticsData(true);
  }, [fetchAnalyticsData]);

  // Real-time polling every 3 seconds
  useEffect(() => {
    if (!isPollingActive) return;

    const interval = setInterval(() => {
      fetchAnalyticsData(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchAnalyticsData, isPollingActive]);

  const getRecipientStatusBadge = (status: RecipientStatus) => {
    switch (status) {
      case "OPENED":
        return <Badge color="success" size="sm">OPENED</Badge>;
      case "DELIVERED":
        return <Badge color="info" size="sm">DELIVERED</Badge>;
      case "SENT":
        return <Badge color="primary" size="sm">SENT</Badge>;
      case "FAILED":
        return <Badge color="error" size="sm">FAILED</Badge>;
      case "PENDING":
      default:
        return <Badge color="light" size="sm">PENDING</Badge>;
    }
  };

  const calculatePercentage = (count: number, total: number) => {
    if (!total || total === 0) return "0%";
    return `${Math.round((count / total) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/campaigns"
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              &larr; Back to Campaigns
            </Link>
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <span>{campaign?.name || "Campaign Performance Analytics"}</span>
            {campaign?.status && (
              <Badge color={campaign.status === "SENT" ? "success" : "warning"} size="sm">
                {campaign.status}
              </Badge>
            )}
          </h1>
          {campaign?.subject && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Subject: <span className="font-medium text-gray-700 dark:text-gray-300">{campaign.subject}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPollingActive ? "bg-green-400" : "bg-gray-400"} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPollingActive ? "bg-green-500" : "bg-gray-500"}`}></span>
            </span>
            <span>Live Refreshed: {lastRefreshed.toLocaleTimeString()}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPollingActive(!isPollingActive)}
            className="text-xs rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {isPollingActive ? "Pause Auto-Refresh" : "Resume Auto-Refresh"}
          </button>

          <button
            type="button"
            onClick={() => fetchAnalyticsData(false)}
            className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Analytics KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Recipients */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Total Recipients
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
            {loading ? "..." : analytics?.totalRecipients ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-400">Target Contacts</div>
        </div>

        {/* Sent */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Sent
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {loading ? "..." : analytics?.sent ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {calculatePercentage(analytics?.sent || 0, analytics?.totalRecipients || 0)} of target
          </div>
        </div>

        {/* Delivered */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Delivered
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {loading ? "..." : analytics?.delivered ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {calculatePercentage(analytics?.delivered || 0, analytics?.totalRecipients || 0)} delivery rate
          </div>
        </div>

        {/* Opened */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Opened
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {loading ? "..." : analytics?.opened ?? 0}
          </div>
          <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-semibold">
            {calculatePercentage(analytics?.opened || 0, analytics?.totalRecipients || 0)} open rate
          </div>
        </div>

        {/* Failed / Bounced */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Failed / Bounced
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {loading ? "..." : analytics?.failed ?? 0}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {calculatePercentage(analytics?.failed || 0, analytics?.totalRecipients || 0)} fail rate
          </div>
        </div>
      </div>

      {/* Recipient Breakdown Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              Recipient Delivery & Engagement Log
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live status breakdown for each recipient in this campaign
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400 text-xs">
                    Recipient Name
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400 text-xs">
                    Email Address
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400 text-xs">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400 text-xs">
                    Delivered At
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400 text-xs">
                    Opened At
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500">
                      Loading recipients details...
                    </TableCell>
                  </TableRow>
                ) : !campaign?.recipients || campaign.recipients.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500">
                      No recipients recorded for this campaign yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaign.recipients.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="px-5 py-3.5 text-start font-medium text-gray-800 dark:text-white/90 text-sm">
                        {rec.contact?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-start text-gray-500 dark:text-gray-400 text-xs font-mono">
                        {rec.contact?.email || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-start">
                        {getRecipientStatusBadge(rec.status)}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-start text-gray-500 dark:text-gray-400 text-xs">
                        {rec.deliveredAt ? new Date(rec.deliveredAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="px-5 py-3.5 text-start text-gray-500 dark:text-gray-400 text-xs">
                        {rec.openedAt ? new Date(rec.openedAt).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
