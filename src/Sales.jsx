import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Banknote, CalendarDays, Pencil, Store } from "lucide-react";
import { api, messageOf } from "./lib";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageSkeleton,
  TableAction,
  TableActions,
  Textarea,
} from "./components/ui";
import { useApp } from "./context";

const formatSalesMoney = (minor = 0) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(minor / 100);
const displayDate = (value) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
        dateStyle: "medium",
      })
    : "—";
const displayDateValue = (value) =>
  value
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Dar_es_Salaam",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(value))
    : "";

export function EntrepreneurSales() {
  const { language } = useApp();
  const sw = language === "sw";
  const client = useQueryClient();
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const query = useQuery({
    queryKey: ["entrepreneur-sales"],
    queryFn: async () => (await api.get("/entrepreneur/sales")).data.data,
  });
  const eligible = query.data?.eligible || [];
  const editable = eligible.filter((item) => item.editable);
  const defaultEntry = editable[0] || eligible[0];
  const initial =
    editing ||
    (defaultEntry
      ? {
          eventId: defaultEntry.event._id,
          boothId: defaultEntry.booth._id,
          saleDate: defaultEntry.window.starts,
        }
      : {});
  const save = async (event) => {
    event.preventDefault();
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await api.put("/entrepreneur/sales", {
        ...values,
        amountMinor: Math.round(Number(values.amount) * 100),
      });
      setEditing(null);
      event.currentTarget.reset();
      await client.invalidateQueries({ queryKey: ["entrepreneur-sales"] });
      await client.invalidateQueries({
        queryKey: ["entrepreneur-sales-dashboard"],
      });
    } catch (requestError) {
      setError(messageOf(requestError));
    }
  };
  if (query.isLoading) return <PageSkeleton />;
  if (query.error) return <Alert>{messageOf(query.error)}</Alert>;
  const summary = query.data.summary;
  return (
    <div className="sales-page">
      <div className="page-head">
        <div>
          <h1>{sw ? "Mauzo ya tukio" : "Event sales"}</h1>
          <p>
            {sw
              ? "Rekodi mauzo ya biashara ya kila siku kwa kila banda lililothibitishwa. Mauzo haya ni tofauti na malipo ya nafasi ya banda."
              : "Record daily business sales for each confirmed booth. These figures are separate from booth booking payments."}
          </p>
        </div>
        <Badge tone="green">
          {sw ? "Mauzo yaliyoripotiwa TZS" : "TZS reported sales"}
        </Badge>
      </div>
      <div className="stats">
        <Card className="stat-card">
          <div className="stat-icon green">
            <Banknote />
          </div>
          <div>
            <span>
              {sw ? "Jumla ya mauzo yaliyoripotiwa" : "Total reported sales"}
            </span>
            <strong>{formatSalesMoney(summary.totalSalesMinor)}</strong>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon blue">
            <CalendarDays />
          </div>
          <div>
            <span>
              {sw ? "Siku za banda zilizoripotiwa" : "Reported booth-days"}
            </span>
            <strong>{summary.reportedDays}</strong>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon orange">
            <Store />
          </div>
          <div>
            <span>{sw ? "Mabanda yanayostahili" : "Eligible booths"}</span>
            <strong>{eligible.length}</strong>
          </div>
        </Card>
      </div>
      {error && <Alert>{error}</Alert>}
      <div className="dashboard-grid">
        <Card className="form-card">
          <h2>
            {editing
              ? sw
                ? "Hariri mauzo ya siku"
                : "Edit daily sales"
              : sw
                ? "Rekodi mauzo ya siku"
                : "Record daily sales"}
          </h2>
          {eligible.length ? (
            <>
              {!editable.length && (
                <Alert>
                  {sw
                    ? "Mabanda haya yako nje ya muda wa kuripoti. Uingizaji huanza tarehe ya tukio na kufungwa siku saba baada ya tukio kuisha."
                    : "These booths are outside their reporting window. Entry becomes available on the event start date and closes seven days after the event ends."}
                </Alert>
              )}
              <form
                key={JSON.stringify(initial)}
                className="auth-form"
                onSubmit={save}
              >
                <Field label={sw ? "Tukio na banda" : "Event and booth"}>
                  <select
                    name="selection"
                    defaultValue={`${initial.eventId}|${initial.boothId}`}
                    onChange={(event) => {
                      const [eventId, boothId] = event.target.value.split("|");
                      event.currentTarget.form.eventId.value = eventId;
                      event.currentTarget.form.boothId.value = boothId;
                    }}
                    required
                  >
                    {eligible.map((item) => (
                      <option
                        key={item.booth._id}
                        value={`${item.event._id}|${item.booth._id}`}
                        disabled={!item.editable}
                      >
                        {item.event.name} — Booth {item.booth.code}
                        {item.editable ? "" : " (reporting locked)"}
                      </option>
                    ))}
                  </select>
                </Field>
                <input
                  type="hidden"
                  name="eventId"
                  defaultValue={initial.eventId}
                />
                <input
                  type="hidden"
                  name="boothId"
                  defaultValue={initial.boothId}
                />
                <Field label={sw ? "Tarehe ya mauzo" : "Sales date"}>
                  <Input
                    name="saleDate"
                    type="date"
                    min={defaultEntry?.window.starts}
                    max={
                      defaultEntry
                        ? displayDateValue(defaultEntry.event.endsAt)
                        : undefined
                    }
                    defaultValue={initial.saleDate}
                    disabled={!editable.length}
                    required
                  />
                </Field>
                <Field
                  label={
                    sw
                      ? "Kiasi cha mauzo ya siku (TZS)"
                      : "Daily sales amount (TZS)"
                  }
                >
                  <Input
                    name="amount"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter the total sold for this day"
                    defaultValue={editing ? editing.amountMinor / 100 : ""}
                    disabled={!editable.length}
                    required
                  />
                </Field>
                <Field label={sw ? "Maelezo (si lazima)" : "Notes (optional)"}>
                  <Textarea
                    name="notes"
                    maxLength="500"
                    placeholder="Optional sales note"
                    defaultValue={editing?.notes || ""}
                    disabled={!editable.length}
                  />
                </Field>
                <div className="form-actions">
                  {editing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(null)}
                    >
                      {sw ? "Ghairi" : "Cancel"}
                    </Button>
                  )}
                  <Button disabled={!editable.length}>
                    {sw ? "Hifadhi mauzo ya siku" : "Save daily sales"}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="empty">
              <strong>
                {sw
                  ? "Bado hakuna banda lililolipiwa na kuthibitishwa."
                  : "No confirmed paid booths yet."}
              </strong>
              <p>
                {sw
                  ? "Baada ya malipo ya banda kuthibitishwa, tumia fomu hii kuongeza mauzo ya kila siku wakati wa tukio."
                  : "After your booth payment is confirmed, use this form to add daily sales during the event."}
              </p>
              <Button asChild>
                <Link to="/portal/bookings">
                  {sw ? "Tazama nafasi zangu" : "View my bookings"}
                </Link>
              </Button>
            </div>
          )}
        </Card>
        <Card className="dashboard-card">
          <h2>{sw ? "Mauzo kwa tukio" : "Sales by event"}</h2>
          <div className="profile-summary">
            {summary.byEvent.map((item) => (
              <div key={item.eventId}>
                <span>{item.eventName}</span>
                <strong>{formatSalesMoney(item.totalSalesMinor)}</strong>
              </div>
            ))}
            {!summary.byEvent.length && (
              <div className="empty">
                {sw
                  ? "Hakuna mauzo yaliyoripotiwa."
                  : "No sales have been reported."}
              </div>
            )}
          </div>
        </Card>
      </div>
      <Card className="table-card">
        <div className="panel-heading">
          <div>
            <h2>{sw ? "Historia ya mauzo ya siku" : "Daily sales history"}</h2>
            <p>
              {sw
                ? "Mauzo ya sifuri yanahesabiwa kama ripoti ya siku iliyokamilika."
                : "Zero-value entries count as a completed daily report."}
            </p>
          </div>
        </div>
        <div className="table-wrap mobile-record-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Booth</th>
                <th>Notes</th>
                <th>Reported sales</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {query.data.sales.map((sale) => {
                const item = eligible.find(
                  (x) => x.booth._id === sale.booth?._id,
                );
                return (
                  <tr key={sale._id}>
                    <td data-label={sw ? "Tarehe" : "Date"}>
                      {displayDate(sale.saleDate)}
                    </td>
                    <td data-label={sw ? "Tukio" : "Event"}>
                      {sale.event?.name}
                    </td>
                    <td data-label={sw ? "Banda" : "Booth"}>
                      Booth {sale.booth?.code}
                    </td>
                    <td data-label={sw ? "Maelezo" : "Notes"}>
                      {sale.notes || "—"}
                    </td>
                    <td data-label={sw ? "Mauzo" : "Sales"}>
                      <strong>{formatSalesMoney(sale.amountMinor)}</strong>
                    </td>
                    <td data-label={sw ? "Hatua" : "Action"}>
                      <TableActions label="Sales report actions">
                        <TableAction
                          disabled={!item?.editable}
                          onSelect={() =>
                            setEditing({
                              ...sale,
                              eventId: sale.event._id,
                              boothId: sale.booth._id,
                            })
                          }
                        >
                          <Pencil />
                          Edit report
                        </TableAction>
                      </TableActions>
                    </td>
                  </tr>
                );
              })}
              {!query.data.sales.length && (
                <tr>
                  <td colSpan="6" className="empty-table">
                    {sw
                      ? "Bado hakuna mauzo ya kila siku yaliyoripotiwa."
                      : "No daily sales reported yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function AdminEntrepreneurSalesDetail() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ["admin-entrepreneur", id],
    queryFn: async () =>
      (await api.get(`/admin/entrepreneurs/${id}`)).data.data,
  });
  const [eventFilter, setEventFilter] = useState("");
  const sales = useMemo(
    () =>
      (query.data?.sales || []).filter(
        (item) => !eventFilter || item.event?._id === eventFilter,
      ),
    [query.data, eventFilter],
  );
  if (query.isLoading) return <PageSkeleton />;
  if (query.error) return <Alert>{messageOf(query.error)}</Alert>;
  const data = query.data,
    summary = data.summary;
  return (
    <div>
      <Link to="/admin/entrepreneurs" className="back-link">
        <ArrowLeft size={16} />
        Entrepreneurs
      </Link>
      <div className="page-head">
        <div>
          <h1>
            {data.profile?.businessName ||
              `${data.user.firstName} ${data.user.lastName}`}
          </h1>
          <p>
            {data.user.email} ·{" "}
            {[data.profile?.district, data.profile?.region]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
        <Badge tone="green">Reported business sales</Badge>
      </div>
      <div className="stats">
        <Card className="stat-card">
          <div className="stat-icon green">
            <Banknote />
          </div>
          <div>
            <span>Total reported sales</span>
            <strong>{formatSalesMoney(summary.totalSalesMinor)}</strong>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon blue">
            <CalendarDays />
          </div>
          <div>
            <span>Reported booth-days</span>
            <strong>{summary.reportedDays}</strong>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon orange">
            <Store />
          </div>
          <div>
            <span>Events reported</span>
            <strong>{summary.byEvent.length}</strong>
          </div>
        </Card>
      </div>
      <Card className="entrepreneur-documents">
        <div>
          <h2>Registration documents</h2>
          <p>Files supplied by the entrepreneur during registration.</p>
        </div>
        <div className="record-actions">
          {data.profile?.businessLicenseDocument ? (
            <Button variant="outline" asChild>
              <a
                href={`/api/uploads/${encodeURIComponent(data.profile.businessLicenseDocument)}`}
                target="_blank"
                rel="noreferrer"
              >
                Business licence
              </a>
            </Button>
          ) : (
            <Badge>No business licence</Badge>
          )}
          {data.profile?.tinDocument ? (
            <Button variant="outline" asChild>
              <a
                href={`/api/uploads/${encodeURIComponent(data.profile.tinDocument)}`}
                target="_blank"
                rel="noreferrer"
              >
                TIN document
              </a>
            </Button>
          ) : (
            <Badge>No TIN document</Badge>
          )}
        </div>
      </Card>
      <Card className="table-card">
        <div className="filters">
          <select
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
          >
            <option value="">All events</option>
            {summary.byEvent.map((item) => (
              <option key={item.eventId} value={item.eventId}>
                {item.eventName}
              </option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Booth</th>
                <th>Notes</th>
                <th>Reported sales</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td>{displayDate(sale.saleDate)}</td>
                  <td>{sale.event?.name}</td>
                  <td>Booth {sale.booth?.code}</td>
                  <td>{sale.notes || "—"}</td>
                  <td>
                    <strong>{formatSalesMoney(sale.amountMinor)}</strong>
                  </td>
                </tr>
              ))}
              {!sales.length && (
                <tr>
                  <td colSpan="5" className="empty-table">
                    No reported sales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
