import { buildPrivateRowActions, referralCategories } from './privateRows.model.js';

export function renderPrivateRows(rows, emptyState) {
  if (rows.length === 0) {
    return renderPrivateRowsEmptyState(emptyState);
  }

  return `
    <div class="private-row-list">
      ${rows.map(renderPrivateRowCard).join('')}
    </div>
  `;
}

export function renderPrivateRowsEmptyState(emptyState) {
  return `
    <div class="placeholder">
      <h3>${escapeHtml(emptyState.title)}</h3>
      <p>${escapeHtml(emptyState.description)}</p>
    </div>
  `;
}

export function renderPrivateRowCard(row) {
  const actions = buildPrivateRowActions();
  const categoryOptions = buildCategoryOptions;

  return `
    <article class="private-row-card" data-row-id="${escapeHtmlAttribute(row.id)}">
      <div class="private-row-view" data-role="row-view">
        <h3 class="private-row-company">${escapeHtml(row.companyName || 'Untitled company')}</h3>
        <dl class="private-row-details">
          <div>
            <dt>Category</dt>
            <dd>${escapeHtml(row.category || 'Uncategorized')}</dd>
          </div>
          <div>
            <dt>Referral link</dt>
            <dd>${renderReferralLink(row.referralLink)}</dd>
          </div>
          <div>
            <dt>Bonus description</dt>
            <dd>${escapeHtml(row.bonusDescription || 'No bonus description.')}</dd>
          </div>
        </dl>
        <p class="row-meta">${formatRowMeta(row)}</p>
        <div class="private-row-actions">
          <button class="action-button secondary-button" type="button" data-role="edit-row">${actions.editLabel}</button>
          <button class="action-button secondary-button" type="button" data-role="toggle-publish">${row.isPublished ? actions.unpublishLabel : actions.publishLabel}</button>
          <button class="action-button danger-button" type="button" data-role="delete-row">${actions.deleteLabel}</button>
        </div>
      </div>
      <form class="private-row-edit-form profile-form" data-row-id="${escapeHtmlAttribute(row.id)}" hidden>
        <label class="field">
          <span>Company name</span>
          <input name="companyName" type="text" value="${escapeHtmlAttribute(row.companyName)}" autocomplete="organization" />
          <small class="field-error" data-role="companyName-error"></small>
        </label>
        <label class="field">
          <span>Category</span>
          <select name="category" required>
            <option value="" disabled ${row.category ? '' : 'selected'}>Select category</option>
            ${categoryOptions(row.category)}
          </select>
          <small class="field-error" data-role="category-error"></small>
        </label>
        <label class="field">
          <span>Referral link</span>
          <input name="referralLink" type="url" value="${escapeHtmlAttribute(row.referralLink)}" autocomplete="url" />
          <small class="field-error" data-role="referralLink-error"></small>
        </label>
        <label class="field">
          <span>Bonus description</span>
          <textarea name="bonusDescription" rows="3">${escapeHtml(row.bonusDescription)}</textarea>
          <small class="field-error" data-role="bonusDescription-error"></small>
        </label>
        <div class="private-row-actions">
          <button class="action-button" type="submit">${actions.saveLabel}</button>
          <button class="action-button secondary-button" type="button" data-role="cancel-edit">${actions.cancelLabel}</button>
        </div>
      </form>
    </article>
  `;
}

export function setRowEditMode(card, isEditing) {
  const view = card.querySelector('[data-role="row-view"]');
  const form = card.querySelector('.private-row-edit-form');

  if (!view || !form) {
    return;
  }

  view.hidden = isEditing;
  form.hidden = !isEditing;

  if (isEditing) {
    form.querySelector('input, select, textarea')?.focus();
  }
}

function renderReferralLink(referralLink) {
  if (!referralLink) {
    return '<span class="muted">No referral link.</span>';
  }

  return `<a href="${escapeHtmlAttribute(referralLink)}" target="_blank" rel="noreferrer">${escapeHtml(referralLink)}</a>`;
}

function formatRowMeta(row) {
  const parts = [row.isPublished ? 'Published' : 'Not published'];

  if (row.isPublished) {
    parts.push(`Clicks: ${Number.isInteger(row.clicks) ? row.clicks : 0}`);
  }

  parts.push(`Views: ${Number.isInteger(row.views) ? row.views : 0}`);

  return parts.join(' &middot; ');
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
