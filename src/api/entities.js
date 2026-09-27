import { supabase } from "./supabaseClient";
import { mapRow, mapRows, parseSort, throwIfError } from "./helpers";

const UUID_KEYS = new Set([
  "problem_type_id",
  "linked_questionnaire_id",
  "linked_problem_type_id",
  "patient_user_id",
  "task_definition_id",
  "questionnaire_id",
  "assignment_id",
  "created_by_id",
]);

function sanitize(payload) {
  const out = { ...payload };
  for (const key of UUID_KEYS) {
    if (key in out && (out[key] === "" || out[key] === "none")) out[key] = null;
  }
  delete out.created_date;
  delete out.updated_date;
  delete out.created_at;
  delete out.updated_at;
  for (const key of ["start_date", "end_date"]) {
    if (key in out && out[key] === "") out[key] = null;
  }
  Object.keys(out).forEach((k) => {
    if (out[k] === undefined) delete out[k];
  });
  return out;
}

function tableApi(table) {
  return {
    async list(sort, limit) {
      let q = supabase.from(table).select("*");
      const { column, ascending } = parseSort(sort);
      q = q.order(column, { ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      throwIfError(error);
      return mapRows(data);
    },
    async filter(filters = {}, sort, limit) {
      let q = supabase.from(table).select("*");
      for (const [key, value] of Object.entries(filters || {})) {
        if (value === undefined) continue;
        q = q.eq(key, value);
      }
      const { column, ascending } = parseSort(sort);
      q = q.order(column, { ascending });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      throwIfError(error);
      return mapRows(data);
    },
    async create(payload) {
      const insert = sanitize(payload);
      if (table === "submissions" || table === "sensation_notes") {
        const { data: sessionData } = await supabase.auth.getUser();
        if (sessionData?.user?.id && !insert.created_by_id) {
          insert.created_by_id = sessionData.user.id;
        }
      }
      const { data, error } = await supabase.from(table).insert(insert).select().single();
      throwIfError(error);
      return mapRow(data);
    },
    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(sanitize(payload)).eq("id", id).select().single();
      throwIfError(error);
      return mapRow(data);
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      throwIfError(error);
      return { id };
    },
  };
}

export const ProblemType = tableApi("problem_types");
export const Questionnaire = tableApi("questionnaires");
export const TaskDefinition = tableApi("task_definitions");
export const PatientTaskAssignment = tableApi("patient_task_assignments");
export const Submission = tableApi("submissions");
export const SensationNote = tableApi("sensation_notes");

export const User = {
  async list(sort, limit) {
    let q = supabase.from("profiles").select("*");
    const { column, ascending } = parseSort(sort);
    q = q.order(column, { ascending });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    throwIfError(error);
    return mapRows(data);
  },
  async filter(filters = {}, sort, limit) {
    let q = supabase.from("profiles").select("*");
    for (const [key, value] of Object.entries(filters || {})) {
      if (value === undefined) continue;
      q = q.eq(key, value);
    }
    const { column, ascending } = parseSort(sort);
    q = q.order(column, { ascending });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    throwIfError(error);
    return mapRows(data);
  },
};
