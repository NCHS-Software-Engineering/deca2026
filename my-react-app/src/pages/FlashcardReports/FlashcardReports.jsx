import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./FlashcardReports.css";

const REPORT_STORAGE_KEY = "deca_flashcard_reports";
const RAPID_SUCCESSION_WINDOW_MS = 60 * 1000;
const CLUSTER_OPTIONS = [
  { label: "Business Management and Administration", value: "Business" },
  { label: "Entrepreneurship", value: "Entrepreneurship" },
  { label: "Finance", value: "Finance" },
  { label: "Hospitality and Tourism", value: "Hospitality" },
  { label: "Marketing", value: "Marketing" },
  { label: "Personal Financial Literacy", value: "FinancialLiteracy" },
];

const isDeveloperUser = (user) => {
  if (!user) return false;
  return (
    user?.email === "hnallman@stu.naperville203.org" ||
    user?.privileges === "teacher_override" ||
    user?.role === "teacher"
  );
};

const normalizeReportText = (value) => String(value || "").trim().toLowerCase();

const getReportTimestamp = (report) => {
  const rawValue = report?.created_at || report?.createdAt || report?.timestamp || Date.now();
  const parsed = new Date(rawValue).getTime();
  return Number.isFinite(parsed) ? parsed : Date.now();
};

const getReportIdentity = (report) =>
  normalizeReportText(
    report?.reporter_google_id ||
      report?.reporterGoogleId ||
      report?.reporter_email ||
      report?.reporterEmail ||
      report?.reporter_name ||
      report?.reporterName
  ) || "anonymous";

const getReportSignature = (report) =>
  [
    getReportIdentity(report),
    normalizeReportText(report?.career_cluster || report?.careerCluster),
    normalizeReportText(report?.performance_indicator || report?.performanceIndicator),
    normalizeReportText(report?.issue_type || report?.issueType),
  ].join("::");

const filterRapidSuccessionReports = (inputReports) => {
  const orderedReports = [...(Array.isArray(inputReports) ? inputReports : [])].sort(
    (a, b) => getReportTimestamp(b) - getReportTimestamp(a)
  );

  const lastSeenBySignature = new Map();
  const visibleReports = [];
  let hiddenCount = 0;

  for (const report of orderedReports) {
    const timestamp = getReportTimestamp(report);
    const signature = getReportSignature(report);
    const previousTimestamp = lastSeenBySignature.get(signature);

    if (
      typeof previousTimestamp === "number" &&
      previousTimestamp - timestamp <= RAPID_SUCCESSION_WINDOW_MS
    ) {
      hiddenCount += 1;
      continue;
    }

    lastSeenBySignature.set(signature, timestamp);
    visibleReports.push(report);
  }

  return { visibleReports, hiddenCount };
};

