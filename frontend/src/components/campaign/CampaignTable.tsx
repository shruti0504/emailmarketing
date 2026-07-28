"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getCampaigns } from "@/lib/campaigns.api";
import { Campaign, CampaignStatus } from "@/types/campaign";

interface CampaignTableProps {
  onCreateClick?: () => void;
}

export default function CampaignTable({ onCreateClick }: CampaignTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      console.error("Failed to fetch campaigns:", err);
      setError(
        err.response?.data?.message || "Failed to load campaigns list."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case "SENT":
        return <Badge color="success" size="sm">SENT</Badge>;
      case "SENDING":
        return <Badge color="info" size="sm">SENDING</Badge>;
      case "SCHEDULED":
        return <Badge color="warning" size="sm">SCHEDULED</Badge>;
      case "DRAFT":
      default:
        return <Badge color="light" size="sm">DRAFT</Badge>;
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Campaigns
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Overview of sent, scheduled, and active email campaigns
          </p>
        </div>

        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Create Campaign
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Campaign Name & Subject
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Status
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Scheduled / Sent Date
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Created At
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500">
                      Loading campaigns...
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500">
                      No campaigns found. Click "+ Create Campaign" to launch your first email campaign.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      {/* Name & Subject */}
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                            {campaign.name}
                          </span>
                          <span className="text-xs text-gray-500 truncate max-w-xs dark:text-gray-400">
                            Subject: {campaign.subject}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="px-5 py-4 text-start">
                        {getStatusBadge(campaign.status)}
                      </TableCell>

                      {/* Scheduled Date */}
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {campaign.scheduledAt
                          ? new Date(campaign.scheduledAt).toLocaleString()
                          : "Immediate"}
                      </TableCell>

                      {/* Created At */}
                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-4 py-3 text-start">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/campaigns/${campaign.id}/analytics`}
                            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            Analytics & Stats
                          </Link>
                        </div>
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
