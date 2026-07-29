import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ContactTable from "@/components/contact/ContactTable";
import BasicTableOne from "@/components/tables/BasicTableOne";
import { getContacts } from "@/lib/contacts.api";
import { Contact } from "@/types/contact";
import { Metadata } from "next";
import React from "react";



export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Contacts" />
      <div className="space-y-6">
        <ComponentCard title="Contacts Management">
          <ContactTable />
        </ComponentCard>
      </div>
    </div>
  );
}
