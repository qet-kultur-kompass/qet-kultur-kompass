import { LoginForm } from "@/components/LoginForm";
import type { Metadata } from "next";
import { pickTitleLocale } from "@/lib/content/pageTitles";

const TITLES = {
  de: "Login – QET Kultur-Kompass",
  en: "Login – QET Culture Compass",
  tr: "Giriş – QET Kültür Pusulası",
  ro: "Conectare – Busola Culturii QET",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  return { title: TITLES[pickTitleLocale(searchParams)] };
}

export default function LoginPage() {
  return <LoginForm />;
}
