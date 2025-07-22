import { geometryRoute } from "./api";

export async function fetchModelData(id) {
    const res = await fetch(`${geometryRoute()}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch elements");
    return await res.json();
  }
  