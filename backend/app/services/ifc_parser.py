import ifcopenshell
from collections import defaultdict
import re

volume_unit_map = {
    "IfcBeam": "m³",
    "IfcColumn": "m³",
    "IfcMember": "m³",
    "IfcPlate": "m³",
    "IfcSlab": "m³",
    "IfcWall": "m³",
    "IfcElementAssembly": "m³",
    "IfcReinforcingBar": "kg",
    "IfcOpeningElement": "m³"
}

def get_volume_from_quantities(el, model):
    for rel in model.by_type("IfcRelDefinesByProperties"):
        if el in rel.RelatedObjects:
            prop_def = rel.RelatingPropertyDefinition
            if prop_def.is_a("IfcElementQuantity"):
                for quantity in prop_def.Quantities:
                    if quantity.is_a("IfcQuantityVolume"):
                        return quantity.VolumeValue
    return 0.0

def get_element_summary(ifc_path: str):
    model = ifcopenshell.open(ifc_path)
    storeys = model.by_type("IfcBuildingStorey")

    # Prepare level data with elevation
    storey_data = []
    level_map = {}
    for s in storeys:
        elevation = getattr(s, "Elevation", None)
        if elevation is not None:
            storey_data.append((s.GlobalId, s.Name, elevation))
            level_map[s.GlobalId] = s.Name

    storey_data.sort(key=lambda x: x[2])

    summary = defaultdict(lambda: {
        "unit": "unit",
        "total": 0,
        "volume": 0.0,
        "levels": defaultdict(lambda: {
            "count": 0,
            "expressIds": []
        }),
        "ids": []
    })

    elements = model.by_type("IfcElement")

    fallback_assigned = 0
    fallback_failed = 0

    for el in elements:
        type_name = el.is_a()
        name = getattr(el, "Name", "Unknown")
        size = re.sub(r":[^:]+$", "", name)
        key = (type_name, size)

        unit = volume_unit_map.get(type_name, "m³")
        volume = get_volume_from_quantities(el, model)

        # Determine level
        level_name = "Unknown"
        spatial_rels = [
            rel for rel in model.by_type("IfcRelContainedInSpatialStructure")
            if el in rel.RelatedElements
        ]
        if spatial_rels:
            level = spatial_rels[0].RelatingStructure
            level_name = level_map.get(level.GlobalId, "Unknown")
        else:
            try:
                placement = el.ObjectPlacement
                if hasattr(placement, "RelativePlacement") and hasattr(placement.RelativePlacement, "Location"):
                    coords = placement.RelativePlacement.Location.Coordinates
                    z_pos = coords[2] if len(coords) > 2 else 0
                    for i, (_, name, elevation) in enumerate(storey_data):
                        next_elev = storey_data[i + 1][2] if i + 1 < len(storey_data) else elevation + 3
                        if elevation <= z_pos < next_elev:
                            level_name = name
                            fallback_assigned += 1
                            break
                    else:
                        fallback_failed += 1
                        print(f"[WARN] Element #{el.id()} Z={z_pos} did not match any level")
                else:
                    fallback_failed += 1
                    print(f"[WARN] No RelativePlacement for element #{el.id()} ({name})")
            except Exception as e:
                fallback_failed += 1
                print(f"[ERROR] Failed Z-based level match for #{el.id()} ({name}): {e}")

        # Update summary
        summary[key]["unit"] = unit
        summary[key]["total"] += 1
        summary[key]["volume"] += volume
        summary[key]["ids"].append(el.id())
        summary[key]["levels"][level_name]["count"] += 1
        summary[key]["levels"][level_name]["expressIds"].append(el.id())

    print(f"[INFO] Fallback assigned: {fallback_assigned} | Unmatched: {fallback_failed}")

    result = []
    for (etype, size), data in summary.items():
        result.append({
            "elementType": etype,
            "size": size,
            "unit": data["unit"],
            "total": data["total"],
            "volume": round(data["volume"], 3),
            "levels": {k: dict(v) for k, v in data["levels"].items()},
            "expressIds": data["ids"]
        })

    return result
