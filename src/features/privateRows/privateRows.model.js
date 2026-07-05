export function buildPrivateRowInput(input) {
  return {
    title: typeof input.title === 'string' ? input.title.trim() : '',
    description: typeof input.description === 'string' ? input.description.trim() : ''
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
      title: typeof data.title === 'string' ? data.title : '',
      description: typeof data.description === 'string' ? data.description : ''
    };
  });
}
