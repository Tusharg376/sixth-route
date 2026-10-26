const onHome = () => {
  const p = window.location.pathname;
  return p === "/" || p.endsWith("/index.html");
};

/** In-page anchors (#services) only exist on the home page; elsewhere point them at it. */
export const to = (href: string) => (href.startsWith("#") && !onHome() ? `/${href}` : href);
