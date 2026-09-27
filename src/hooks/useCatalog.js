import { useQuery } from "@tanstack/react-query";
import { ProblemType, Questionnaire, TaskDefinition, PatientTaskAssignment } from "@/api/entities";

export const useProblemTypes = () =>
  useQuery({ queryKey: ["problemTypes"], queryFn: () => ProblemType.list("slug") });

export const useQuestionnaires = () =>
  useQuery({ queryKey: ["questionnaires"], queryFn: () => Questionnaire.list("-created_date") });

export const useTaskDefs = () =>
  useQuery({ queryKey: ["taskDefs"], queryFn: () => TaskDefinition.list("-created_date") });

export const useMyAssignments = (userId) =>
  useQuery({
    queryKey: ["myAssignments", userId],
    queryFn: () => PatientTaskAssignment.filter({ patient_user_id: userId, status: "active" }, "-created_date"),
    enabled: !!userId,
  });