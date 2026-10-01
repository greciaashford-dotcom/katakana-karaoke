import { useEffect } from "react";

const SUFFIX = "Karaoke Katakana";

export const usePageMeta = (title, description) => {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : `${SUFFIX} | Karaoke-bar en Madrid desde 2006`;
    if (description) {
      const tag = document.querySelector('meta[name="description"]');
      if (tag) tag.setAttribute("content", description);
    }
  }, [title, description]);
};
