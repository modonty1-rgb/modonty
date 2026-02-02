export function scrollToSection(sectionId: string, sectionRefs: { [key: string]: HTMLElement | null }) {
  const element = sectionRefs[sectionId];
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

export function createSectionRefHandler(
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>,
  sectionId: string
) {
  return (el: HTMLElement | null) => {
    sectionRefs.current[sectionId] = el;
  };
}
