import { CheckoutForm } from "@/components/CheckoutForm";
import type { Metadata } from "next";
import { pickTitleLocale } from "@/lib/content/pageTitles";

const TITLES = {
  de: "QET-Kompass kaufen",
  en: "Buy QET Compass",
  tr: "QET Pusulası Satın Al",
  ro: "Cumpărați Busola QET",
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  return { title: TITLES[pickTitleLocale(searchParams)] };
}

export default function CheckoutPage() {
  return <CheckoutForm />;
}
