import { AccountSetupForm } from "@/components/AccountSetupForm";
import type { Metadata } from "next";
import { pickTitleLocale } from "@/lib/content/pageTitles";

const TITLES = {
  de: "Konto einrichten – QET Kultur-Kompass",
  en: "Set Up Account – QET Culture Compass",
  tr: "Hesap Kurulumu – QET Kültür Pusulası",
  ro: "Configurare cont – Busola Culturii QET",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  return { title: TITLES[pickTitleLocale(searchParams)] };
}

export default function AccountSetupPage({ params }: { params: { token: string } }) {
  return <AccountSetupForm token={params.token} />;
}
