import { buildPrivateRowActions } from './privateRows.model.js';

export function renderPrivateRows(rows, emptyState) {
  const actions = buildPrivateRowActions();

  if (rows.length === 0) {
    return `
      <div class="placeholder">
        <h3>${escapeHtml(emptyState.title)}</h3>
        <p>${escapeHtml(emptyState.description)}</p>
      </div>
    `;
  }

  return `
    <div class="private-row-list">
      ${rows
        .map(
          (row) => `
            <article class="private-row-card" data-row-id="${row.id}">
              <form class="private-row-edit-form" data-row-id="${row.id}">
                <label class="field">
                  <span>Title</span>
                  <input name="title" type="text" value="${escapeHtmlAttribute(row.title)}" autocomplete="off" />
                </label>
                <label class="field">
                  <span>Description</span>
                  <textarea name="description" rows="3">${escapeHtml(row.description)}</textarea>
                </label>
                <div class="private-row-actions">
                  <button class="action-button" type="submit">${actions.saveLabel}</button>
                  <button class="action-button danger-button" type="button" data-role="delete-row">${actions.deleteLabel}</button>
                </div>
                <p class="form-feedback" data-role="edit-feedback" aria-live="polite"></p>
              </form>
            </article>
          `
        )
        .join('')}
    </div>
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

function escapeHtmlAttribute(value) {
  return escapeHtml(value);
}
