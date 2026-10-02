import { SignupForm } from "@/components/SignupForm";
import type { Metadata } from "next";
import { pickTitleLocale } from "@/lib/content/pageTitles";

const TITLES = {
  de: "Registrieren – QET Kultur-Kompass",
  en: "Sign Up – QET Culture Compass",
  tr: "Kayıt Ol – QET Kültür Pusulası",
  ro: "Înregistrare – Busola Culturii QET",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  return { title: TITLES[pickTitleLocale(searchParams)] };
}

export default function StartPage() {
  return <SignupForm />;
}
