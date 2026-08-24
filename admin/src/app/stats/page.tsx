import { db } from "@/db";
import { pageViews } from "@/db/schema";
import { sql, desc, gte } from "drizzle-orm";

export const dynamic = "force-dynamic";

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export default async function StatsPage() {
  const byPath = await db
    .select({
      path: pageViews.path,
      total: sql<number>`sum(${pageViews.views})`.mapWith(Number),
    })
    .from(pageViews)
    .groupBy(pageViews.path)
    .orderBy(desc(sql`sum(${pageViews.views})`));

  const byDay = await db
    .select({
      day: pageViews.day,
      total: sql<number>`sum(${pageViews.views})`.mapWith(Number),
    })
    .from(pageViews)
    .where(gte(pageViews.day, daysAgo(30)))
    .groupBy(pageViews.day)
    .orderBy(desc(pageViews.day));

  const totalAllTime = byPath.reduce((sum, r) => sum + r.total, 0);
  const total7d = byDay
    .filter((r) => r.day >= daysAgo(7))
    .reduce((sum, r) => sum + r.total, 0);
  const total30d = byDay.reduce((sum, r) => sum + r.total, 0);

  return (
    <>
      <h1>Stats</h1>

      {totalAllTime === 0 ? (
        <p className="empty">No page views recorded yet — this fills in as the site gets traffic.</p>
      ) : (
        <>
          <div className="cards">
            <div className="card">
              <div className="value">{totalAllTime}</div>
              <div className="label">Views, all time</div>
            </div>
            <div className="card">
              <div className="value">{total30d}</div>
              <div className="label">Views, last 30 days</div>
            </div>
            <div className="card">
              <div className="value">{total7d}</div>
              <div className="label">Views, last 7 days</div>
            </div>
          </div>

          <section>
            <h2>By page</h2>
            <table>
              <thead>
                <tr>
                  <th>Path</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {byPath.map((r) => (
                  <tr key={r.path}>
                    <td>{r.path}</td>
                    <td>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Last 30 days</h2>
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {byDay.map((r) => (
                  <tr key={r.day}>
                    <td>{r.day}</td>
                    <td>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </>
  );
}
