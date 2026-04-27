import React from 'react';
import SponsorContent from '../SponsorContent';
import { isSponsor, isTeacher, getRoleDisplayName, getCurrentUser } from '../../utils/roleUtils';
import './SponsorExample.css';

/**
 * SponsorExample Component - Demonstrates how to use the sponsor account hierarchy
 * This is a reference implementation showing best practices
 */
const SponsorExample = () => {
  const user = getCurrentUser();
  
  if (!user) {
    return (
      <div className="example-container">
        <p>Please log in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="example-container">
      <h1>Account Hierarchy Demo</h1>
      
      {/* Display current user role */}
      <div className="user-status">
        <h2>Current Account Status</h2>
        <p>Role: <strong>{getRoleDisplayName(user.role)}</strong></p>
        {isSponsor() && (
          <div className="sponsor-badge">
            👑 Sponsor Account - Full Access Enabled
          </div>
        )}
      </div>

      {/* Content visible to all */}
      <section className="section">
        <h2>📖 Public Content (Available to All)</h2>
        <p>This content is visible to students, teachers, and sponsors.</p>
        <ul>
          <li>Basic learning materials</li>
          <li>Practice mode</li>
          <li>Performance tracking</li>
        </ul>
      </section>

      {/* Content visible to teachers and sponsors */}
      <section className="section">
        {(isTeacher() || isSponsor()) ? (
          <div>
            <h2>📚 Teacher/Sponsor Content</h2>
            <p>This content is visible to teachers and sponsors.</p>
            <ul>
              <li>Student management dashboard</li>
              <li>Performance indicator editing</li>
              <li>Analytics and reports</li>
            </ul>
          </div>
        ) : (
          <div className="restricted-notice">
            <h2>📚 Teacher/Sponsor Content</h2>
            <p>This section requires a Teacher or Sponsor account.</p>
          </div>
        )}
      </section>

      {/* Sponsor-only content component example */}
      <section className="section">
        <h2>👑 Sponsor-Exclusive Features</h2>
        <SponsorContent
          featureName="canViewRestrictedContent"
          fallback={
            <div className="restricted-notice">
              <p>⭐ Sponsor accounts have exclusive access to advanced features:</p>
              <ul>
                <li>User account management</li>
                <li>Data export and reporting</li>
                <li>Advanced analytics</li>
                <li>Custom configurations</li>
              </ul>
            </div>
          }
        >
          <div className="sponsor-features">
            <h3>✨ Sponsor-Exclusive Features Unlocked</h3>
            <ul>
              <li>✓ User account management</li>
              <li>✓ Data export functionality</li>
              <li>✓ Advanced analytics dashboard</li>
              <li>✓ Custom report generation</li>
              <li>✓ Role management tools</li>
              <li>✓ API access</li>
            </ul>
            
            <div className="sponsor-features-details">
              <h4>Available Sponsor Actions:</h4>
              <button className="sponsor-button">Manage Users</button>
              <button className="sponsor-button">View Advanced Analytics</button>
              <button className="sponsor-button">Export Data</button>
              <button className="sponsor-button">Manage Roles</button>
            </div>
          </div>
        </SponsorContent>
      </section>

      {/* Role comparison table */}
      <section className="section">
        <h2>📊 Account Features Comparison</h2>
        <table className="features-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Student</th>
              <th>Teacher</th>
              <th>Sponsor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Learning</td>
              <td>✓</td>
              <td>✓</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>View Analytics</td>
              <td>✗</td>
              <td>✓</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Manage Students</td>
              <td>✗</td>
              <td>✓</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Edit PIs</td>
              <td>✗</td>
              <td>✓</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Access Restricted Content</td>
              <td>✗</td>
              <td>✗</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>Export Data</td>
              <td>✗</td>
              <td>✗</td>
              <td>✓</td>
            </tr>
            <tr>
              <td>User Management</td>
              <td>✗</td>
              <td>✗</td>
              <td>✓</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default SponsorExample;
