import { buildPrivateRowActions, referralCategories } from './privateRows.model.js';

export function renderPrivateRows(rows, emptyState) {
  const actions = buildPrivateRowActions();
  const categoryOptions = buildCategoryOptions();

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
                  <span>Company name</span>
                  <input name="companyName" type="text" value="${escapeHtmlAttribute(row.companyName)}" autocomplete="organization" />
                </label>
                <label class="field">
                  <span>Category</span>
                  <select name="category" required>
                    <option value="" disabled ${row.category ? '' : 'selected'}>Select category</option>
                    ${categoryOptions(row.category)}
                  </select>
                </label>
                <label class="field">
                  <span>Referral link</span>
                  <input name="referralLink" type="url" value="${escapeHtmlAttribute(row.referralLink)}" autocomplete="url" />
                </label>
                <label class="field">
                  <span>Bonus description</span>
                  <textarea name="bonusDescription" rows="3">${escapeHtml(row.bonusDescription)}</textarea>
                </label>
                <p class="row-meta">Views: ${row.views}</p>
                <div class="private-row-preview">
                  <a href="${escapeHtmlAttribute(row.referralLink)}" target="_blank" rel="noreferrer">Open referral link</a>
                </div>
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

function buildCategoryOptions(selectedCategory = '') {
  return referralCategories
    .map((category) => {
      const selected = category === selectedCategory ? ' selected' : '';
      return `<option value="${escapeHtmlAttribute(category)}"${selected}>${escapeHtml(category)}</option>`;
    })
    .join('');
}
