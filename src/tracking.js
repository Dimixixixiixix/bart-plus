let trackedAliases = [];

export function addAlias(alias) {
  if (!trackedAliases.includes(alias)) {
    trackedAliases.push(alias);
  }
}

export function removeAlias(alias) {
  trackedAliases = trackedAliases.filter(a => a !== alias);
}

export function clearAliases() {
  trackedAliases = [];
}

export function getAliases() {
  return trackedAliases.length > 0
    ? trackedAliases.map(a => [a, a])
    : [['(none)', '']];
}
