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
import AlertNotification from "../ui/alert/AlertNotification";
import { getCampaigns, deleteCampaign } from "@/lib/campaigns.api";
import { Campaign, CampaignStatus } from "@/types/campaign";

interface CampaignTableProps {
  onCreateClick?: () => void;
}

export default function CampaignTable({ onCreateClick }: CampaignTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

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

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      setAlertInfo(null);
      
      await deleteCampaign(id);
      
      setAlertInfo({
        variant: "success",
        title: "Deleted",
        message: "Campaign deleted successfully.",
      });
      setDeleteConfirmId(null);
      
      // Update UI state asynchronously without needing page refresh
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setAlertInfo({
        variant: "error",
        title: "Delete Failed",
        message: err.response?.data?.message || "Failed to delete campaign.",
      });
    } finally {
      setDeleting(false);
    }
  };

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

      {/* Alert Notifications */}
      {alertInfo && (
        <div className="mb-4">
          <AlertNotification
            variant={alertInfo.variant}
            title={alertInfo.title}
            message={alertInfo.message}
            onClose={() => setAlertInfo(null)}
            durationMs={2500}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/40 dark:bg-red-950/40 flex items-center justify-between">
          <div className="text-red-700 dark:text-red-300 font-medium">
            Are you sure you want to delete this campaign? This action cannot be undone.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              disabled={deleting}
              className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[850px]">
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDeleteConfirmId(campaign.id)}
                            className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                          >
                            Delete
                          </button>
                          <Link
                            href={`/campaigns/${campaign.id}/analytics`}
                            className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            Stats
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
