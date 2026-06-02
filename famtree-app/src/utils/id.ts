export function newPersonId(): string {
  return `p_${crypto.randomUUID().slice(0, 8)}`;
}

export function newRelationshipId(): string {
  return `r_${crypto.randomUUID().slice(0, 8)}`;
}
