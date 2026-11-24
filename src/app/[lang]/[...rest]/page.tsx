import { notFound } from "next/navigation";

// Any unknown address under /ar, /fr or /en shows the branded 404 page (inside the
// site's header and footer) instead of the plain default one.
export default function UnknownPage(): never {
  notFound();
}
