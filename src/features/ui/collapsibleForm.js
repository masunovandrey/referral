export function renderCollapsibleForm({ isOpen = false, title = 'Add referral entry' } = {}) {
  if (!isOpen) {
    return '';
  }

  return `
    <section class="collapsible-form">
      <h3 class="collapsible-form__title">${title}</h3>
      <form id="collapsible-form" class="profile-form" data-role="collapsible-form">
        <label class="field">
          <span>Company name</span>
          <input name="companyName" type="text" autocomplete="organization" />
        </label>
        <label class="field">
          <span>Category</span>
          <select name="category" required>
            <option value="" selected disabled>Select category</option>
          </select>
        </label>
        <label class="field">
          <span>Referral link</span>
          <input name="referralLink" type="url" autocomplete="url" />
        </label>
        <label class="field">
          <span>Bonus description</span>
          <textarea name="bonusDescription" rows="4"></textarea>
        </label>
        <button class="action-button" type="submit">Add referral entry</button>
      </form>
    </section>
  `;
}
