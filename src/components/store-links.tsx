import { ArrowUpRight } from "lucide-react";
export function StoreLinks(): React.JSX.Element {
  return (
    <nav className="report-store-links" aria-label="Descargar Harkai">
      <a href="https://play.google.com/store/apps/details?id=com.lucast.harkai">
        <StoreIcon store="play" />
        <span>
          Android<strong>Google Play</strong>
        </span>
        <ArrowUpRight size={18} />
      </a>
      <a href="https://apps.apple.com/app/id6829396398">
        <StoreIcon store="apple" />
        <span>
          iPhone<strong>App Store</strong>
        </span>
        <ArrowUpRight size={18} />
      </a>
    </nav>
  );
}

function StoreIcon({ store }: { store: "play" | "apple" }): React.JSX.Element {
  return store === "play" ? (
    <svg
      className="store-symbol"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 3.5 18 16 5 28.5Z" fill="#5BC8F5" />
      <path d="m5 3.5 17 9.8-4 2.7Z" fill="#65D79A" />
      <path
        d="M18 16 22 13.3 26.2 15.7Q26.7 16 26.2 16.3L22 18.7Z"
        fill="#FFD16B"
      />
      <path d="m5 28.5 17-9.8-4-2.7Z" fill="#F57989" />
    </svg>
  ) : (
    <svg
      className="store-symbol"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#3989E8" />
      <g fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
        <path d="m12 8 10 17M20 8l-7.5 13M8 21h11M23 21h2M10 24l-1 1.8" />
      </g>
    </svg>
  );
}
