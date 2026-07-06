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
  return {
    companyName: typeof input.companyName === 'string' ? input.companyName.trim() : '',
    category: typeof input.category === 'string' ? input.category.trim() : '',
    referralLink: typeof input.referralLink === 'string' ? input.referralLink.trim() : '',
    bonusDescription: typeof input.bonusDescription === 'string' ? input.bonusDescription.trim() : ''
  };
}

export function buildPrivateRowActions() {
  return {
    saveLabel: 'Save changes',
    deleteLabel: 'Delete row'
  };
}

export function normalizePrivateRows(rows) {
  return rows.map((row) => {
    const data = row.data();

    return {
      id: row.id,
      companyName: typeof data.companyName === 'string' ? data.companyName : '',
      category: typeof data.category === 'string' ? data.category : '',
      referralLink: typeof data.referralLink === 'string' ? data.referralLink : '',
      bonusDescription: typeof data.bonusDescription === 'string' ? data.bonusDescription : '',
      views: Number.isInteger(data.views) ? data.views : 0
    };
  });
}
