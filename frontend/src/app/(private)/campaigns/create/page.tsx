"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CampaignForm from "@/components/campaign/CampaignForm";
import { useRouter } from "next/navigation";

export default function CreateCampaignPage() {
  const router = useRouter();

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Campaign" />

      <div className="space-y-6 max-w-4xl mx-auto">
        <CampaignForm
          onCancel={() => router.push("/campaigns")}
          onSuccess={() => router.push("/campaigns")}
        />
      </div>
    </div>
  );
}
