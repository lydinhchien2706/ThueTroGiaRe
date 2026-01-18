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
  
  useEffect(() => {
    // Skip transition on initial mount
    if (previousPathRef.current === location.pathname) {
      return;
    }
    
    // Start exit animation
    setTransitionStage('exit');
    
    const exitTimer = setTimeout(() => {
      // After exit animation, update content and start enter animation
      setDisplayChildren(children);
      setTransitionStage('enter');
      previousPathRef.current = location.pathname;
      
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 150); // Exit animation duration
    
    return () => clearTimeout(exitTimer);
  }, [location.pathname, children]);

  // Update children immediately on first render
  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  return (
    <div className={`page-transition page-transition--${transitionStage}`}>
      {displayChildren}
    </div>
  );
};

export default PageTransition;
