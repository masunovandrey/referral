export function buildCompanyKey(companyName) {
  const normalized =
    typeof companyName === 'string'
      ? companyName.trim().toLowerCase().replace(/\s+/g, ' ')
      : '';

  return normalized ? encodeURIComponent(normalized) : '';
}

export function buildPublicRowId(uid, companyKey) {
  return `${uid}_${companyKey}`;
}

export function normalizePublicRows(rows) {
  return rows
    .map((row) => {
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
        bonusDescription:
          typeof data.bonusDescription === 'string' ? data.bonusDescription : '',
        ownerUid: typeof data.ownerUid === 'string' ? data.ownerUid : '',
        sourceRowId: typeof data.sourceRowId === 'string' ? data.sourceRowId : '',
        clicks: Number.isInteger(data.clicks) ? data.clicks : 0
      };
    })
    .filter(isRenderablePublicRow);
}

export function groupPublicRowsByCompany(rows) {
  const groups = new Map();

  for (const row of rows) {
    if (!isRenderablePublicRow(row)) {
      continue;
    }

    const existingGroup = groups.get(row.companyKey);

    if (existingGroup) {
      existingGroup.links.push(row);

      if (row.category && !existingGroup.categories.includes(row.category)) {
        existingGroup.categories.push(row.category);
      }

      continue;
    }

    groups.set(row.companyKey, {
      companyKey: row.companyKey,
      companyName: row.companyName,
      categories: row.category ? [row.category] : [],
      links: [row]
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      categories: group.categories.sort(),
      linkCount: group.links.length
    }))
    .sort((left, right) => left.companyName.localeCompare(right.companyName));
}

export function pickRandomPublicRow(rows, random = Math.random) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const index = Math.min(rows.length - 1, Math.max(0, Math.floor(random() * rows.length)));

  return rows[index];
}

function isRenderablePublicRow(row) {
  return Boolean(row.companyName && row.companyKey && row.referralLink);
}
