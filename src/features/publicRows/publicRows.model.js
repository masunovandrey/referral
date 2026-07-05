export function normalizePublicRows(rows) {
  return rows
    .map((row) => {
      const data = row.data();

      return {
        id: row.id,
        title: typeof data.title === 'string' ? data.title : '',
        description: typeof data.description === 'string' ? data.description : '',
        visible: data.visible === true
      };
    })
    .filter((row) => row.visible)
    .map(({ id, title, description }) => ({
      id,
      title,
      description
    }));
}
