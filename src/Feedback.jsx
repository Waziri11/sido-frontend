import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, Loader2, MessageSquare, Send } from "lucide-react";
import { api, messageOf } from "./lib";
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Field,
  TableAction,
  TableActions,
  Textarea,
} from "./components/ui";
import { useApp } from "./context";

const copy = {
  en: {
    title: "My Feedback",
    intro:
      "Share technical issues or feedback about SIDO services and follow staff replies.",
    category: "Feedback category",
    technical: "Technical issue",
    procedural: "Service / process feedback",
    message: "Feedback",
    placeholder: "Describe your experience or issue clearly…",
    send: "Send feedback",
    history: "Feedback history",
    empty: "You have not submitted any feedback yet.",
    open: "Open",
    new: "New",
    assigned: "Assigned",
    waiting_user: "Waiting for you",
    resolved: "Resolved",
    closed: "Closed",
    replied: "Replied",
    reply: "SIDO reply",
  },
  sw: {
    title: "Maoni Yangu",
    intro:
      "Tuma tatizo la kiufundi au maoni kuhusu huduma za SIDO na ufuatilie majibu.",
    category: "Aina ya maoni",
    technical: "Tatizo la kiufundi",
    procedural: "Maoni kuhusu huduma / utaratibu",
    message: "Maoni",
    placeholder: "Eleza uzoefu au tatizo lako kwa uwazi…",
    send: "Tuma maoni",
    history: "Historia ya maoni",
    empty: "Bado hujatuma maoni yoyote.",
    open: "Wazi",
    new: "Mapya",
    assigned: "Yamepewa mhudumu",
    waiting_user: "Yanasubiri jibu lako",
    resolved: "Yametatuliwa",
    closed: "Yamefungwa",
    replied: "Yamejibiwa",
    reply: "Jibu la SIDO",
  },
};
const feedbackStatusLabel = (status, labels = {}) =>
  labels[status] ||
  {
    new: "New",
    open: "Open",
    assigned: "Assigned",
    waiting_user: "Waiting for user",
    replied: "Replied",
    resolved: "Resolved",
    closed: "Closed",
  }[status] ||
  status;
const FeedbackStatus = ({ item, labels }) => (
  <Badge
    tone={
      ["replied", "resolved", "closed"].includes(item.status)
        ? "green"
        : "orange"
    }
  >
    {feedbackStatusLabel(item.status, labels)}
  </Badge>
);

