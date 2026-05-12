import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * COMPONENT: ScrollToTop
 * Purpose: Ensures that every time a user navigates to a new page, 
 * the scroll position resets to the top instead of staying where the last page was.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
