"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import ContactForm from "./ContactForm";
import { deleteContact, getContacts, importContacts } from "@/lib/contacts.api";
import { Contact } from "@/types/contact";

interface ImportSummary {
    total: number;
    added: number;
    duplicates: number;
    failed: number;
}

export default function ContactTable() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    // CSV import states
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getContacts();

                setContacts(data);
            } catch (error: any) {
                console.error(
                    "Failed to fetch contacts:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "Failed to load contacts."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);
    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this contact?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await deleteContact(id);

            // Refresh table after deletion
            await getContacts();

        } catch (error: any) {
            console.error(
                "Failed to delete contact:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete contact."
            );
        }
    };
    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setShowCreateForm(true);
    };

    const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingCsv(true);
            setError("");
            setImportSummary(null);

            const res = await importContacts(file);
            setImportSummary(res.data);

            // Refetch contacts table
            const data = await getContacts();
            setContacts(data);
        } catch (err: any) {
            console.error("CSV upload failed:", err);
            setError(err.response?.data?.message || "Failed to import contacts from CSV.");
        } finally {
            setUploadingCsv(false);
            e.target.value = "";
        }
    };

    return (
        <div>
            {/* Top Bar */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Contacts
                </h2>

                <div className="flex items-center gap-3">
                    <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
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
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        + Create Contact
                    </button>
                </div>
            </div>

            {/* CSV Import Summary Result Card */}
            {importSummary && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-base">CSV Import Completed</span>
                        <button
                            onClick={() => setImportSummary(null)}
                            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                            Dismiss
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 font-medium">
                        <div>Total Records in CSV: <span className="font-bold">{importSummary.total}</span></div>
                        <div className="text-green-700 dark:text-green-400">Added: <span className="font-bold">{importSummary.added}</span></div>
                        <div className="text-amber-700 dark:text-amber-400">Duplicates Skipped: <span className="font-bold">{importSummary.duplicates}</span></div>
                        <div className="text-red-700 dark:text-red-400">Failed / Invalid: <span className="font-bold">{importSummary.failed}</span></div>
                    </div>
                </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
                <div className="mb-6">
                    <ContactForm
                        contact={editingContact}
                        onCancel={() => {
                            setShowCreateForm(false);
                            setEditingContact(null);
                        }}
                        onSuccess={async () => {
                            const data = await getContacts();
                            setContacts(data);

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
                    <div className="min-w-[800px]">
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
                                        Company
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
                                        <TableCell className="px-5 py-6 text-center">
                                            Loading contacts...
                                        </TableCell>
                                    </TableRow>
                                ) : contacts.length === 0 ? (
                                    <TableRow>
                                        <TableCell className="px-5 py-6 text-center">
                                            No contacts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contacts.map((contact) => (
                                        <TableRow key={contact.id}>

                                            <TableCell className="px-5 py-4 sm:px-6 text-start">
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
                                                {contact.customFields?.company || "-"}
                                            </TableCell>
                                            <TableCell className="px-4 py-3 text-start">
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleEdit(contact)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(contact.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
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