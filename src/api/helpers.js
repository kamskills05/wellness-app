export function mapRow(row) {
  if (!row) return row;
  return {
    ...row,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

export function mapRows(rows) {
  return (rows || []).map(mapRow);
}

export function parseSort(sort) {
  if (!sort) return { column: "created_at", ascending: false };
  const desc = String(sort).startsWith("-");
  let column = desc ? String(sort).slice(1) : String(sort);
  if (column === "created_date") column = "created_at";
  if (column === "updated_date") column = "updated_at";
  return { column, ascending: !desc };
}

export function throwIfError(error) {
  if (error) {
    const err = new Error(error.message);
    err.status = error.status || 400;
    throw err;
  }
}
