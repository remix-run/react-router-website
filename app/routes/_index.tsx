import { redirect } from "@remix-run/node";

export let loader = async () => redirect(`/en/main`);
