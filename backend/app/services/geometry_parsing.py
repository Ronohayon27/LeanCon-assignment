import ifcopenshell
import json
import re
from collections import defaultdict
import datetime

def normalize_element_name(name):
    """Remove trailing numbers after colon from element name"""
    if not name:
        return name
    # Remove pattern like :123276 from the end
    normalized = re.sub(r':\d+$', '', name)
    return normalized.strip()

def convert_to_meters(value, unit_type="length"):
    """Convert values from mm to meters"""
    if value is None:
        return None
    
    # Assuming IFC values are typically in mm, convert to meters
    if unit_type == "length":
        return value / 1000.0  # mm to m
    elif unit_type == "area":
        return value / 1000000.0  # mm² to m²
    elif unit_type == "volume":
        return value / 1000000000.0  # mm³ to m³
    else:
        return value

def get_element_level_with_fallback(element, ifc_file):
    """Get element level with multiple fallback methods"""
    try:
        # Method 1: Check for direct containment relationship
        if hasattr(element, 'ContainedInStructure'):
            for rel in element.ContainedInStructure:
                if hasattr(rel, 'RelatingStructure'):
                    structure = rel.RelatingStructure
                    if structure.is_a('IfcBuildingStorey'):
                        level_name = structure.Name
                        if level_name:
                            print("fount the name in method 1", level_name)
                            return level_name
                        return f"Level_{structure.GlobalId[:8]}"
        
        # Method 2: Check for spatial containment
        for rel in ifc_file.by_type('IfcRelContainedInSpatialStructure'):
            if element in rel.RelatedElements:
                structure = rel.RelatingStructure
                if structure.is_a('IfcBuildingStorey'):
                    level_name = structure.Name
                    if level_name:
                        print("fount the name in method 2", level_name)
                        return level_name
                    return f"Level_{structure.GlobalId[:8]}"
        
        # Method 3: Try to get reference level from properties
        try:
            for definition in element.IsDefinedBy:
                if definition.is_a('IfcRelDefinesByProperties'):
                    prop_set = definition.RelatingPropertyDefinition
                    if prop_set.is_a('IfcPropertySet'):
                        for prop in prop_set.HasProperties:
                            if prop.is_a('IfcPropertySingleValue'):
                                # Look for Reference Level property specifically
                                if prop.Name and 'reference level' in prop.Name.lower():
                                    if prop.NominalValue:
                                        print("fount the name in method 3 with refrences level",str(prop.NominalValue.wrappedValue))
                                        return str(prop.NominalValue.wrappedValue)
                                # Look for Work Plane property as fallback
                                elif prop.Name and 'work plane' in prop.Name.lower():
                                    if prop.NominalValue:
                                        print("fount the name in method 3 with work plane",str(prop.NominalValue.wrappedValue))
                                        return str(prop.NominalValue.wrappedValue)
        except:
            pass
        
        # Method 4: Try to infer level from element placement Z-coordinate, only if there isnt a specific level yet
        try:
            if hasattr(element, 'ObjectPlacement') and element.ObjectPlacement:
                placement = element.ObjectPlacement
                if hasattr(placement, 'RelativePlacement') and placement.RelativePlacement:
                    if hasattr(placement.RelativePlacement, 'Location'):
                        location = placement.RelativePlacement.Location
                        if hasattr(location, 'Coordinates') and len(location.Coordinates) >= 3:
                            z_coord = location.Coordinates[2]
                            # Try to match with known building storey elevations
                            building_storeys = ifc_file.by_type('IfcBuildingStorey')
                            closest_storey = None
                            min_distance = float('inf')
                            
                            for storey in building_storeys:
                                storey_elevation = getattr(storey, 'Elevation', None)
                                if storey_elevation is not None:
                                    distance = abs(z_coord - storey_elevation)
                                    if distance < min_distance and distance < 5000.0:  # Within 5m (5000mm)
                                        min_distance = distance
                                        closest_storey = storey
                            
                            if closest_storey:
                                level_name = closest_storey.Name
                                if level_name:
                                    return level_name
                                return f"Level_{closest_storey.GlobalId[:8]}"
                            else:
                                # Create a reference level based on Z coordinate (convert to meters)
                                return f"Z_{convert_to_meters(z_coord):.1f}m"
        except:
            pass
        
        return "Unknown Level"
    except Exception as e:
        print(f"Warning: Error finding level for element {element}: {e}")
        return "Unknown Level"

def extract_element_quantities(element):
    """Extract volume, area, and length from element quantities"""
    quantities = {
        "volume": None,
        "area": None,
        "length": None
    }
    
    try:
        # Look for quantity sets in element properties
        for definition in element.IsDefinedBy:
            if definition.is_a('IfcRelDefinesByProperties'):
                property_definition = definition.RelatingPropertyDefinition
                if property_definition.is_a('IfcElementQuantity'):
                    for quantity in property_definition.Quantities:
                        if quantity.is_a('IfcQuantityVolume'):
                            # Volume is typically in cubic meters in IFC, but let's convert to be sure
                            volume_value = quantity.VolumeValue
                            if volume_value is not None:
                                quantities["volume"] = volume_value  # Already in m³
                        elif quantity.is_a('IfcQuantityArea'):
                            # Area is typically in square meters in IFC
                            area_value = quantity.AreaValue
                            if area_value is not None:
                                quantities["area"] = area_value  # Already in m²
                        elif quantity.is_a('IfcQuantityLength'):
                            # Length is typically in meters in IFC
                            length_value = quantity.LengthValue
                            if length_value is not None:
                                quantities["length"] = length_value  # Already in m
        
    except Exception as e:
        print(f"Warning: Error extracting quantities for element {element}: {e}")
    
    return quantities