export function MyFeedback({ shell: PortalShell }) {
  const { language } = useApp(),
    labels = copy[language] || copy.en,
    client = useQueryClient();
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ["my-feedback"],
    queryFn: async () => (await api.get("/feedback/mine")).data.data,
  });
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const form = event.currentTarget;
      await api.post("/feedback", Object.fromEntries(new FormData(form)));
      form.reset();
      setSuccess(
        language === "sw"
          ? "Maoni yametumwa kwa mafanikio."
          : "Feedback submitted successfully.",
      );
      await client.invalidateQueries({ queryKey: ["my-feedback"] });
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };
  const followUp = async (event, item) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = event.currentTarget;
      await api.post(`/feedback/${item.id}/follow-up`, {
        message: new FormData(form).get("message"),
      });
      form.reset();
      setSuccess(
        language === "sw"
          ? "Ujumbe wa nyongeza umetumwa."
          : "Follow-up sent successfully.",
      );
      await client.invalidateQueries({ queryKey: ["my-feedback"] });
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <PortalShell>
      <div className="page-head">
        <div>
          <h1>{labels.title}</h1>
          <p>{labels.intro}</p>
        </div>
      </div>
      <div className="feedback-layout">
        <Card className="form-card feedback-compose">
          <h2>
            <Send size={19} />
            {labels.send}
          </h2>
          {error && <Alert>{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}
          <form className="auth-form" onSubmit={submit}>
            <Field label={labels.category}>
              <select name="category" required defaultValue="">
                <option value="" disabled>
                  {labels.category}
                </option>
                <option value="technical">{labels.technical}</option>
                <option value="procedural">{labels.procedural}</option>
              </select>
            </Field>
            <Field label={labels.message}>
              <Textarea
                name="feedback"
                required
                maxLength="4000"
                rows="7"
                placeholder={labels.placeholder}
              />
            </Field>
            <Button disabled={busy}>
              {busy && <Loader2 className="spin" />}
              {labels.send}
            </Button>
          </form>
        </Card>
        <Card className="feedback-history">
          <h2>
            <MessageSquare size={19} />
            {labels.history}
          </h2>
          {query.isLoading ? (
            <div className="feedback-loading">
              <Loader2 className="spin" />
            </div>
          ) : query.isError ? (
            <Alert>{messageOf(query.error)}</Alert>
          ) : query.data?.length ? (
            query.data.map((item) => (
              <article key={item.id} className="feedback-item">
                <div className="feedback-item-head">
                  <div>
                    <Badge>
                      {item.category === "technical"
                        ? labels.technical
                        : labels.procedural}
                    </Badge>
                    <FeedbackStatus item={item} labels={labels} />
                  </div>
                  <time>{new Date(item.createdAt).toLocaleString()}</time>
                </div>
                <p>{item.feedback}</p>
                {item.reply && (
                  <div className="feedback-reply">
                    <strong>
                      <CheckCircle2 size={15} />
                      {labels.reply}
                    </strong>
                    <p>{item.reply}</p>
                    <small>
                      {item.repliedBy?.name}
                      {item.repliedAt
                        ? ` · ${new Date(item.repliedAt).toLocaleString()}`
                        : ""}
                    </small>
                  </div>
                )}
                {item.followUps?.map((entry) => (
                  <div className="feedback-follow-up" key={entry.id}>
                    <strong>
                      {entry.authorRole === "entrepreneur"
                        ? language === "sw"
                          ? "Ujumbe wako"
                          : "Your follow-up"
                        : entry.authorRole}
                    </strong>
                    <p>{entry.message}</p>
                    <small>{new Date(entry.createdAt).toLocaleString()}</small>
                  </div>
                ))}
                {item.status === "waiting_user" && (
                  <form
                    className="feedback-follow-up-form"
                    onSubmit={(event) => followUp(event, item)}
                  >
                    <Field
                      label={
                        language === "sw"
                          ? "Jibu la nyongeza"
                          : "Follow-up response"
                      }
                    >
                      <Textarea name="message" maxLength="2000" required />
                    </Field>
                    <Button size="sm" disabled={busy}>
                      {language === "sw" ? "Tuma jibu" : "Send response"}
                    </Button>
                  </form>
                )}
              </article>
            ))
          ) : (
            <div className="empty">{labels.empty}</div>
          )}
        </Card>
      </div>
    </PortalShell>
  );
}

