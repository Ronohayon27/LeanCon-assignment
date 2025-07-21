import ifcopenshell

IFC_PATH = "../../ifc/simple_example.ifc"  # Adjust if needed

model = ifcopenshell.open(IFC_PATH)

elements = model.by_type("IfcElement")
print(f"Found {len(elements)} elements\n")

for el in elements:
    print(el)
    print("====================")
    print("==========")
    print(f"Type: {el.is_a()}")
    print(f"Name: {getattr(el, 'Name', 'Unknown')}")
    print(f"GlobalId: {el.GlobalId}")
    print("Quantities:")

    for rel in model.by_type("IfcRelDefinesByProperties"):
        print(f"  - {rel}:")
        # if el in rel.RelatedObjects:
        #     prop_def = rel.RelatingPropertyDefinition
        #     if prop_def.is_a("IfcElementQuantity"):
        #         print(f"  - {prop_def.Name}:")
        #         for quantity in prop_def.Quantities:
        #             if quantity.is_a("IfcQuantityVolume"):
        #                 print(f"      {quantity.Name} (m³): {quantity.VolumeValue}")
        #             elif quantity.is_a("IfcQuantityArea"):
        #                 print(f"      {quantity.Name} (m²): {quantity.AreaValue}")
        #             elif quantity.is_a("IfcQuantityLength"):
        #                 print(f"      {quantity.Name} (m): {quantity.LengthValue}")
        #             elif quantity.is_a("IfcQuantityCount"):
        #                 print(f"      {quantity.Name} (units): {quantity.CountValue}")
    print()
