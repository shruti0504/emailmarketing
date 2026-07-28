import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AudienceTable from "@/components/audience/AudienceTable";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Audiences",
    description: "Manage your contact audiences",
};

export default function AudiencesPage() {
    return (
        <div>

            <PageBreadcrumb
                pageTitle="Audiences"
            />

            <div className="space-y-6">

                <ComponentCard title="Audience Management">

                    <AudienceTable />

                </ComponentCard>

            </div>

        </div>
    );
}