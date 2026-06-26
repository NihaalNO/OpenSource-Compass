import { redirect } from "next/navigation";

export default function RemovedProfilePage() {
  redirect("/app/settings");
}
