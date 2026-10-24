import Link from "next/link";
import Image from "next/image";

export function Brand({
  onClick,
}: {
  onClick?: () => void;
}): React.JSX.Element {
  return (
    <Link
      href="/dashboard"
      className="brand"
      onClick={onClick}
      aria-label="Harkai, inicio"
    >
      <Image
        src="/brand-symbol.png"
        alt=""
        width={55}
        height={55}
        className="brand-icon"
        unoptimized
      />
      <span className="brand-wordmark">
        harkai<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
