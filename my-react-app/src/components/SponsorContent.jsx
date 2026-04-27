import React from 'react';
import { isSponsor, hasFeature } from '../utils/roleUtils';
import './SponsorContent.css';

/**
 * SponsorContent component - Displays content only to sponsors
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display to sponsors
 * @param {React.ReactNode} props.fallback - Content to display to non-sponsors
 * @param {string} props.featureName - Optional: Check specific feature availability
 */
const SponsorContent = ({ 
  children, 
  fallback = null,
  featureName = 'canViewRestrictedContent'
}) => {
  const showContent = featureName ? hasFeature(featureName) : isSponsor();

  if (showContent) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="sponsor-restricted">
      <div className="restriction-notice">
        <span className="restriction-icon">🔒</span>
        <h3>Sponsor Only Content</h3>
        <p>This feature is available to Sponsor members only.</p>
        <p className="restriction-note">Contact an administrator to upgrade your account.</p>
      </div>
    </div>
  );
};

export default SponsorContent;