function FeedbackDetails({ item, onSaved }) {
  const [reply, setReply] = useState(item.reply || ""),
    [notes, setNotes] = useState(item.internalNotes || ""),
    [status, setStatus] = useState(
      ["open", "replied"].includes(item.status) ? "new" : item.status,
    ),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/feedback/${item.id}/reply`, { reply });
      onSaved();
    } catch (err) {
      setError(messageOf(err));
      setBusy(false);
    }
  };
  const workflow = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.patch(`/feedback/${item.id}/workflow`, {
        status,
        internalNotes: notes,
        assignToMe: event.nativeEvent.submitter?.value === "assign",
      });
      onSaved();
    } catch (err) {
      setError(messageOf(err));
      setBusy(false);
    }
  };
  return (
    <DialogContent className="feedback-dialog">
      <DialogTitle>Feedback details</DialogTitle>
      {error && <Alert>{error}</Alert>}
      <div className="feedback-meta">
        <div>
          <span>Sender</span>
          <strong>{item.senderName}</strong>
        </div>
        <div>
          <span>Role / business</span>
          <strong>
            {item.senderRole}
            {item.businessName ? ` · ${item.businessName}` : ""}
          </strong>
        </div>
        <div>
          <span>Category</span>
          <Badge>
            {item.category === "technical" ? "Technical" : "Service / process"}
          </Badge>
        </div>
        <div>
          <span>Assigned to</span>
          <strong>{item.assignedTo?.name || "Unassigned"}</strong>
        </div>
      </div>
      <section className="feedback-detail-message">
        <span>Feedback</span>
        <p>{item.feedback}</p>
      </section>
      {item.followUps?.map((entry) => (
        <section className="feedback-follow-up" key={entry.id}>
          <strong>
            {entry.authorRole === "entrepreneur"
              ? "Entrepreneur follow-up"
              : entry.authorRole}
          </strong>
          <p>{entry.message}</p>
          <small>{new Date(entry.createdAt).toLocaleString()}</small>
        </section>
      ))}
      {item.reportType === "ui_error" && (
        <details className="feedback-diagnostics">
          <summary>Technical diagnostics</summary>
          <dl>
            {Object.entries(item.technicalDetails || {})
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replace(/([A-Z])/g, " $1")}</dt>
                  <dd>
                    {key === "occurredAt"
                      ? new Date(value).toLocaleString()
                      : String(value)}
                  </dd>
                </div>
              ))}
          </dl>
        </details>
      )}
      <form className="auth-form workflow-form" onSubmit={workflow}>
        <Field label="Workflow status">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {["new", "assigned", "waiting_user", "resolved", "closed"].map(
              (value) => (
                <option key={value} value={value}>
                  {feedbackStatusLabel(value)}
                </option>
              ),
            )}
          </select>
        </Field>
        <Field label="Internal notes" hint="Only staff can see these notes.">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength="4000"
            rows="3"
          />
        </Field>
        <div className="form-actions">
          <Button type="submit" variant="outline" value="assign">
            Assign to me & save
          </Button>
          <Button type="submit">Save workflow</Button>
        </div>
      </form>
      <form className="auth-form" onSubmit={submit}>
        <Field label={item.reply ? "Edit reply" : "Reply to entrepreneur"}>
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            required
            maxLength="4000"
            rows="5"
          />
        </Field>
        <Button disabled={busy}>
          {busy && <Loader2 className="spin" />}
          {item.reply ? "Update reply" : "Send reply"}
        </Button>
      </form>
    </DialogContent>
  );
}

export function StaffFeedback({ shell: PortalShell }) {
  const client = useQueryClient(),
    [selected, setSelected] = useState(null),
    [params, setParams] = useSearchParams();
  const status = params.get("status") || "";
  const setStatus = (value) => {
    const next = new URLSearchParams(params);
    value ? next.set("status", value) : next.delete("status");
    setParams(next, { replace: true });
  };
  const query = useQuery({
    queryKey: ["staff-feedback", status],
    queryFn: async () =>
      (await api.get("/feedback", { params: { status } })).data.data,
  });
  const saved = async () => {
    setSelected(null);
    await client.invalidateQueries({ queryKey: ["staff-feedback"] });
  };
  const openCount =
    query.data?.filter(
      (item) => !["resolved", "closed", "replied"].includes(item.status),
    ).length || 0;
  return (
    <PortalShell admin>
      <div className="page-head">
        <div>
          <h1>Feedback</h1>
          <p>
            Assign, investigate, respond to, and resolve feedback routed to your
            role.
          </p>
        </div>
        <Badge tone={openCount ? "orange" : "green"}>
          {openCount} requiring attention
        </Badge>
      </div>
      <Card className="table-card">
        <div className="filters">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All workflow states</option>
            {["new", "assigned", "waiting_user", "resolved", "closed"].map(
              (value) => (
                <option key={value} value={value}>
                  {feedbackStatusLabel(value)}
                </option>
              ),
            )}
          </select>
        </div>
        {query.isLoading ? (
          <div className="feedback-loading">
            <Loader2 className="spin" />
          </div>
        ) : query.isError ? (
          <Alert>{messageOf(query.error)}</Alert>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Category</th>
                  <th>Feedback</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {query.data?.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.senderName}</strong>
                      <span>{item.businessName || item.senderRole}</span>
                    </td>
                    <td>
                      <Badge>
                        {item.reportType === "ui_error"
                          ? "UI error"
                          : item.category === "technical"
                            ? "Technical"
                            : "Service / process"}
                      </Badge>
                    </td>
                    <td>
                      <span className="feedback-preview">{item.feedback}</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </td>
                    <td>{item.assignedTo?.name || "Unassigned"}</td>
                    <td>
                      <FeedbackStatus item={item} labels={{}} />
                    </td>
                    <td>
                      <TableActions label="Feedback actions">
                        <TableAction onSelect={() => setSelected(item)}>
                          <Eye />
                          View details
                        </TableAction>
                      </TableActions>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!query.data?.length && (
              <div className="empty">
                No feedback matches this workflow state.
              </div>
            )}
          </div>
        )}
      </Card>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && <FeedbackDetails item={selected} onSaved={saved} />}
      </Dialog>
    </PortalShell>
  );
}
