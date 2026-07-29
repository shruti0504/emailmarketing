"use client";

import React, { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import AudienceForm from "./AudienceForm";
import AlertNotification from "../ui/alert/AlertNotification";
import {
  deleteAudience,
  getAudiences,
} from "@/lib/audiences.api";
import { Audience } from "@/types/audience";

export default function AudienceTable() {
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const fetchAudiences = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAudiences();
      setAudiences(data);
    } catch (error: any) {
      console.error("Failed to fetch audiences:", error);
      setError(
        error.response?.data?.message || "Failed to load audiences."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      setAlertInfo(null);
      await deleteAudience(id);
      setAlertInfo({
        variant: "success",
        title: "Deleted",
        message: "Audience deleted successfully.",
      });
      setDeleteConfirmId(null);
      await fetchAudiences();
    } catch (error: any) {
      setAlertInfo({
        variant: "error",
        title: "Delete Failed",
        message: error.response?.data?.message || "Failed to delete audience.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Audiences / Contact Groups
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Segment your contacts by tags or geographical cities
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Audience
        </button>
      </div>

      {/* Alert Notifications */}
      {alertInfo && (
        <AlertNotification
          variant={alertInfo.variant}
          title={alertInfo.title}
          message={alertInfo.message}
          onClose={() => setAlertInfo(null)}
          durationMs={2500}
        />
      )}

      {/* Delete Confirmation Box */}
      {deleteConfirmId && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/40 dark:bg-red-950/40 flex items-center justify-between">
          <div className="text-red-700 dark:text-red-300 font-medium">
            Are you sure you want to delete this audience group?
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

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6">
          <AudienceForm
            onCancel={() => setShowCreateForm(false)}
            onSuccess={async () => {
              await fetchAudiences();
              setShowCreateForm(false);
            }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    Name
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    City
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    Tags
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    Matched Contacts
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center">
                      Loading audiences...
                    </TableCell>
                  </TableRow>
                ) : audiences.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center">
                      No audiences found.
                    </TableCell>
                  </TableRow>
                ) : (
                  audiences.map((audience) => (
                    <TableRow key={audience.id}>
                      <TableCell className="px-5 py-4">
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {audience.name}
                        </span>
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {audience.filterJson?.city || "-"}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {audience.filterJson?.tags?.length
                          ? audience.filterJson.tags.join(", ")
                          : "-"}
                      </TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {audience.count ?? 0}
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        <button
                          onClick={() => setDeleteConfirmId(audience.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
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