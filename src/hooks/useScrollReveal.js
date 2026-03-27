import { useEffect, useRef } from "react";

/**
 * Добавляет класс "revealed" дочерним элементам .reveal-item
 * при появлении контейнера в viewport (stagger-эффект).
 */
export function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const items = container.querySelectorAll(".reveal-item");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          setTimeout(() => el.classList.add("revealed"), delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el, i) => {
      el.dataset.revealDelay = i * 100;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return ref;
}