const FlashcardReports = () => {
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatusIds, setUpdatingStatusIds] = useState({});
  const [showAllReports, setShowAllReports] = useState(false);

  const rawUser = localStorage.getItem("user");
  const user = useMemo(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, [rawUser]);

  const [formData, setFormData] = useState({
    careerCluster: searchParams.get("cluster") || localStorage.getItem("deca_cluster") || "",
    performanceIndicator: searchParams.get("pi") || "",
    meaning: searchParams.get("meaning") || "",
    issueType: "Incorrect definition",
    notes: "",
    reporterName: user?.name || "",
    reporterEmail: user?.email || "",
    comments: "",
  });

  const developerView = isDeveloperUser(user);

  const loadLocalReports = () => {
    try {
      const stored = localStorage.getItem(REPORT_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      setReports(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReports([]);
    }
  };

  const fetchReports = async () => {
    if (!developerView) return;
    setLoadingReports(true);
    try {
      const res = await fetch("/api/flashcard-reports");
      if (!res.ok) throw new Error("Could not load reports from server");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
      localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(Array.isArray(data) ? data : []));
    } catch {
      loadLocalReports();
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (developerView) {
      fetchReports();
    }
  }, [developerView]);

  useEffect(() => {
    const cluster = formData.careerCluster;
    if (!cluster) {
      setFlashcards([]);
      return;
    }

    const fetchFlashcards = async () => {
      setLoadingCards(true);
      try {
        const res = await fetch(`https://decatest.redhawks.us/api/PIs?event=${encodeURIComponent(cluster)}`);
        if (!res.ok) throw new Error("Failed to load flashcards");
        const data = await res.json();
        const normalized = Array.isArray(data) ? data : [];
        setFlashcards(normalized);

        setFormData((prev) => {
          const hasSelected = normalized.some(
            (card) => card.PerformanceIndicator === prev.performanceIndicator
          );
          if (hasSelected) return prev;

          const fromQuery = searchParams.get("pi") || "";
          const queryMatch = normalized.find(
            (card) => card.PerformanceIndicator === fromQuery
          );

          if (queryMatch) {
            return {
              ...prev,
              performanceIndicator: queryMatch.PerformanceIndicator,
              meaning: queryMatch.Meaning || "",
            };
          }

          if (normalized.length > 0) {
            return {
              ...prev,
              performanceIndicator: normalized[0].PerformanceIndicator,
              meaning: normalized[0].Meaning || "",
            };
          }

          return {
            ...prev,
            performanceIndicator: "",
            meaning: "",
          };
        });
      } catch {
        setFlashcards([]);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchFlashcards();
  }, [formData.careerCluster, searchParams]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveReportLocally = (report) => {
    const next = [report, ...reports];
    setReports(next);
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(next));
  };

  const { visibleReports, hiddenCount } = useMemo(() => {
    if (showAllReports) {
      return { visibleReports: reports, hiddenCount: 0 };
    }

    return filterRapidSuccessionReports(reports);
  }, [reports, showAllReports]);

  const getReportStatus = (report) => (report.status || "open").toLowerCase();

  const updateReportStatusLocally = (reportId, nextStatus) => {
    setReports((prev) => {
      const next = prev.map((report) =>
        String(report.id) === String(reportId)
          ? {
              ...report,
              status: nextStatus,
            }
          : report
      );
      localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleStatusChange = async (reportId, nextStatus, reportTerm = "this report") => {
    if (!reportId) return;

    if (
      nextStatus === "resolved" &&
      !window.confirm(`Mark ${reportTerm} as resolved?`)
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setUpdatingStatusIds((prev) => ({ ...prev, [reportId]: true }));

    try {
      const res = await fetch(`/api/flashcard-reports/${encodeURIComponent(reportId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Server rejected status update");

      const data = await res.json();
      const updatedStatus = (data?.status || nextStatus).toLowerCase();
      updateReportStatusLocally(reportId, updatedStatus);
      setSuccess(`Report marked as ${updatedStatus}.`);
    } catch {
      updateReportStatusLocally(reportId, nextStatus);
      setSuccess(`Status updated locally to ${nextStatus}.`);
    } finally {
      setUpdatingStatusIds((prev) => {
        const next = { ...prev };
        delete next[reportId];
        return next;
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.careerCluster.trim() || !formData.performanceIndicator.trim()) {
      setError("Please choose a cluster and flashcard.");
      return;
    }

    const generatedNotes = [
      `Issue type: ${formData.issueType}.`,
      formData.comments.trim() ? `Reporter comments: ${formData.comments.trim()}` : "Reporter comments: None provided.",
    ].join(" ");

    const payload = {
      careerCluster: formData.careerCluster.trim(),
      performanceIndicator: formData.performanceIndicator.trim(),
      meaning: formData.meaning.trim(),
      issueType: formData.issueType,
      notes: generatedNotes,
      reporterName: formData.reporterName.trim(),
      reporterEmail: formData.reporterEmail.trim(),
      reporterGoogleId: user?.googleId || user?.sub || user?.google_id || null,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/flashcard-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server rejected report");

      const data = await res.json();
      const insertedReport = {
        id: data?.id || Date.now(),
        created_at: data?.createdAt || new Date().toISOString(),
        status: "open",
        ...payload,
      };

      saveReportLocally(insertedReport);
      setSuccess("Report submitted. Thank you for helping improve the flashcards.");
    } catch {
      const fallbackReport = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        status: "open",
        ...payload,
      };
      saveReportLocally(fallbackReport);
      setSuccess("Report saved locally. It will still appear in the reports list on this device.");
    } finally {
      setSubmitting(false);
      setFormData((prev) => ({
        ...prev,
        comments: "",
      }));
    }
  };

  return (
    <div className="flashcard-reports-page">
      <h1>Flashcard Error Reports</h1>
      <p className="reports-subtitle">
        Submit a report when a flashcard has incorrect wording, meaning, or category mapping.
      </p>

      <form className="report-form" onSubmit={handleSubmit}>
        <label>
          Career Cluster
          <select
            value={formData.careerCluster}
            onChange={(e) => updateForm("careerCluster", e.target.value)}
          >
            <option value="">Select cluster...</option>
            {CLUSTER_OPTIONS.map((cluster) => (
              <option key={cluster.value} value={cluster.value}>
                {cluster.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Flashcard Term (PI)
          <select
            value={formData.performanceIndicator}
            onChange={(e) => {
              const pi = e.target.value;
              const selected = flashcards.find((card) => card.PerformanceIndicator === pi);
              setFormData((prev) => ({
                ...prev,
                performanceIndicator: pi,
                meaning: selected?.Meaning || "",
              }));
            }}
            disabled={loadingCards || !formData.careerCluster}
          >
            <option value="">{loadingCards ? "Loading flashcards..." : "Select flashcard..."}</option>
            {flashcards.map((card) => (
              <option key={card.PerformanceIndicator} value={card.PerformanceIndicator}>
                {card.PerformanceIndicator}
              </option>
            ))}
          </select>
        </label>

        {formData.meaning && (
          <div className="report-selected-meaning">
            <strong>Selected Card Meaning:</strong> {formData.meaning}
          </div>
        )}

        <label>
          Issue Type
          <select
            value={formData.issueType}
            onChange={(e) => updateForm("issueType", e.target.value)}
          >
            <option>Incorrect definition</option>
            <option>Outdated term</option>
            <option>Wrong cluster</option>
            <option>Typo / grammar</option>
            <option>Duplicate flashcard</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Additional Comments (optional)
          <textarea
            rows={4}
            value={formData.comments}
            onChange={(e) => updateForm("comments", e.target.value)}
            placeholder="Add any specific correction notes (optional)"
          />
        </label>

        <div className="reporter-fields">
          <label>
            Your Name (optional)
            <input
              type="text"
              value={formData.reporterName}
              onChange={(e) => updateForm("reporterName", e.target.value)}
              placeholder="Name"
            />
          </label>
          <label>
            Your Email (optional)
            <input
              type="email"
              value={formData.reporterEmail}
              onChange={(e) => updateForm("reporterEmail", e.target.value)}
              placeholder="Email"
            />
          </label>
        </div>

        <button type="submit" className="submit-report-button" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Flashcard Report"}
        </button>

        {error && <p className="report-message error">{error}</p>}
        {success && <p className="report-message success">{success}</p>}
      </form>

      {developerView && (
        <section className="reports-table-section">
          <div className="reports-table-header">
            <div>
              <h2>Recent Reports</h2>
              {!showAllReports && hiddenCount > 0 && (
                <p className="reports-filter-note">
                  Rapid-succession filter is hiding {hiddenCount} report{hiddenCount === 1 ? "" : "s"}.
                </p>
              )}
            </div>
            <button
              type="button"
              className="reports-toggle-button"
              onClick={() => setShowAllReports((prev) => !prev)}
            >
              {showAllReports ? "Show filtered reports" : "Show all reports"}
            </button>
          </div>
          {loadingReports ? (
            <p>Loading reports...</p>
          ) : visibleReports.length === 0 ? (
            <p>No reports yet.</p>
          ) : (
            <div className="reports-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Submitted</th>
                    <th>Cluster</th>
                    <th>Term</th>
                    <th>Issue Type</th>
                    <th>Details</th>
                    <th>Reporter</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReports.map((report) => (
                    <tr key={report.id}>
                      <td>{new Date(report.created_at).toLocaleString()}</td>
                      <td>{report.career_cluster || report.careerCluster}</td>
                      <td>{report.performance_indicator || report.performanceIndicator}</td>
                      <td>{report.issue_type || report.issueType}</td>
                      <td>{report.notes}</td>
                      <td>{report.reporter_email || report.reporterEmail || report.reporter_name || report.reporterName || "N/A"}</td>
                      <td>
                        <div className="status-actions">
                          <span className={`status-chip status-${getReportStatus(report)}`}>
                            {getReportStatus(report)}
                          </span>
                          <button
                            type="button"
                            className="status-toggle-button"
                            disabled={Boolean(updatingStatusIds[report.id]) || getReportStatus(report) === "open"}
                            onClick={() => handleStatusChange(report.id, "open", report.performance_indicator || report.performanceIndicator || "this report")}
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            className="status-toggle-button"
                            disabled={Boolean(updatingStatusIds[report.id]) || getReportStatus(report) === "resolved"}
                            onClick={() => handleStatusChange(report.id, "resolved", report.performance_indicator || report.performanceIndicator || "this report")}
                          >
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default FlashcardReports;
