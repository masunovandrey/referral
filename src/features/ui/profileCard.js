export function renderProfileCard({ row } = {}) {
  const safeRow = row ?? {};
  const isPublished = safeRow.isPublished === true;

  return `
    <article class="profile-card${isPublished ? '' : ' profile-card--hidden'}">
      <h3 class="profile-card__company">${safeRow.companyName || 'Untitled company'}</h3>
      <p class="profile-card__category">${safeRow.category || 'Uncategorized'}</p>
      <p class="profile-card__bonus">${safeRow.bonusDescription || 'No bonus description.'}</p>
      <div class="profile-card__meta">
        <span>Views: ${Number.isInteger(safeRow.views) ? safeRow.views : 0}</span>
        <span>Clicks: ${Number.isInteger(safeRow.clicks) ? safeRow.clicks : 0}</span>
      </div>
      <div class="profile-card__actions">
        <button class="profile-card__action" type="button" data-action="edit">Edit</button>
        <button class="profile-card__action" type="button" data-action="${isPublished ? 'unpublish' : 'publish'}">${isPublished ? 'Unpublish' : 'Publish'}</button>
        <button class="profile-card__action" type="button" data-action="delete">Delete</button>
      </div>
    </article>
  `;
}
