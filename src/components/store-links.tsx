import { ArrowUpRight, Smartphone } from "lucide-react";
export function StoreLinks(): React.JSX.Element {
  return (
    <nav className="report-store-links" aria-label="Descargar Harkai">
      <a href="https://play.google.com/store/apps/details?id=com.lucast.harkai">
        <Smartphone size={20} />
        <span>
          Android<strong>Google Play</strong>
        </span>
        <ArrowUpRight size={18} />
      </a>
      <a href="https://apps.apple.com/app/id6829396398">
        <Smartphone size={20} />
        <span>
          iPhone<strong>App Store</strong>
        </span>
        <ArrowUpRight size={18} />
      </a>
    </nav>
  );
}
