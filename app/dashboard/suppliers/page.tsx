"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Supplier {
  id: string;
  name: string;
  email: string;
  category: string;
  country: string;
  status: string;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    country: "US",
  });
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/suppliers");
    const d = await res.json();
    setSuppliers(d.suppliers || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "", category: "", country: "US" });
    setShowForm(false);
    setAdding(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this supplier?")) return;
    await fetch("/api/suppliers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }
  async function handleInvite(id: string) {
    const res = await fetch("/api/suppliers/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId: id }),
    });
    const data = await res.json();
    if (data.portalUrl) {
      alert(
        `Portal link (copy and send manually for now):\n\n${data.portalUrl}`,
      );
    }
    load();
  }

  return (
    <div className="animate-fade-up" style={{ maxWidth: 860 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            Suppliers
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Manage your supplier list and track data collection status
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add supplier"}
        </button>
      </div>

      {showForm && (
        <div
          className="card animate-fade-up"
          style={{ marginBottom: "1.5rem" }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
            New supplier
          </h2>
          <form
            onSubmit={handleAdd}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label className="label">Supplier name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Acme Steel Co"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@supplier.com"
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <input
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                placeholder="e.g. steel_manufacturing"
              />
            </div>
            <div>
              <label className="label">Country</label>
              <input
                className="input"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="US"
              />
            </div>
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-primary"
                type="submit"
                disabled={adding}
              >
                {adding ? "Adding…" : "Add supplier"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 48 }} />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⬡</div>
            <p>No suppliers yet — add your first one above</p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Supplier", "Category", "Country", "Status", "Added", ""].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.625rem 0.75rem",
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s.id}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "0.75rem" }}>
                    <div style={{ fontWeight: 500 }}>{s.name}</div>
                    {s.email && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {s.email}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      fontFamily: "monospace",
                      color: "var(--text-secondary)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {s.category}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {s.country}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      className={`badge badge-${s.status === "active" ? "green" : "gray"}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      color: "var(--text-muted)",
                      fontSize: "0.8125rem",
                    }}
                  >
                    {formatDate(s.createdAt)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      className="btn btn-danger"
                      style={{
                        padding: "0.25rem 0.625rem",
                        fontSize: "0.75rem",
                      }}
                      onClick={() => handleDelete(s.id)}
                    >
                      Remove
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "0.75rem" }}
                      onClick={() => handleInvite(s.id)}
                      disabled={
                        !s.email ||
                        s.status === "invited" ||
                        s.status === "active"
                      }
                    >
                      {s.status === "invited"
                        ? "Invited"
                        : s.status === "active"
                          ? "Responded"
                          : "Send invite"}
                    </button>
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
