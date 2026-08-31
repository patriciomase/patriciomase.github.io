import { db } from "@/db";
import { messages } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DeleteMessageButton } from "./DeleteMessageButton";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function MessagesPage() {
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(200);

  return (
    <>
      <h1>Messages ({rows.length})</h1>
      {rows.length === 0 ? (
        <p className="empty">No messages yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>From</th>
              <th>Message</th>
              <th>Lang</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td>{formatDate(m.createdAt)}</td>
                <td>
                  {m.name}
                  <br />
                  <span className="empty">{m.email}</span>
                </td>
                <td className="body-cell">{m.body}</td>
                <td>
                  <span className="badge">{m.locale}</span>
                </td>
                <td>
                  <DeleteMessageButton id={m.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
