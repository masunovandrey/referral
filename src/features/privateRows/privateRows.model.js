import { buildCompanyKey } from '../publicRows/publicRows.model.js';

export const referralCategories = [
  'e-commerce & marketplaces',
  'fashion & accessories',
  'beauty',
  'health',
  'wellness & fitness',
  'food',
  'travel',
  'mobility & transportation',
  'fintech',
  'insurance',
  'telecom & connectivity',
  'utilities & home',
  'real estate',
  'software',
  'education',
  'entertainment',
  'games',
  'pet',
  'baby & family'
];

export function buildPrivateRowInput(input) {
  const companyName = typeof input.companyName === 'string' ? input.companyName.trim() : '';

  return {
    companyName,
    companyKey: buildCompanyKey(companyName),
    category: typeof input.category === 'string' ? input.category.trim() : '',
    referralLink: typeof input.referralLink === 'string' ? input.referralLink.trim() : '',
    bonusDescription: typeof input.bonusDescription === 'string' ? input.bonusDescription.trim() : ''
  };
}

export function buildPrivateRowActions() {
  return {
    saveLabel: 'Save changes',
    deleteLabel: 'Delete row',
    publishLabel: 'Publish',
    unpublishLabel: 'Unpublish'
  };
}

export function normalizePrivateRows(rows) {
  return rows.map((row) => {
    const data = row.data();
    const companyName = typeof data.companyName === 'string' ? data.companyName : '';

    return {
      id: row.id,
      companyName,
      companyKey:
        typeof data.companyKey === 'string' && data.companyKey
          ? data.companyKey
          : buildCompanyKey(companyName),
      category: typeof data.category === 'string' ? data.category : '',
      referralLink: typeof data.referralLink === 'string' ? data.referralLink : '',
      bonusDescription: typeof data.bonusDescription === 'string' ? data.bonusDescription : '',
      isPublished: data.isPublished === true,
      publicRowId: typeof data.publicRowId === 'string' ? data.publicRowId : '',
      views: Number.isInteger(data.views) ? data.views : 0,
      clicks: Number.isInteger(data.clicks) ? data.clicks : 0
    };
  });
}

export function attachPublicRowClicks(rows, clicksByPublicRowId) {
  return rows.map((row) => ({
    ...row,
    clicks:
      row.isPublished && row.publicRowId
        ? clicksByPublicRowId.get(row.publicRowId) ?? 0
        : 0
  }));
}
