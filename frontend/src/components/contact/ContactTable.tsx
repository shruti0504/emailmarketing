"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import ContactForm from "./ContactForm";
import AlertNotification from "../ui/alert/AlertNotification";
import Badge from "../ui/badge/Badge";
import { deleteContact, getContacts, importContacts } from "@/lib/contacts.api";
import { Contact } from "@/types/contact";

interface ImportSummary {
    total: number;
    imported: number;
    added: number;
    duplicates: number;
    skipped: number;
    failed: number;
    failedRows?: { rowNumber: number; reason: string }[];
}

export default function ContactTable() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Delete state
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // CSV import states
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
    const [alertInfo, setAlertInfo] = useState<{
        variant: "success" | "error";
        title: string;
        message: string;
    } | null>(null);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getContacts();
            setContacts(data);
        } catch (error: any) {
            console.error("Failed to fetch contacts:", error);
            setError(
                error.response?.data?.message || "Failed to load contacts."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            setDeleting(true);
            setAlertInfo(null);

            await deleteContact(id);

            setAlertInfo({
                variant: "success",
                title: "Deleted",
                message: "Contact deleted successfully.",
            });
            setDeleteConfirmId(null);
            
            // Asynchronously update contacts state without page refresh
            setContacts((prev) => prev.filter((c) => c.id !== id));
        } catch (error: any) {
            setAlertInfo({
                variant: "error",
                title: "Delete Failed",
                message: error.response?.data?.message || "Failed to delete contact.",
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setShowCreateForm(true);
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation 1: Extension check
        if (!file.name.toLowerCase().endsWith(".csv")) {
            setAlertInfo({
                variant: "error",
                title: "Invalid File Format",
                message: "Please select a valid .csv file.",
            });
            e.target.value = "";
            return;
        }

        // Validation 2: Size check (max 5MB)
        const MAX_SIZE_BYTES = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE_BYTES) {
            setAlertInfo({
                variant: "error",
                title: "File Too Large",
                message: "CSV file size must not exceed 5MB.",
            });
            e.target.value = "";
            return;
        }

        try {
            setUploadingCsv(true);
            setError("");
            setImportSummary(null);
            setAlertInfo(null);

            const res = await importContacts(file);
            const summaryData: ImportSummary = res.data;
            setImportSummary(summaryData);

            setAlertInfo({
                variant: summaryData.added > 0 ? "success" : "error",
                title: summaryData.added > 0 ? "Import Complete" : "Import Result",
                message: `Imported ${summaryData.added} contacts (${summaryData.duplicates} duplicates skipped, ${summaryData.failed} failed).`,
            });

            await fetchContacts();
        } catch (err: any) {
            console.error("CSV upload failed:", err);
            setAlertInfo({
                variant: "error",
                title: "CSV Import Failed",
                message: err.response?.data?.message || err.message || "Failed to import contacts from CSV.",
            });
        } finally {
            setUploadingCsv(false);
            e.target.value = "";
        }
    };

    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) return contacts;
        const q = searchQuery.toLowerCase();
        return contacts.filter((c) => {
            const name = c.name?.toLowerCase() || "";
            const email = c.email?.toLowerCase() || "";
            const phone = c.phone?.toLowerCase() || "";
            const city = c.city?.toLowerCase() || "";
            const tags = Array.isArray(c.tags) ? c.tags.join(" ").toLowerCase() : "";
            return name.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q) || tags.includes(q);
        });
    }, [contacts, searchQuery]);

    return (
        <div>
            {/* Top Bar */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Contacts
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Manage subscribers, customer details, and tag segments
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search input */}
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />

                    <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition">
                        {uploadingCsv ? "Uploading CSV..." : "Import CSV"}
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleCsvUpload}
                            disabled={uploadingCsv}
                            className="hidden"
                        />
                    </label>

                    <button
                        onClick={() => {
                            setEditingContact(null);
                            setShowCreateForm(true);
                        }}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                        + Create Contact
                    </button>
                </div>
            </div>

            {/* Alert Notification */}
            {alertInfo && (
                <div className="mb-4">
                    <AlertNotification
                        variant={alertInfo.variant}
                        title={alertInfo.title}
                        message={alertInfo.message}
                        onClose={() => setAlertInfo(null)}
                        durationMs={3000}
                    />
                </div>
            )}

            {/* Delete Confirmation Box */}
            {deleteConfirmId && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-900/40 dark:bg-red-950/40 flex items-center justify-between">
                    <div className="text-red-700 dark:text-red-300 font-medium">
                        Are you sure you want to delete this contact?
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

            {/* CSV Import Summary Result Card */}
            {importSummary && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-base">CSV Import Summary</span>
                        <button
                            onClick={() => setImportSummary(null)}
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400 font-medium"
                        >
                            Dismiss
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 font-medium bg-white/60 dark:bg-gray-900/40 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                        <div>Total Records: <span className="font-bold text-gray-900 dark:text-white">{importSummary.total}</span></div>
                        <div className="text-green-700 dark:text-green-400">Added: <span className="font-bold">{importSummary.added}</span></div>
                        <div className="text-amber-700 dark:text-amber-400">Duplicates Skipped: <span className="font-bold">{importSummary.duplicates}</span></div>
                        <div className="text-red-700 dark:text-red-400">Failed / Invalid: <span className="font-bold">{importSummary.failed}</span></div>
                    </div>

                    {importSummary.failedRows && importSummary.failedRows.length > 0 && (
                        <div className="mt-3 text-xs bg-red-50 p-2.5 rounded border border-red-200 dark:bg-red-950/40 dark:border-red-900 text-red-800 dark:text-red-300">
                            <span className="font-semibold">Failed Row Details:</span>
                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                                {importSummary.failedRows.slice(0, 5).map((row, idx) => (
                                    <li key={idx}>Line {row.rowNumber}: {row.reason}</li>
                                ))}
                                {importSummary.failedRows.length > 5 && (
                                    <li>...and {importSummary.failedRows.length - 5} more failed rows</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Create / Edit Form */}
            {showCreateForm && (
                <div className="mb-6">
                    <ContactForm
                        contact={editingContact}
                        onCancel={() => {
                            setShowCreateForm(false);
                            setEditingContact(null);
                        }}
                        onSuccess={async () => {
                            await fetchContacts();
                            setShowCreateForm(false);
                            setEditingContact(null);
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
                    <div className="min-w-[750px]">
                        <Table>
                            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Name
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Email
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Phone
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        City
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Tags
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
                                            Loading contacts...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredContacts.length === 0 ? (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center text-gray-500">
                                            No contacts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContacts.map((contact) => {
                                        return (
                                            <TableRow key={contact.id}>
                                                <TableCell className="px-5 py-4 text-start">
                                                    <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {contact.name}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {contact.email || "-"}
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {contact.phone || "-"}
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                                    {contact.city || "-"}
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-start">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(contact.tags) && contact.tags.length > 0 ? (
                                                            contact.tags.map((tag) => (
                                                                <Badge key={tag} color="info" size="sm">
                                                                    {tag}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="px-4 py-3 text-start">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => handleEdit(contact)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium text-xs dark:text-blue-400"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmId(contact.id)}
                                                            className="text-red-600 hover:text-red-800 font-medium text-xs dark:text-red-400"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}