import { useQuery } from "@tanstack/react-query";
import { auth } from "@/api/auth";

export default function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => auth.me() });
}