export function buildPrivateRowInput(input) {
  return {
    companyName: typeof input.companyName === 'string' ? input.companyName.trim() : '',
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
      referralLink: typeof data.referralLink === 'string' ? data.referralLink : '',
      bonusDescription: typeof data.bonusDescription === 'string' ? data.bonusDescription : '',
      views: Number.isInteger(data.views) ? data.views : 0
    };
  });
}
