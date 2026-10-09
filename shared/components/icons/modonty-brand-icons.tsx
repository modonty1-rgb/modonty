import { markSize, type MarkProps } from "./mark-size";

/**
 * The modonty ACTIVITY mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-activity-body` · `--modonty-activity-accent` (the diamond).
 */
export function ModontyActivityMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3 13H6.5L9.5 7L14.5 19.5L17 13H21" stroke="var(--modonty-activity-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.15 4.88A0.5 0.5 0 0 1 9.85 4.88L11.62 6.65A0.5 0.5 0 0 1 11.62 7.35L9.85 9.12A0.5 0.5 0 0 1 9.15 9.12L7.38 7.35A0.5 0.5 0 0 1 7.38 6.65Z" fill="var(--modonty-activity-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2 8.5H4.5L6.5 4.5L9.5 12.5L11 8.5H14" stroke="var(--modonty-activity-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.29 2.94A0.3 0.3 0 0 1 6.71 2.94L8.06 4.29A0.3 0.3 0 0 1 8.06 4.71L6.71 6.06A0.3 0.3 0 0 1 6.29 6.06L4.94 4.71A0.3 0.3 0 0 1 4.94 4.29Z" fill="var(--modonty-activity-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty AI mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-ai-body` · `--modonty-ai-accent` (the diamond).
 */
export function ModontyAiMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M10.5 6Q11.5 12.5 18 13.5Q11.5 14.5 10.5 21Q9.5 14.5 3 13.5Q9.5 12.5 10.5 6Z" stroke="var(--modonty-ai-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.4 3.63A0.5 0.5 0 0 1 19.1 3.63L20.87 5.4A0.5 0.5 0 0 1 20.87 6.1L19.1 7.87A0.5 0.5 0 0 1 18.4 7.87L16.63 6.1A0.5 0.5 0 0 1 16.63 5.4Z" fill="var(--modonty-ai-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M7 4Q8.2 8 12 9Q8.2 10 7 14Q5.8 10 2 9Q5.8 8 7 4Z" stroke="var(--modonty-ai-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.04 2.19A0.3 0.3 0 0 1 12.46 2.19L13.81 3.54A0.3 0.3 0 0 1 13.81 3.96L12.46 5.31A0.3 0.3 0 0 1 12.04 5.31L10.69 3.96A0.3 0.3 0 0 1 10.69 3.54Z" fill="var(--modonty-ai-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty FOLDER mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-folder-body` · `--modonty-folder-accent` (the diamond).
 */
export function ModontyFolderMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3.5 6.5A2 2 0 0 1 5.5 4.5H9.25L11.5 7H18.5A2 2 0 0 1 20.5 9V17.5A2 2 0 0 1 18.5 19.5H5.5A2 2 0 0 1 3.5 17.5Z" stroke="var(--modonty-folder-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 11.08A0.5 0.5 0 0 1 12.35 11.08L14.12 12.85A0.5 0.5 0 0 1 14.12 13.55L12.35 15.32A0.5 0.5 0 0 1 11.65 15.32L9.88 13.55A0.5 0.5 0 0 1 9.88 12.85Z" fill="var(--modonty-folder-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 4A1.5 1.5 0 0 1 4 2.5H6.2L7.5 4.25H12A1.5 1.5 0 0 1 13.5 5.75V11.5A1.5 1.5 0 0 1 12 13H4A1.5 1.5 0 0 1 2.5 11.5Z" stroke="var(--modonty-folder-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 7.04A0.3 0.3 0 0 1 8.21 7.04L9.56 8.39A0.3 0.3 0 0 1 9.56 8.81L8.21 10.16A0.3 0.3 0 0 1 7.79 10.16L6.44 8.81A0.3 0.3 0 0 1 6.44 8.39Z" fill="var(--modonty-folder-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty DOWNLOAD mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-download-body` · `--modonty-download-accent` (the diamond).
 */
export function ModontyDownloadMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 9.5V16" stroke="var(--modonty-download-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.25 12.25L12 16L15.75 12.25" stroke="var(--modonty-download-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 13.5V18.5A2 2 0 0 0 5.5 20.5H18.5A2 2 0 0 0 20.5 18.5V13.5" stroke="var(--modonty-download-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 3.08A0.5 0.5 0 0 1 12.35 3.08L14.12 4.85A0.5 0.5 0 0 1 14.12 5.55L12.35 7.32A0.5 0.5 0 0 1 11.65 7.32L9.88 5.55A0.5 0.5 0 0 1 9.88 4.85Z" fill="var(--modonty-download-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 6.6V10.2" stroke="var(--modonty-download-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.8 8L8 10.2L10.2 8" stroke="var(--modonty-download-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 9V12A1.5 1.5 0 0 0 4 13.5H12A1.5 1.5 0 0 0 13.5 12V9" stroke="var(--modonty-download-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 1.64A0.3 0.3 0 0 1 8.21 1.64L9.56 2.99A0.3 0.3 0 0 1 9.56 3.41L8.21 4.76A0.3 0.3 0 0 1 7.79 4.76L6.44 3.41A0.3 0.3 0 0 1 6.44 2.99Z" fill="var(--modonty-download-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty ANALYTICS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-analytics-body` · `--modonty-analytics-accent` (the diamond).
 */
export function ModontyAnalyticsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3.5 3.5V19A1.5 1.5 0 0 0 5 20.5H20.5" stroke="var(--modonty-analytics-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 16L11 12L14 14.5L18.5 7.5" stroke="var(--modonty-analytics-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.15 5.38A0.5 0.5 0 0 1 18.85 5.38L20.62 7.15A0.5 0.5 0 0 1 20.62 7.85L18.85 9.62A0.5 0.5 0 0 1 18.15 9.62L16.38 7.85A0.5 0.5 0 0 1 16.38 7.15Z" fill="var(--modonty-analytics-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 2.5V12A1.5 1.5 0 0 0 4 13.5H13.5" stroke="var(--modonty-analytics-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10L7.5 7.5L9.5 9L12 4.8" stroke="var(--modonty-analytics-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.79 3.24A0.3 0.3 0 0 1 12.21 3.24L13.56 4.59A0.3 0.3 0 0 1 13.56 5.01L12.21 6.36A0.3 0.3 0 0 1 11.79 6.36L10.44 5.01A0.3 0.3 0 0 1 10.44 4.59Z" fill="var(--modonty-analytics-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty UPLOAD mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-upload-body` · `--modonty-upload-accent` (the diamond).
 */
export function ModontyUploadMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3.5 15V18.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V15" stroke="var(--modonty-upload-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.5 7.5L12 3L16.5 7.5" stroke="var(--modonty-upload-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3V12" stroke="var(--modonty-upload-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 12.38A0.5 0.5 0 0 1 12.35 12.38L14.12 14.15A0.5 0.5 0 0 1 14.12 14.85L12.35 16.62A0.5 0.5 0 0 1 11.65 16.62L9.88 14.85A0.5 0.5 0 0 1 9.88 14.15Z" fill="var(--modonty-upload-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 10V12a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="var(--modonty-upload-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.25 4.75L8 2L10.75 4.75" stroke="var(--modonty-upload-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2V7" stroke="var(--modonty-upload-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 7.69A0.3 0.3 0 0 1 8.21 7.69L9.56 9.04A0.3 0.3 0 0 1 9.56 9.46L8.21 10.81A0.3 0.3 0 0 1 7.79 10.81L6.44 9.46A0.3 0.3 0 0 1 6.44 9.04Z" fill="var(--modonty-upload-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty WEBSITE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-website-body` · `--modonty-website-accent` (the diamond).
 */
export function ModontyWebsiteMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="12" r="6.5" stroke="var(--modonty-website-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="12" cy="12" rx="3.2" ry="6.5" stroke="var(--modonty-website-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 12H18.5" stroke="var(--modonty-website-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-website-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="8" r="4.5" stroke="var(--modonty-website-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="8" cy="8" rx="1.9" ry="4.5" stroke="var(--modonty-website-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-website-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty SUCCESS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-success-body` · `--modonty-success-accent` (the diamond).
 */
export function ModontySuccessMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="12" r="9" stroke="var(--modonty-success-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 9.25L10.5 11.75L15.5 6.75" stroke="var(--modonty-success-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.15 14.13A0.5 0.5 0 0 1 10.85 14.13L12.62 15.9A0.5 0.5 0 0 1 12.62 16.6L10.85 18.37A0.5 0.5 0 0 1 10.15 18.37L8.38 16.6A0.5 0.5 0 0 1 8.38 15.9Z" fill="var(--modonty-success-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="8" r="6.25" stroke="var(--modonty-success-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.75 5.75L7.25 7.25L10 4.5" stroke="var(--modonty-success-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.04 9.19A0.3 0.3 0 0 1 7.46 9.19L8.81 10.54A0.3 0.3 0 0 1 8.81 10.96L7.46 12.31A0.3 0.3 0 0 1 7.04 12.31L5.69 10.96A0.3 0.3 0 0 1 5.69 10.54Z" fill="var(--modonty-success-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty ALERT TRIANGLE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-alert-triangle-body` · `--modonty-alert-triangle-accent` (the diamond).
 */
export function ModontyAlertTriangleMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 3L21 21H3Z" stroke="var(--modonty-alert-triangle-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9.25V12.25" stroke="var(--modonty-alert-triangle-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 14.48A0.5 0.5 0 0 1 12.35 14.48L14.12 16.25A0.5 0.5 0 0 1 14.12 16.95L12.35 18.72A0.5 0.5 0 0 1 11.65 18.72L9.88 16.95A0.5 0.5 0 0 1 9.88 16.25Z" fill="var(--modonty-alert-triangle-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 2.25L14.25 14.25H1.75Z" stroke="var(--modonty-alert-triangle-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6.25V7.5" stroke="var(--modonty-alert-triangle-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 9.34A0.3 0.3 0 0 1 8.21 9.34L9.56 10.69A0.3 0.3 0 0 1 9.56 11.11L8.21 12.46A0.3 0.3 0 0 1 7.79 12.46L6.44 11.11A0.3 0.3 0 0 1 6.44 10.69Z" fill="var(--modonty-alert-triangle-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty SETTINGS mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-settings-body` · `--modonty-settings-accent` (the diamond).
 */
export function ModontySettingsMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M10.54 5.67L10.92 3.82L13.08 3.82L13.46 5.67A6.5 6.5 0 0 1 16.75 7.57L18.55 6.98L19.62 8.84L18.22 10.1A6.5 6.5 0 0 1 18.22 13.9L19.62 15.16L18.55 17.02L16.75 16.43A6.5 6.5 0 0 1 13.46 18.33L13.08 20.18L10.92 20.18L10.54 18.33A6.5 6.5 0 0 1 7.25 16.43L5.45 17.02L4.38 15.16L5.78 13.9A6.5 6.5 0 0 1 5.78 10.1L4.38 8.84L5.45 6.98L7.25 7.57A6.5 6.5 0 0 1 10.54 5.67Z" stroke="var(--modonty-settings-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-settings-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M7.35 4.1L7.48 3.03L8.52 3.03L8.65 4.1A3.95 3.95 0 0 1 11.05 5.49L12.05 5.06L12.57 5.97L11.7 6.62A3.95 3.95 0 0 1 11.7 9.38L12.57 10.03L12.05 10.94L11.05 10.51A3.95 3.95 0 0 1 8.65 11.9L8.52 12.97L7.48 12.97L7.35 11.9A3.95 3.95 0 0 1 4.95 10.51L3.95 10.94L3.43 10.03L4.3 9.38A3.95 3.95 0 0 1 4.3 6.62L3.43 5.97L3.95 5.06L4.95 5.49A3.95 3.95 0 0 1 7.35 4.1Z" stroke="var(--modonty-settings-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-settings-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty THEME LIGHT mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-theme-light-body` · `--modonty-theme-light-accent` (the diamond).
 */
export function ModontyThemeLightMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="12" r="4.5" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3V4.25" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19.75V21" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12H4.25" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.75 12H21" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.48 6.52L18.36 5.64" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.48 17.48L18.36 18.36" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.52 6.52L5.64 5.64" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.52 17.48L5.64 18.36" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-theme-light-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="8" r="3.5" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 1.63V2.25" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13.75V14.38" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.63 8H2.25" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.75 8H14.38" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.07 3.93L12.51 3.49" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.07 12.07L12.51 12.51" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.93 3.93L3.49 3.49" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.93 12.07L3.49 12.51" stroke="var(--modonty-theme-light-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-theme-light-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty THEME DARK mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-theme-dark-body` · `--modonty-theme-dark-accent` (the diamond).
 */
export function ModontyThemeDarkMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 3A6.36 6.36 0 0 0 21 12A9 9 0 1 1 12 3Z" stroke="var(--modonty-theme-dark-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16.15 5.38A0.5 0.5 0 0 1 16.85 5.38L18.62 7.15A0.5 0.5 0 0 1 18.62 7.85L16.85 9.62A0.5 0.5 0 0 1 16.15 9.62L14.38 7.85A0.5 0.5 0 0 1 14.38 7.15Z" fill="var(--modonty-theme-dark-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 2A4.24 4.24 0 0 0 14 8A6 6 0 1 1 8 2Z" stroke="var(--modonty-theme-dark-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.79 3.44A0.3 0.3 0 0 1 11.21 3.44L12.56 4.79A0.3 0.3 0 0 1 12.56 5.21L11.21 6.56A0.3 0.3 0 0 1 10.79 6.56L9.44 5.21A0.3 0.3 0 0 1 9.44 4.79Z" fill="var(--modonty-theme-dark-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty DELETE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-delete-body` · `--modonty-delete-accent` (the diamond).
 */
export function ModontyDeleteMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3.5 9H20.5" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 9V19A2 2 0 0 0 8 21H16A2 2 0 0 0 18 19V9" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12.5V17.5" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 12.5V17.5" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 2.38A0.5 0.5 0 0 1 12.35 2.38L14.12 4.15A0.5 0.5 0 0 1 14.12 4.85L12.35 6.62A0.5 0.5 0 0 1 11.65 6.62L9.88 4.85A0.5 0.5 0 0 1 9.88 4.15Z" fill="var(--modonty-delete-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 6.5H13.5" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 6.5V12A1.5 1.5 0 0 0 5 13.5H11A1.5 1.5 0 0 0 12.5 12V6.5" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.4 8.7V11.3" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.6 8.7V11.3" stroke="var(--modonty-delete-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 1.54A0.3 0.3 0 0 1 8.21 1.54L9.56 2.89A0.3 0.3 0 0 1 9.56 3.31L8.21 4.66A0.3 0.3 0 0 1 7.79 4.66L6.44 3.31A0.3 0.3 0 0 1 6.44 2.89Z" fill="var(--modonty-delete-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty CIRCLE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-circle-body` · `--modonty-circle-accent` (the diamond).
 */
export function ModontyCircleMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="12" cy="12" r="9" stroke="var(--modonty-circle-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-circle-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="8" cy="8" r="6" stroke="var(--modonty-circle-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-circle-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty LINK mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-link-body` · `--modonty-link-accent` (the diamond).
 */
export function ModontyLinkMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M10.3 12.85a4.25 4.25 0 0 0 6.41.46l2.55-2.55a4.25 4.25 0 0 0-6.01-6.01l-1.46 1.45" stroke="var(--modonty-link-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.7 11.15a4.25 4.25 0 0 0-6.41-.46l-2.55 2.55a4.25 4.25 0 0 0 6.01 6.01l1.46-1.45" stroke="var(--modonty-link-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-link-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M6.87 8.57a2.83 2.83 0 0 0 4.28.31l1.7-1.7a2.83 2.83 0 0 0-4-4l-.98.97" stroke="var(--modonty-link-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.13 7.43a2.83 2.83 0 0 0-4.28-.31l-1.7 1.7a2.83 2.83 0 0 0 4 4l.98-.97" stroke="var(--modonty-link-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-link-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty LINK OFF mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-link-off-body` · `--modonty-link-off-accent` (the diamond).
 */
export function ModontyLinkOffMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M16.95 13.07L19.26 10.76A4.25 4.25 0 0 0 13.25 4.75L11.79 6.2" stroke="var(--modonty-link-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7.05 10.93L4.74 13.24A4.25 4.25 0 0 0 10.75 19.25L12.21 17.8" stroke="var(--modonty-link-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 4.5L19.5 19.5" stroke="var(--modonty-link-off-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-link-off-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M11.61 8.42L12.85 7.18A2.83 2.83 0 0 0 8.85 3.18L7.87 4.15" stroke="var(--modonty-link-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.39 7.58L3.15 8.82A2.83 2.83 0 0 0 7.15 12.82L8.13 11.85" stroke="var(--modonty-link-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 3.5L12.5 12.5" stroke="var(--modonty-link-off-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-link-off-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty LIST mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-list-body` · `--modonty-list-accent` (the diamond).
 */
export function ModontyListMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3 6H14.5" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12H14.5" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 18H14.5" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19.25" cy="12" r="0.9" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19.25" cy="18" r="0.9" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.9 3.88A0.5 0.5 0 0 1 19.6 3.88L21.37 5.65A0.5 0.5 0 0 1 21.37 6.35L19.6 8.12A0.5 0.5 0 0 1 18.9 8.12L17.13 6.35A0.5 0.5 0 0 1 17.13 5.65Z" fill="var(--modonty-list-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2 3.5H8.5" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 8H8.5" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12.5H8.5" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12.5" cy="8" r="0.6" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12.5" cy="12.5" r="0.6" stroke="var(--modonty-list-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.29 1.94A0.3 0.3 0 0 1 12.71 1.94L14.06 3.29A0.3 0.3 0 0 1 14.06 3.71L12.71 5.06A0.3 0.3 0 0 1 12.29 5.06L10.94 3.71A0.3 0.3 0 0 1 10.94 3.29Z" fill="var(--modonty-list-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty GRID mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-grid-body` · `--modonty-grid-accent` (the diamond).
 */
export function ModontyGridMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="4.5" y="4.5" width="5" height="5" rx="1.25" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14.5" y="4.5" width="5" height="5" rx="1.25" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4.5" y="14.5" width="5" height="5" rx="1.25" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14.5" y="14.5" width="5" height="5" rx="1.25" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-grid-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2.5" y="2.5" width="3.5" height="3.5" rx="1" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="2.5" width="3.5" height="3.5" rx="1" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2.5" y="10" width="3.5" height="3.5" rx="1" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="10" width="3.5" height="3.5" rx="1" stroke="var(--modonty-grid-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-grid-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty MORE HORIZONTAL mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-more-horizontal-body` · `--modonty-more-horizontal-accent` (the diamond).
 */
export function ModontyMoreHorizontalMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <circle cx="4.9" cy="12" r="1.9" stroke="var(--modonty-more-horizontal-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="19.1" cy="12" r="1.9" stroke="var(--modonty-more-horizontal-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-more-horizontal-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <circle cx="3.25" cy="8" r="1.15" stroke="var(--modonty-more-horizontal-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12.75" cy="8" r="1.15" stroke="var(--modonty-more-horizontal-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-more-horizontal-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty DESKTOP mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-desktop-body` · `--modonty-desktop-accent` (the diamond).
 */
export function ModontyDesktopMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="3.5" y="4" width="17" height="11.5" rx="2" stroke="var(--modonty-desktop-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15.5V20" stroke="var(--modonty-desktop-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.5 20H15.5" stroke="var(--modonty-desktop-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 7.63A0.5 0.5 0 0 1 12.35 7.63L14.12 9.4A0.5 0.5 0 0 1 14.12 10.1L12.35 11.87A0.5 0.5 0 0 1 11.65 11.87L9.88 10.1A0.5 0.5 0 0 1 9.88 9.4Z" fill="var(--modonty-desktop-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2" y="2.5" width="12" height="8.5" rx="1.5" stroke="var(--modonty-desktop-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11V13.5" stroke="var(--modonty-desktop-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 13.5H10.5" stroke="var(--modonty-desktop-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 5.19A0.3 0.3 0 0 1 8.21 5.19L9.56 6.54A0.3 0.3 0 0 1 9.56 6.96L8.21 8.31A0.3 0.3 0 0 1 7.79 8.31L6.44 6.96A0.3 0.3 0 0 1 6.44 6.54Z" fill="var(--modonty-desktop-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty MOBILE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-mobile-body` · `--modonty-mobile-accent` (the diamond).
 */
export function ModontyMobileMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="6" y="3" width="12" height="18" rx="2" stroke="var(--modonty-mobile-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 14.68A0.5 0.5 0 0 1 12.35 14.68L14.12 16.45A0.5 0.5 0 0 1 14.12 17.15L12.35 18.92A0.5 0.5 0 0 1 11.65 18.92L9.88 17.15A0.5 0.5 0 0 1 9.88 16.45Z" fill="var(--modonty-mobile-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="4" y="2" width="8" height="12" rx="1.5" stroke="var(--modonty-mobile-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 8.84A0.3 0.3 0 0 1 8.21 8.84L9.56 10.19A0.3 0.3 0 0 1 9.56 10.61L8.21 11.96A0.3 0.3 0 0 1 7.79 11.96L6.44 10.61A0.3 0.3 0 0 1 6.44 10.19Z" fill="var(--modonty-mobile-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty SPEED mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-speed-body` · `--modonty-speed-accent` (the diamond).
 */
export function ModontySpeedMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5.99 19.01A8.5 8.5 0 1 1 18.01 19.01" stroke="var(--modonty-speed-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13L15.75 9.25" stroke="var(--modonty-speed-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 10.88A0.5 0.5 0 0 1 12.35 10.88L14.12 12.65A0.5 0.5 0 0 1 14.12 13.35L12.35 15.12A0.5 0.5 0 0 1 11.65 15.12L9.88 13.35A0.5 0.5 0 0 1 9.88 12.65Z" fill="var(--modonty-speed-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4.11 12.64A5.5 5.5 0 1 1 11.89 12.64" stroke="var(--modonty-speed-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8.75L10.1 6.65" stroke="var(--modonty-speed-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 7.19A0.3 0.3 0 0 1 8.21 7.19L9.56 8.54A0.3 0.3 0 0 1 9.56 8.96L8.21 10.31A0.3 0.3 0 0 1 7.79 10.31L6.44 8.96A0.3 0.3 0 0 1 6.44 8.54Z" fill="var(--modonty-speed-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty SKIP BACK mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-skip-back-body` · `--modonty-skip-back-accent` (the diamond).
 */
export function ModontySkipBackMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M5.5 5V19" stroke="var(--modonty-skip-back-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 5.5L10.5 12L20 18.5Z" stroke="var(--modonty-skip-back-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.15 9.88A0.5 0.5 0 0 1 5.85 9.88L7.62 11.65A0.5 0.5 0 0 1 7.62 12.35L5.85 14.12A0.5 0.5 0 0 1 5.15 14.12L3.38 12.35A0.5 0.5 0 0 1 3.38 11.65Z" fill="var(--modonty-skip-back-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M3.5 3.5V12.5" stroke="var(--modonty-skip-back-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 3.5L7.5 8L13.5 12.5Z" stroke="var(--modonty-skip-back-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.29 6.44A0.3 0.3 0 0 1 3.71 6.44L5.06 7.79A0.3 0.3 0 0 1 5.06 8.21L3.71 9.56A0.3 0.3 0 0 1 3.29 9.56L1.94 8.21A0.3 0.3 0 0 1 1.94 7.79Z" fill="var(--modonty-skip-back-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty SKIP FORWARD mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-skip-forward-body` · `--modonty-skip-forward-accent` (the diamond).
 */
export function ModontySkipForwardMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M4.5 3.5V20.5L16.5 12Z" stroke="var(--modonty-skip-forward-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.5 3.5V20.5" stroke="var(--modonty-skip-forward-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.15 9.88A0.5 0.5 0 0 1 9.85 9.88L11.62 11.65A0.5 0.5 0 0 1 11.62 12.35L9.85 14.12A0.5 0.5 0 0 1 9.15 14.12L7.38 12.35A0.5 0.5 0 0 1 7.38 11.65Z" fill="var(--modonty-skip-forward-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2.5 2V14L11.5 8Z" stroke="var(--modonty-skip-forward-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 5V11" stroke="var(--modonty-skip-forward-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.69 6.44A0.3 0.3 0 0 1 6.11 6.44L7.46 7.79A0.3 0.3 0 0 1 7.46 8.21L6.11 9.56A0.3 0.3 0 0 1 5.69 9.56L4.34 8.21A0.3 0.3 0 0 1 4.34 7.79Z" fill="var(--modonty-skip-forward-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty REMOVE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-remove-body` · `--modonty-remove-accent` (the diamond).
 */
export function ModontyRemoveMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M3 12H21" stroke="var(--modonty-remove-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-remove-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M2 8H14" stroke="var(--modonty-remove-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-remove-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty ADD mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-add-body` · `--modonty-add-accent` (the diamond).
 */
export function ModontyAddMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M12 3.5V20.5" stroke="var(--modonty-add-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 12H20.5" stroke="var(--modonty-add-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-add-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M8 2.5V13.5" stroke="var(--modonty-add-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 8H13.5" stroke="var(--modonty-add-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-add-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty COPY mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-copy-body` · `--modonty-copy-accent` (the diamond).
 */
export function ModontyCopyMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <rect x="3.5" y="9" width="11" height="11.5" rx="2" stroke="var(--modonty-copy-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9V5.5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H14.5" stroke="var(--modonty-copy-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.65 12.63A0.5 0.5 0 0 1 9.35 12.63L11.12 14.4A0.5 0.5 0 0 1 11.12 15.1L9.35 16.87A0.5 0.5 0 0 1 8.65 16.87L6.88 15.1A0.5 0.5 0 0 1 6.88 14.4Z" fill="var(--modonty-copy-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <rect x="2.5" y="6.5" width="7" height="7" rx="1.25" stroke="var(--modonty-copy-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6.5V4a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5V8a1.5 1.5 0 0 1-1.5 1.5H9.5" stroke="var(--modonty-copy-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.79 8.44A0.3 0.3 0 0 1 6.21 8.44L7.56 9.79A0.3 0.3 0 0 1 7.56 10.21L6.21 11.56A0.3 0.3 0 0 1 5.79 11.56L4.44 10.21A0.3 0.3 0 0 1 4.44 9.79Z" fill="var(--modonty-copy-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

/**
 * The modonty PAUSE mark — v2 (documents/design/ICON-STANDARD-v2.md).
 * Two masters: M24 (stroke 1.75) from 20 px up, M16 (stroke 1.25) below. Hooks:
 * `--modonty-pause-body` · `--modonty-pause-accent` (the diamond).
 */
export function ModontyPauseMark({ size, ...props }: MarkProps) {
  const m = markSize(size, props.className);
  if (!m.small) {
    return (
      <svg viewBox="0 0 24 24" {...m.box} {...props}>
        <path d="M6.5 5V19" stroke="var(--modonty-pause-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.5 5V19" stroke="var(--modonty-pause-body, currentColor)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.65 9.88A0.5 0.5 0 0 1 12.35 9.88L14.12 11.65A0.5 0.5 0 0 1 14.12 12.35L12.35 14.12A0.5 0.5 0 0 1 11.65 14.12L9.88 12.35A0.5 0.5 0 0 1 9.88 11.65Z" fill="var(--modonty-pause-accent, var(--modonty-accent, #00D8D8))" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" {...m.box} {...props}>
      <path d="M4 3V13" stroke="var(--modonty-pause-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3V13" stroke="var(--modonty-pause-body, currentColor)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.79 6.44A0.3 0.3 0 0 1 8.21 6.44L9.56 7.79A0.3 0.3 0 0 1 9.56 8.21L8.21 9.56A0.3 0.3 0 0 1 7.79 9.56L6.44 8.21A0.3 0.3 0 0 1 6.44 7.79Z" fill="var(--modonty-pause-accent, var(--modonty-accent, #00D8D8))" />
    </svg>
  );
}

