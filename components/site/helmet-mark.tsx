/** Shapes of the helmet mark on a 24-unit grid; app/icon.svg and lib/og.tsx draw the same paths. */
export const HELMET_PATHS = {
  /** the shell, with the visor cut out */
  shell: "M2.5 10.5a9.5 9.5 0 1 0 19 0a9.5 9.5 0 1 0 -19 0Z M9 6.2H15A4.2 4.2 0 0 1 15 14.6H9A4.2 4.2 0 0 1 9 6.2Z",
  /** the glint on the visor */
  glint: "M8.2 8.2h2.4a0.75 0.75 0 0 1 0 1.5h-2.4a0.75 0.75 0 0 1 0 -1.5Z",
  /** the neck ring */
  collar: "M6.6 20.9H17.4A1.05 1.05 0 0 1 17.4 23H6.6A1.05 1.05 0 0 1 6.6 20.9Z",
} as const

/** The helmet: a minimal astronaut helmet, the site's only mark. */
export function HelmetMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={HELMET_PATHS.shell} fill="currentColor" fillRule="evenodd" />
      <path d={HELMET_PATHS.glint} fill="currentColor" />
      <path d={HELMET_PATHS.collar} fill="currentColor" />
    </svg>
  )
}
