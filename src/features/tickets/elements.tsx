import type { ButtonHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { ArrowRight, ImageIcon, RefreshCw, Ticket, X } from "lucide-react";
import { Notice } from "@/components/ui";

export function ActionButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`button helpdesk-action ${className}`} {...props} />
  );
}
export function Alert({
  children,
  variant,
}: {
  children?: ReactNode;
  variant?: "success";
}) {
  return children ? (
    <Notice error={variant !== "success"}>{children}</Notice>
  ) : null;
}
const icons = {
  arrow: ArrowRight,
  image: ImageIcon,
  refresh: RefreshCw,
  ticket: Ticket,
  close: X,
};
export function Icon({ name }: { name: keyof typeof icons }) {
  const Symbol = icons[name];
  return <Symbol className="ui-icon" aria-hidden />;
}
export function Photo(props: ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element -- Private screenshots require the browser's HttpOnly session cookie.
  return <img {...props} alt={props.alt ?? ""} />;
}
