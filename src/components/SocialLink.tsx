import { PHONE, useMedia } from "../lib/media";
import { socialKey } from "../lib/social";
import { ArrowUpRight, SocialIcon } from "./Icon";

/**
 * A link to one of the studio's social profiles. Phones show the network's icon (the name stays
 * as the accessible name and tooltip); larger screens show the name with an arrow.
 * The icon size and round shape live in global.css (`a.social-link[data-icon]`).
 */
export function SocialLink({ label, href, arrow = 11 }: { label: string; href: string; arrow?: number }) {
  const phone = useMedia(PHONE);
  const key = phone ? socialKey(label) : null;
  return (
    <a
      className="social-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      {...(key ? { "data-icon": "", "aria-label": label, title: label } : {})}
    >
      {key ? (
        <SocialIcon name={key} />
      ) : (
        <>
          {label} <ArrowUpRight size={arrow} />
        </>
      )}
    </a>
  );
}
