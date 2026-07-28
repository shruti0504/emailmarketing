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

import {
  deleteAudience,
  getAudiences,
} from "@/lib/audiences.api";

import { Audience } from "@/types/audience";

export default function AudienceTable() {
  const [audiences, setAudiences] =
    useState<Audience[]>([]);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchAudiences = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAudiences();

      setAudiences(data);

    } catch (error: any) {
      console.error(
        "Failed to fetch audiences:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load audiences."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
  }, []);

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this audience?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await deleteAudience(id);

      // Refresh table
      await fetchAudiences();

    } catch (error: any) {
      console.error(
        "Failed to delete audience:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete audience."
      );
    }
  };

  return (
    <div>

      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Audiences
        </h2>

        <button
          onClick={() =>
            setShowCreateForm(true)
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Audience
        </button>

      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6">

          <AudienceForm
            onCancel={() =>
              setShowCreateForm(false)
            }
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

          <div className="min-w-[900px]">

            <Table>

              {/* Header */}
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
                    Contacts
                  </TableCell>

                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>

                </TableRow>

              </TableHeader>

              {/* Body */}
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

                  audiences.map(
                    (audience) => (

                      <TableRow
                        key={audience.id}
                      >

                        {/* Name */}
                        <TableCell className="px-5 py-4">

                          <span className="font-medium text-gray-800 dark:text-white/90">

                            {audience.name}

                          </span>

                        </TableCell>

                        {/* City */}
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">

                          {audience
                            .filterJson
                            ?.city || "-"}

                        </TableCell>

                        {/* Tags */}
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">

                          {audience
                            .filterJson
                            ?.tags
                            ?.length
                            ? audience.filterJson.tags.join(
                                ", "
                              )
                            : "-"}

                        </TableCell>

                        {/* Count */}
                        <TableCell className="px-4 py-3 text-gray-500 dark:text-gray-400">

                          {audience.count ??
                            0}

                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-4 py-3">

                          <button
                            onClick={() =>
                              handleDelete(
                                audience.id
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>

                        </TableCell>

                      </TableRow>

                    )
                  )

                )}

              </TableBody>

            </Table>

          </div>

        </div>

      </div>

    </div>
  );
}