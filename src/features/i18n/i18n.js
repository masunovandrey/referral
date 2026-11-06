const dictionaries = {
  en: {
    'home.hero.title': 'Referral links in one click',
    'home.hero.subtitle': 'Choose a company — the link will be copied automatically',
    'home.hero.cta': 'Browse catalog',
    'home.catalog.search.placeholder': 'Search by company or category',
    'home.catalog.chips.all': 'All',
    'home.catalog.copySuccess': 'Referral link is copied',
    'home.catalog.empty.all': 'No referral links yet',
    'home.catalog.empty.notFound': 'Nothing found',
    'profile.add.title': 'Add referral entry',
    'profile.add.submit': 'Add referral entry'
  }
};

const FALLBACK_LANGUAGE = 'en';
let currentLanguage = FALLBACK_LANGUAGE;
const listeners = new Set();

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(language) {
  currentLanguage = Object.prototype.hasOwnProperty.call(dictionaries, language)
    ? language
    : FALLBACK_LANGUAGE;

  for (const listener of listeners) {
    listener(currentLanguage);
  }

  return currentLanguage;
}

export function translate(key, params = {}) {
  const dictionary = dictionaries[currentLanguage] ?? dictionaries[FALLBACK_LANGUAGE];
  const template = dictionary[key] ?? dictionaries[FALLBACK_LANGUAGE][key] ?? key;

  return Object.keys(params).reduce(
    (result, paramKey) => result.split(`{${paramKey}}`).join(String(params[paramKey])),
    template
  );
}

export function subscribeToLanguage(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
