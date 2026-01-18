import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

/**
 * PageTransition wrapper component that provides smooth page transitions
 * Uses CSS animations with optimized timing for a polished feel
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');
  const previousPathRef = useRef(location.pathname);
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    // On first render, just display children without transition
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDisplayChildren(children);
      return;
    }
    
    // Skip transition if pathname hasn't changed
    if (previousPathRef.current === location.pathname) {
      setDisplayChildren(children);
      return;
    }
    
    // Start exit animation
    setTransitionStage('exit');
    
    const exitTimer = setTimeout(() => {
      // After exit animation, update content and start enter animation
      setDisplayChildren(children);
      setTransitionStage('enter');
      previousPathRef.current = location.pathname;
      
      // Scroll to top instantly for better UX during page change
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 150); // Exit animation duration
    
    return () => clearTimeout(exitTimer);
  }, [location.pathname, children]);

  return (
    <div className={`page-transition page-transition--${transitionStage}`}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
