export function renderPublicRows(rows) {
  if (rows.length === 0) {
    return `
      <div class="placeholder">
        <h2>Public data</h2>
        <p>No public rows are available yet.</p>
      </div>
    `;
  }

  return `
    <section class="public-rows">
      <h2>Public data</h2>
      <div class="public-row-list">
        ${rows
          .map(
            (row) => `
              <article class="public-row-card">
                <h3>${escapeHtml(row.title)}</h3>
                <p>${escapeHtml(row.description)}</p>
              </article>
            `
          )
          .join('')}
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
