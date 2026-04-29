"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  userId: string;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "badge-green",
  UPDATE: "badge-blue",
  DELETE: "badge-red",
  UPLOAD: "badge-purple",
  INVITE: "badge-yellow",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.logs || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-fade-up" style={{ maxWidth: 860 }}>
      <div className="page-header">
        <h1>Audit Trail</h1>
        <p>
          Complete log of all data changes — required for regulatory compliance
          verification
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 52 }} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No audit logs yet</h3>
            <p>
              Actions like uploading data, adding suppliers, and generating
              reports will appear here
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
                <th>User</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span
                      className={`badge ${ACTION_COLORS[log.action] ?? "badge-gray"}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {log.entity}
                  </td>
                  <td
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-secondary)",
                      maxWidth: 280,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.details || "—"}
                  </td>
                  <td
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                    }}
                  >
                    {log.userId.slice(0, 8)}…
                  </td>
                  <td
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
