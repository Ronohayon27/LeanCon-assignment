import { geometryRoute, getIfcRoute} from "./api";

export async function fetchModelData(id) {
    const res = await fetch(`${geometryRoute()}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch elements");
    return await res.json();
  }


export const fetchModelsList = async () => {
  const res = await fetch(`${getIfcRoute()}`);
  if (!res) return null
  if (!res.ok) throw new Error("Failed to fetch models");
  return await res.json();
};


export const fetchModelDataMongo = async (id) =>{
  const res = await fetch(`${getIfcRoute()}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch elements");
  return await res.json();
}


export const UploadModelFile = async (data) =>{

  const res = await fetch(`${getIfcRoute()}`,{
    method: "POST",
    body: data})
  if (!res.ok) throw new Error("Upload failed");
  return await res.json();
}