def parse_geometry_data(file_path):
    """
    Parse IFC file and extract aggregated geometry data with normalized names
    
    Args:
        file_path (str): Path to the IFC file to parse
        
    Returns:
        dict: Aggregated data with normalized element names
    """
    
    # Open the IFC file
    try:
        ifc_file = ifcopenshell.open(file_path)
    except Exception as e:
        print(f"Error opening IFC file: {e}")
        return {"error": str(e)}
    
    print(f"IFC Schema: {ifc_file.schema}")
    
    # Define element types to extract, focusing on geometric elements only
    element_types = [
        'IfcWall', 'IfcWallStandardCase',
        'IfcSlab', 'IfcSlabStandardCase', 'IfcSlabElementedCase',
        'IfcBeam', 'IfcBeamStandardCase',
        'IfcColumn', 'IfcColumnStandardCase',
        'IfcMember', 'IfcMemberStandardCase',
        'IfcPlate', 'IfcPlateStandardCase',
        'IfcDoor', 'IfcDoorStandardCase',
        'IfcWindow', 'IfcWindowStandardCase',
        'IfcRoof', 'IfcCurtainWall', 'IfcCovering',
        'IfcStair', 'IfcStairFlight', 'IfcRamp', 'IfcRampFlight', 'IfcRailing',
        'IfcFurnishingElement', 'IfcSystemFurnitureElement',
        'IfcDistributionElement', 'IfcFlowTerminal', 'IfcFlowSegment',
        'IfcBuildingElementProxy', 'IfcProxy'
    ]
    
    # Dictionary to aggregate elements by normalized name and type
    aggregated_elements = defaultdict(lambda: {
        'name': '',
        'type': '',
        'volume': 0.0,
        'area': 0.0,
        'length': 0.0,
        'total': 0,
        'levels': defaultdict(lambda: {'count': 0, 'expressIds': []})
    })
    
    total_processed = 0
    
    print("Processing elements...")
    for element_type in element_types:
        try:
            elements = ifc_file.by_type(element_type)
            if not elements:
                continue
                
            print(f"Processing {len(elements)} {element_type} elements...")
            
            for element in elements:
                try:
                    # Skip elements without geometric representation
                    if not (hasattr(element, 'Representation') and element.Representation):
                        continue
                    
                    total_processed += 1
                    
                    # Get basic information
                    element_name = getattr(element, 'Name', None) or f"{element_type}_{element.id()}"
                    normalized_name = normalize_element_name(element_name)
                    express_id = element.id()
                    
                    # Get level information
                    level = get_element_level_with_fallback(element, ifc_file)
                    
                    # Extract quantities
                    quantities = extract_element_quantities(element)
                    
                    # Create unique key for aggregation (normalized name + type)
                    agg_key = f"{element_type}_{normalized_name}"
                    
                    # Aggregate the data
                    agg_data = aggregated_elements[agg_key]
                    agg_data['name'] = normalized_name
                    agg_data['type'] = element_type
                    agg_data['total'] += 1
                    
                    # Add to level-specific data
                    agg_data['levels'][level]['count'] += 1
                    agg_data['levels'][level]['expressIds'].append(express_id)
                    
                    # Sum up quantities (only if they exist)
                    if quantities['volume'] is not None and quantities['volume'] > 0:
                        agg_data['volume'] += quantities['volume']
                    if quantities['area'] is not None and quantities['area'] > 0:
                        agg_data['area'] += quantities['area']
                    if quantities['length'] is not None and quantities['length'] > 0:
                        agg_data['length'] += quantities['length']
                    
                except Exception as e:
                    print(f"Warning: Error processing element {element}: {e}")
                    continue
                    
        except Exception as e:
            print(f"Warning: Error processing element type {element_type}: {e}")
            continue
    
    # Convert aggregated data to final format
    final_data = []
    
    for agg_key, data in aggregated_elements.items():
        # Convert defaultdict to regular dict for JSON serialization
        levels_dict = dict(data['levels'])
        
        # Round quantities to reasonable precision
        element_data = {
            "name": data['name'],
            "type": data['type'],
            "volume": round(data['volume'], 3) if data['volume'] > 0 else 0.0,  # Volume in m³
            "length": round(data['length'], 3) if data['length'] > 0 else 0.0,  # Length in m
            "area": round(data['area'], 3) if data['area'] > 0 else 0.0,  # Area in m²
            "total": data['total'],
            "levels": levels_dict
        }
        
        final_data.append(element_data)
    
    # Sort by type and name for consistent output
    final_data.sort(key=lambda x: (x['type'], x['name']))
    
    # Extract all unique level names across all elements
    all_levels = set()
    for element_data in final_data:
        all_levels.update(element_data['levels'].keys())
    
    # Sort levels in a logical order
    sorted_levels = sorted(list(all_levels), 
                          key=lambda x: (0 if x.startswith("0") else 
                                       (1 if x.startswith("1") else 
                                        (2 if x.startswith("2") else 
                                         (3 if x.startswith("3") else 
                                          (4 if x.startswith("Roof") else 5)))), x))
    
    # Create final result structure
    result = {
        "metadata": {
            "extraction_timestamp": datetime.datetime.now().isoformat(),
            "total_processed_elements": total_processed,
            "total_aggregated_groups": len(final_data),
            "ifc_schema": ifc_file.schema,
            "all_levels": sorted_levels,  # Add all unique levels to metadata
        },
        "data": final_data
    }
    
    print(f"\nProcessing complete:")
    print(f"  Total elements processed: {total_processed}")
    print(f"  Total aggregated groups: {len(final_data)}")
    
    return result

def save_parsed_data(data, output_file_path):
    """Save the parsed data to a JSON file"""
    try:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Parsed geometry data saved to: {output_file_path}")
    except Exception as e:
        print(f"Error saving file: {e}")

