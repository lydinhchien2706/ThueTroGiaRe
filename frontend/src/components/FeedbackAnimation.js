import React, { useState, useEffect, useCallback } from 'react';
import './FeedbackAnimation.css';

/**
 * SuccessAnimation - Animated checkmark for success feedback
 */
export const SuccessAnimation = ({ show, size = 48, onComplete }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="feedback-animation success-animation" style={{ width: size, height: size }}>
      <svg viewBox="0 0 52 52" className="checkmark">
        <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
        <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
    </div>
  );
};

/**
 * ErrorAnimation - Shake animation for error feedback
 */
export const ErrorAnimation = ({ show, children, onComplete }) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (show) {
      setIsShaking(true);
      const timer = setTimeout(() => {
        setIsShaking(false);
        if (onComplete) onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <div className={`error-animation-wrapper ${isShaking ? 'animate-error' : ''}`}>
      {children}
    </div>
  );
};

/**
 * SaveAnimation - Bounce animation for save action feedback
 */
export const SaveAnimation = ({ show, children, onComplete }) => {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (show) {
      setIsBouncing(true);
      const timer = setTimeout(() => {
        setIsBouncing(false);
        if (onComplete) onComplete();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <div className={`save-animation-wrapper ${isBouncing ? 'animate-save' : ''}`}>
      {children}
    </div>
  );
};

/**
 * LoadingDots - Modern loading indicator (replaces spinner)
 */
export const LoadingDots = ({ className = '' }) => {
  return (
    <div className={`loading-dots ${className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

/**
 * PulseAnimation - Pulsing animation for notifications/badges
 */
export const PulseAnimation = ({ children, active = true }) => {
  return (
    <div className={active ? 'animate-pulse' : ''}>
      {children}
    </div>
  );
};

/**
 * useFeedbackAnimation - Custom hook for managing feedback animations
 */
export const useFeedbackAnimation = (duration = 2000) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSave, setShowSave] = useState(false);

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), duration);
  }, [duration]);

  const triggerError = useCallback(() => {
    setShowError(true);
    setTimeout(() => setShowError(false), duration);
  }, [duration]);

  const triggerSave = useCallback(() => {
    setShowSave(true);
    setTimeout(() => setShowSave(false), 400);
  }, []);

  return {
    showSuccess,
    showError,
    showSave,
    triggerSuccess,
    triggerError,
    triggerSave,
  };
};

const FeedbackAnimations = { SuccessAnimation, ErrorAnimation, SaveAnimation, LoadingDots, PulseAnimation };
export default FeedbackAnimations;
