import copy
import json
import math
import os
import sys
from collections import defaultdict
from datetime import datetime

import openpyxl
from openpyxl.styles import Alignment, Border, PatternFill, Side
from openpyxl.utils import get_column_letter


def parse_date(value):
    if not value:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%d-%b-%Y")
    if isinstance(value, str):
        value = value.strip()
        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d.%m.%y", "%d.%m.%Y"):
            try:
                parsed = datetime.strptime(value, fmt)
                return parsed.strftime("%d-%b-%Y")
            except ValueError:
                continue
        return value
    return str(value)


def safe_write(ws, cell, value):
    target = cell
    for rng in ws.merged_cells.ranges:
        if cell in rng:
            target = ws.cell(rng.min_row, rng.min_col).coordinate
            break
    try:
        ws[target].value = value
    except AttributeError:
        # Skip if the template has an unexpected merged-cell layout.
        return


def apply_border(cell):
    border = Border(
        left=Side(border_style="thin"),
        right=Side(border_style="thin"),
        top=Side(border_style="thin"),
        bottom=Side(border_style="thin"),
    )
    cell.border = border
    cell.alignment = Alignment(horizontal="center", vertical="center")


def normalize_angle_weld(value):
    if not value:
        return "Diagonal"
    text = str(value).strip().lower()
    if text in ("b", "box"):
        return "Box"
    return "Diagonal"


def packing_details_def(
    product,
    profile_length,
    num_profiles,
    angle_weld_type,
    design,
    description,
    profile_width,
    strip_width,
    max_crate_width,
    ce_ext_override=None,
    custom_crates=None,
):
    def calculate_crate_width(arrangement, profile_thickness, flange_height, count):
        current_width = profile_thickness
        if arrangement == "single":
            for _ in range(1, count):
                current_width += flange_height
        elif arrangement == "double":
            for i in range(2, count + 1):
                if i % 2 == 1:
                    current_width += profile_thickness
                else:
                    current_width += flange_height
        current_width = c_channel_height * 2 + current_width
        return current_width

    def auto_fill_crates(total, max_per_crate, max_width):
        crates = []
        max_fit = 1
        while max_fit < max_per_crate:
            if (
                calculate_crate_width(
                    arrangement, profile_thickness, flange_height, max_fit + 1
                )
                > max_width
            ):
                break
            max_fit += 1
        while total > 0:
            count = min(max_fit, total)
            crates.append(count)
            total -= count
        return crates

    def calculate_crate_dimensions(per_crate_profiles, flange_height, profile_thickness):
        for rows in range(1, per_crate_profiles + 1):
            cols = math.ceil(per_crate_profiles / rows)
            crate_width = cols * flange_height
            crate_height = rows * profile_thickness
            if math.isclose(crate_height, 0.9 * crate_width, rel_tol=0.05):
                return {
                    "rows": rows,
                    "columns": cols,
                    "crate_width": round(crate_width, 2),
                    "crate_height": round(crate_height, 2),
                }
        rows = math.ceil(math.sqrt(per_crate_profiles))
        cols = math.ceil(per_crate_profiles / rows)
        crate_width = cols * flange_height
        crate_height = rows * profile_thickness
        return {
            "rows": rows,
            "columns": cols,
            "crate_width": round(crate_width, 2),
            "crate_height": round(crate_height, 2),
            "note": "Condition not exactly met.",
        }

    define_packing = {
        "CE_pack": {
            "elex_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "single",
                "flange_height": 16,
                "ce_height": 60,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 5,
            },
            "elexcut_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "single",
                "flange_height": 50,
                "ce_height": 50,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 5,
            },
            "elex_nor_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "single",
                "flange_height": 16,
                "ce_height": 50,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 5,
            },
            "bhel_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "double",
                "flange_height": 3,
                "ce_height": 50,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 77,
            },
            "bhel387_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "double",
                "flange_height": 5,
                "ce_height": 50,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 20,
            },
            "thermax20_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "double",
                "flange_height": 3,
                "ce_height": 50,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 20,
            },
            "sitson_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "single",
                "flange_height": 16,
                "ce_height": 60,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 5,
            },
            "thermax30_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 500,
                "max_crate_width": 1200,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "double",
                "flange_height": 3,
                "ce_height": 50,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 42,
                "crate_height_space": 20,
                "extra_space_packing": 30,
            },
        },
        "DE_pack": {
            "std_pack": {
                "max_u_gap": 3200,
                "ce_ext_fr_u": 700,
                "max_crate_width": 1150,
                "channel_wt_per_m": 4.1,
                "angle_wt_per_m": 2.6,
                "arrange_ce": "single",
                "flange_height": 5,
                "ce_height": 65,
                "channel_height": 40,
                "channel_width": 75,
                "max_ce_crate": 500,
                "crate_height_space": 20,
                "extra_space_packing": 5,
            }
        },
    }

    pack = "CE_pack" if product == "CE" else "DE_pack"
    params = define_packing[pack][design]
    c_channel_height = params["channel_height"]
    c_channel_width = params["channel_width"]
    if product == "CE":
        flange_height = params["flange_height"]
        profile_thickness = params["ce_height"]
        profile_height = profile_width + params["extra_space_packing"]
        max_crate_width = params["max_crate_width"]
        max_profiles_per_crate = params["max_ce_crate"]
    else:
        flange_height = profile_width + 0.5 + strip_width
        inner_width = max_crate_width - 2 * c_channel_height
        max_crate_height = inner_width * 0.90
        profile_thickness = profile_width + 0.5
        horizontal_de_no = round(inner_width / flange_height, 0)
        vertical_de_no = round(max_crate_height / profile_thickness, 0)
        max_profiles_per_crate = round(horizontal_de_no * vertical_de_no, 0)
        total_de_nos = num_profiles
        if total_de_nos > max_profiles_per_crate:
            crates_nos = math.ceil(total_de_nos / max_profiles_per_crate)
            per_crate_pipes = math.ceil(total_de_nos / crates_nos)
            result = calculate_crate_dimensions(
                per_crate_pipes, flange_height, profile_thickness
            )
        else:
            crates_nos = 1
            per_crate_pipes = total_de_nos
            result = calculate_crate_dimensions(
                per_crate_pipes, flange_height, profile_thickness
            )
        profile_height = result["crate_height"]

    max_u_gap = params["max_u_gap"]
    ce_ext = ce_ext_override if ce_ext_override else params["ce_ext_fr_u"]
    channel_wt_per_m = params["channel_wt_per_m"]
    angle_wt_per_m = params["angle_wt_per_m"]
    arrangement = params["arrange_ce"]
    crate_height_space = params["crate_height_space"]

    crate_internal_length = profile_length - 2 * ce_ext
    num_squares = math.ceil(crate_internal_length / max_u_gap) + 1
    if num_squares > 1:
        gap_in_u = math.ceil((crate_internal_length / (num_squares - 1)) / 10) * 10
    else:
        gap_in_u = 0
    adjusted_ce_ext = (profile_length - (num_squares - 1) * gap_in_u) / 2

    crate_length = profile_length - adjusted_ce_ext * 2
    if num_squares > 1:
        actual_gap_in_u = round(
            (crate_length - (num_squares * c_channel_width)) / (num_squares - 1), 0
        )
    else:
        actual_gap_in_u = 0
    crate_height = profile_height + c_channel_height * 2 + crate_height_space

    if product == "CE":
        if custom_crates:
            crate_inputs = []
            remaining_profiles = num_profiles
            for entry in custom_crates:
                profiles = entry["profilesPerCrate"]
                count = entry["noOfCrates"]
                crate_inputs.extend([profiles] * count)
                remaining_profiles -= profiles * count
            if remaining_profiles > 0:
                crate_inputs.extend(
                    auto_fill_crates(
                        remaining_profiles, max_profiles_per_crate, max_crate_width
                    )
                )
        else:
            crate_inputs = auto_fill_crates(
                num_profiles, max_profiles_per_crate, max_crate_width
            )

        crate_summary = {}
        crate_type_counter = 1
        for profiles in crate_inputs:
            width = calculate_crate_width(
                arrangement, profile_thickness, flange_height, profiles
            )
            key = (profiles, round(width, 2))
            if key not in crate_summary:
                crate_summary[key] = {
                    "type_id": f"Crate Type {crate_type_counter}",
                    "count": 1,
                }
                crate_type_counter += 1
            else:
                crate_summary[key]["count"] += 1

        final_summary = {}
        for (profiles, width), info in crate_summary.items():
            final_summary[info["type_id"]] = {
                "no_of_crates": info["count"],
                "profiles_per_crate": profiles,
                "crate_width": width,
                "crate_length": crate_length,
                "crate_height": crate_height,
                "inner_crate_height": profile_height,
                "no_of_U_in_a_crate": num_squares,
                "angle_weld_diagonal_or_box": angle_weld_type,
                "gap_between_u": actual_gap_in_u,
                "channel_wt_per_m": channel_wt_per_m,
                "angle_wt_per_m": angle_wt_per_m,
                "length_of_profiles": profile_length,
                "flange_height": flange_height,
                "width_of_profile": profile_width,
                "description": description,
            }
    else:
        final_summary = {}
        width = result["crate_width"] + c_channel_height * 2
        crate_height = result["crate_height"] + c_channel_height * 2
        final_summary["Crate Type 1"] = {
            "no_of_crates": crates_nos,
            "profiles_per_crate": per_crate_pipes,
            "crate_width": width,
            "crate_length": crate_length,
            "crate_height": crate_height,
            "inner_crate_height": result["crate_height"],
            "no_of_U_in_a_crate": num_squares,
            "angle_weld_diagonal_or_box": angle_weld_type,
            "gap_between_u": actual_gap_in_u,
            "channel_wt_per_m": channel_wt_per_m,
            "angle_wt_per_m": angle_wt_per_m,
            "length_of_profiles": profile_length,
            "flange_height": flange_height,
            "width_of_profile": 0,
            "description": description,
        }

    for _, data in final_summary.items():
        num_crates = data["no_of_crates"]
        u_count = data["no_of_U_in_a_crate"]
        width = data["crate_width"]
        height = data["inner_crate_height"] + c_channel_height
        gap = data["gap_between_u"]
        total_height = data["crate_height"]
        angle_type = data["angle_weld_diagonal_or_box"]
        c1_len = width
        c1_qty = u_count * num_crates * 2
        c2_len = height - 2 * c_channel_height
        c2_qty = u_count * num_crates * 2
        if angle_type == "Box":
            a_len = gap
            a_qty = (u_count - 1) * 4 * num_crates
        else:
            a_len = round(math.sqrt(gap**2 + total_height**2))
            a_qty = (u_count - 1) * 2 * num_crates
        data["Channel_requirements"] = {
            f"{c1_len}mm": c1_qty,
            f"{c2_len}mm": c2_qty,
        }
        data["Angle_requirements"] = {f"{a_len}mm": a_qty}

    grand_total_channel_kg = 0
    grand_total_angle_kg = 0
    for _, data in final_summary.items():
        channel_total_kg = 0
        angle_total_kg = 0
        for length_str, qty in data.get("Channel_requirements", {}).items():
            length_mm = int(float(length_str.replace("mm", "")))
            length_m = length_mm / 1000
            wt_per_m = data["channel_wt_per_m"]
            channel_total_kg += qty * length_m * wt_per_m
        for length_str, qty in data.get("Angle_requirements", {}).items():
            length_mm = int(float(length_str.replace("mm", "")))
            length_m = length_mm / 1000
            wt_per_m = data["angle_wt_per_m"]
            angle_total_kg += qty * length_m * wt_per_m
        data["total_channel_weight_kg"] = round(channel_total_kg, 2)
        data["total_angle_weight_kg"] = round(angle_total_kg, 2)
        grand_total_channel_kg += channel_total_kg
        grand_total_angle_kg += angle_total_kg

    return final_summary, round(grand_total_channel_kg, 2), round(grand_total_angle_kg, 2)


# defined_bom, wedge_type, nail_spike, trailer helpers, and main are appended below

defined_bom = {
    "CE": {
        "elex": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 685,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 5,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 6,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 59,
            },
            {
                "sl": 7,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 59,
            },
        ],
        "elex_cut": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 685,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 6,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 7,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 59,
            },
            {
                "sl": 8,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 59,
            },
        ],
        "elex_weld": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 685,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 5,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 6,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 59,
            },
            {
                "sl": 7,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 59,
            },
        ],
        "bhel": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 910,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 3,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 4,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
            {
                "sl": 5,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
        ],
        "thermax": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 620,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 2,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 3,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
            {
                "sl": 4,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
        ],
        "thermax_497": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 620,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 2,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 3,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
            {
                "sl": 4,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
        ],
        "sitson": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 685,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 2,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 3,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
            {
                "sl": 4,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
        ],
        "bhel_387": [
            {
                "sl": 1,
                "name": "CRCA Sheet",
                "specs": "IS 513 CR2",
                "length": 1000,
                "width": 552,
                "thickness": 1.20,
                "pcs": 1,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 61,
            },
            {
                "sl": 5,
                "name": "RPO",
                "specs": "TA 506",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 1,
                "total_weight": 0,
                "rate_per_kg": 135,
            },
            {
                "sl": 6,
                "name": "Channel",
                "specs": "MS Steel",
                "length": 0,
                "width": 75,
                "thickness": 40,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
            {
                "sl": 7,
                "name": "Angle",
                "specs": "MS Steel",
                "length": 0,
                "width": 0,
                "thickness": 0,
                "pcs": 0,
                "weight": 0,
                "total_weight": 0,
                "rate_per_kg": 58,
            },
        ],
    },
    "DE": {},
}

wedge_type = [
    {"type": 1, "wd_length": 265, "wd_thickness": 3, "wd_width": 51, "wd_weight": 0.32, "rate_per_kg": 100, "length_cut": -70},
    {"type": 2, "wd_length": 195, "wd_thickness": 3, "wd_width": 30, "wd_weight": 0.14, "rate_per_kg": 100, "length_cut": -80},
    {"type": 3, "wd_length": 195, "wd_thickness": 4, "wd_width": 30, "wd_weight": 0.185, "rate_per_kg": 100, "length_cut": -80},
    {"type": 4, "wd_length": 106, "wd_thickness": 3, "wd_width": 100, "wd_weight": 0.251, "rate_per_kg": 100, "length_cut": -50},
    {"type": 5, "wd_length": 106, "wd_thickness": 3, "wd_width": 150, "wd_weight": 0.374, "rate_per_kg": 100, "length_cut": -50},
    {"type": 6, "wd_length": 139, "wd_thickness": 1.5, "wd_width": 20, "wd_weight": 0.191, "rate_per_kg": 100, "length_cut": -73},
]

nail_spike = [
    {"type": 1, "name": "Nail", "length": 65, "width": 2.6, "thickness": 0, "rate_per_kg": 120, "nl_weight": 0.00271, "specs": ""},
    {"type": 2, "name": "Spike", "length": 47, "width": 15, "thickness": 1.2, "rate_per_kg": 120, "nl_weight": 0.0066411, "specs": "IS 513 D"},
    {"type": 3, "name": "Spike", "length": 46.65, "width": 15, "thickness": 1.25, "rate_per_kg": 120, "nl_weight": 0.0068663, "specs": "IS 513 D"},
    {"type": 4, "name": "Nail", "length": 65, "width": 2.7, "thickness": 0, "rate_per_kg": 120, "nl_weight": 0.002923, "specs": ""},
    {"type": 5, "name": "Nail", "length": 56, "width": 2.6, "thickness": 0, "rate_per_kg": 120, "nl_weight": 0.002334, "specs": ""},
    {"type": 6, "name": "Spike", "length": 60, "width": 24, "thickness": 1, "rate_per_kg": 120, "nl_weight": 0.011304, "specs": "IS 513 D"},
]

def calculate_trailer_loading_separately_by_length(packing_list):
    max_width = packing_list["max_vehicle_bed"]
    max_height = packing_list["max_height_trailer"]
    space_w = packing_list["crate_between_space_in_width"]
    space_h = packing_list["crate_between_space_in_height"]
    profile_length_map = defaultdict(list)
    for item in packing_list["packing_details"]:
        profile_length = item["length_of_profiles"]
        gross_weight = item["gross_weight_per_crate"]
        for _ in range(item["no_of_crates"]):
            crate = {
                "crate_type": f"Crate Type {item['Crate Type'].split()[-1]}",
                "width": item["crate_width"],
                "height": item["crate_height"],
                "length": item["length_of_profiles"],
                "gross_weight": gross_weight,
            }
            profile_length_map[profile_length].append(crate)

    all_trailers = []
    for length_key, crates in profile_length_map.items():
        crates.sort(key=lambda x: x["width"], reverse=True)
        trailers = []
        current_rows, row = [], []
        row_width = row_max_height = used_height = max_trailer_width_used = 0

        def finalize_trailer(rows_data, max_width_used):
            trailer_summary = defaultdict(int)
            trailer_weight = height_used = 0
            for idx, row_data in enumerate(rows_data):
                row_height = max(crate["height"] for crate in row_data)
                if idx > 0:
                    height_used += space_h
                height_used += row_height
                for crate in row_data:
                    trailer_summary[crate["crate_type"]] += 1
                    trailer_weight += crate["gross_weight"]
            trailer_summary["Max Width Used (mm)"] = max_width_used
            trailer_summary["Max Height Used (mm)"] = height_used
            trailer_summary["Total Gross Weight (kg)"] = trailer_weight
            trailer_summary["Profile Length (mm)"] = length_key + 100
            return trailer_summary

        for crate in crates:
            w, h = crate["width"], crate["height"]
            if row_width + w + (len(row) * space_w) <= max_width:
                row.append(crate)
                row_width += w
                row_max_height = max(row_max_height, h)
            else:
                if used_height + row_max_height + (space_h if current_rows else 0) > max_height:
                    trailers.append(finalize_trailer(current_rows, max_trailer_width_used))
                    current_rows, used_height, max_trailer_width_used = [], 0, 0
                if current_rows:
                    used_height += space_h
                used_height += row_max_height
                current_rows.append(row)
                max_trailer_width_used = max(
                    max_trailer_width_used, row_width + (len(row) - 1) * space_w
                )
                row = [crate]
                row_width = w
                row_max_height = h
        if row:
            if used_height + row_max_height + (space_h if current_rows else 0) > max_height:
                trailers.append(finalize_trailer(current_rows, max_trailer_width_used))
                current_rows = []
            if current_rows:
                used_height += space_h
            used_height += row_max_height
            current_rows.append(row)
            max_trailer_width_used = max(
                max_trailer_width_used, row_width + (len(row) - 1) * space_w
            )
        if current_rows:
            trailers.append(finalize_trailer(current_rows, max_trailer_width_used))
        all_trailers.extend(trailers)
    return {f"Trailer {i+1}": dict(t) for i, t in enumerate(all_trailers)}


def calculate_trailer_loading(packing_list):
    max_width = packing_list["max_vehicle_bed"]
    max_height = packing_list["max_height_trailer"]
    space_w = packing_list["crate_between_space_in_width"]
    space_h = packing_list["crate_between_space_in_height"]
    all_crates = []
    crate_type_id = 1
    for item in packing_list["packing_details"]:
        gross_weight = item["gross_weight_per_crate"]
        for _ in range(item["no_of_crates"]):
            crate = {
                "crate_type": f"Crate Type {crate_type_id}",
                "width": item["crate_width"],
                "height": item["crate_height"],
                "length": item["length_of_profiles"],
                "gross_weight": gross_weight,
            }
            all_crates.append(crate)
        crate_type_id += 1
    all_crates.sort(key=lambda x: x["width"], reverse=True)
    trailers = []
    current_rows = []
    row = []
    row_width = 0
    row_max_height = 0
    used_height = 0
    max_trailer_width_used = 0

    def finalize_trailer(rows_data, max_width_used):
        trailer_summary = defaultdict(int)
        trailer_weight = 0
        height_used = 0
        for idx, row_data in enumerate(rows_data):
            row_height = max(crate["height"] for crate in row_data)
            length = max(crate["length"] for crate in row_data)
            if idx > 0:
                height_used += space_h
            height_used += row_height
            for crate in row_data:
                trailer_summary[crate["crate_type"]] += 1
                trailer_weight += crate["gross_weight"]
        trailer_summary["Max Width Used (mm)"] = max_width_used
        trailer_summary["Max Height Used (mm)"] = height_used
        trailer_summary["Max length Used (mm)"] = length + 100
        trailer_summary["Total Gross Weight (kg)"] = trailer_weight
        return trailer_summary

    for crate in all_crates:
        w, h = crate["width"], crate["height"]
        if row_width + w + (len(row) * space_w) <= max_width:
            row.append(crate)
            row_width += w
            row_max_height = max(row_max_height, h)
        else:
            if used_height + row_max_height + (space_h if current_rows else 0) > max_height:
                trailers.append(finalize_trailer(current_rows, max_trailer_width_used))
                current_rows = []
                used_height = 0
                max_trailer_width_used = 0
            if current_rows:
                used_height += space_h
            used_height += row_max_height
            current_rows.append(row)
            max_trailer_width_used = max(
                max_trailer_width_used, row_width + (len(row) - 1) * space_w
            )
            row = [crate]
            row_width = w
            row_max_height = h

    if row:
        if used_height + row_max_height + (space_h if current_rows else 0) > max_height:
            trailers.append(finalize_trailer(current_rows, max_trailer_width_used))
            current_rows = []
            used_height = 0
            max_trailer_width_used = 0
        if current_rows:
            used_height += space_h
        used_height += row_max_height
        current_rows.append(row)
        max_trailer_width_used = max(
            max_trailer_width_used, row_width + (len(row) - 1) * space_w
        )

    if current_rows:
        trailers.append(finalize_trailer(current_rows, max_trailer_width_used))
    return {f"Trailer {i+1}": dict(t) for i, t in enumerate(trailers)}

def get_loading_type_summary(trailer_result):
    loading_type_map = {}
    crate_combination_to_type = {}
    current_type_id = 1
    for trailer_id, trailer_data in trailer_result.items():
        crate_counts = {k: v for k, v in trailer_data.items() if k.startswith("Crate Type")}
        max_width = trailer_data.get("Max Width Used (mm)", 0)
        max_height = trailer_data.get("Max Height Used (mm)", 0)
        total_weight = trailer_data.get("Total Gross Weight (kg)", 0)
        max_length = trailer_data.get("Max length Used (mm)", 0)
        crate_tuple = tuple(sorted(crate_counts.items()))
        if crate_tuple not in crate_combination_to_type:
            crate_combination_to_type[crate_tuple] = f"Loading Type {current_type_id}"
            current_type_id += 1
        loading_type = crate_combination_to_type[crate_tuple]
        if loading_type not in loading_type_map:
            loading_type_map[loading_type] = {
                "trailers": [],
                "crate_counts": crate_counts,
                "max_width": max_width,
                "max_height": max_height,
                "max_length": max_length,
                "total_weight": total_weight,
            }
        else:
            loading_type_map[loading_type]["max_width"] = max(
                loading_type_map[loading_type]["max_width"], max_width
            )
            loading_type_map[loading_type]["max_height"] = max(
                loading_type_map[loading_type]["max_height"], max_height
            )
            loading_type_map[loading_type]["max_length"] = max_length
            loading_type_map[loading_type]["total_weight"] += total_weight
        loading_type_map[loading_type]["trailers"].append(trailer_id)
    loading_summary = {}
    for loading_type, info in loading_type_map.items():
        crate_summary = ", ".join(
            [f"{ctype} {qty} nos" for ctype, qty in info["crate_counts"].items()]
        )
        loading_summary[loading_type] = {
            "Used_in_trailers": len(info["trailers"]),
            "Crate_Summary": crate_summary,
            "Max_Width_mm": int(info["max_width"]),
            "Max_Height_mm": int(info["max_height"]),
            "Max_Length_mm": int(info["max_length"]),
            "Gross_Weight_per_trailer_kg": info["total_weight"] / len(info["trailers"]),
        }
    return loading_summary

def main():
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"ok": False, "error": "Invalid JSON payload"}))
        return 1

    output_path = payload.get("outputPath")
    if not output_path:
        print(json.dumps({"ok": False, "error": "Missing outputPath"}))
        return 1

    order = payload.get("order") or {}
    quotation = payload.get("quotation") or {}
    input_data = payload.get("input") or {}
    items_input = input_data.get("items") or []
    trailer_input = input_data.get("trailer") or {}
    packing_input = input_data.get("packingList") or {}

    if not items_input:
        print(json.dumps({"ok": False, "error": "No packing list items provided"}))
        return 1

    template_path = os.path.join(os.getcwd(), "asset", "Packing List 21 AREPL.xlsx")
    if not os.path.exists(template_path):
        print(json.dumps({"ok": False, "error": "Packing list template not found"}))
        return 1

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    main_items = []
    for idx, item in enumerate(items_input):
        item_type = str(item.get("itemType", "CE")).upper()
        if item_type == "CE":
            sub_type = str(item.get("design") or "elex").strip().lower()
            if sub_type not in defined_bom["CE"]:
                sub_type = "elex"
            width_od = item.get("width") or 0
            if sub_type in ("elex", "elex_cut", "elex_weld", "sitson"):
                width_od = 500
            elif sub_type == "bhel_387":
                width_od = 387
            elif sub_type == "thermax_497":
                width_od = 497
            thickness = item.get("thickness") or 0
            length = item.get("length") or 0
            qty = item.get("qty") or 0
            angle_weld = normalize_angle_weld(item.get("angleWeldType"))
            design_map = {
                "elex": "elex_pack",
                "elex_cut": "elexcut_pack",
                "elex_weld": "elex_nor_pack",
                "bhel": "bhel_pack",
                "bhel_387": "bhel387_pack",
                "thermax": "thermax20_pack",
                "sitson": "sitson_pack",
                "thermax_497": "thermax30_pack",
            }
            design = design_map.get(sub_type)
            ce_ext_override = item.get("ceExtended")
            custom_crates = item.get("customCrates") or []
            final_summary, grand_total_channel_kg, grand_total_angle_kg = packing_details_def(
                "CE",
                length,
                qty,
                angle_weld,
                design,
                "Collecting Electrodes",
                width_od,
                0,
                0,
                ce_ext_override=ce_ext_override,
                custom_crates=custom_crates,
            )

            defined_bom["CE"][sub_type][0].update({"thickness": thickness})
            defined_bom["CE"][sub_type][0].update({"length": length})
            if sub_type in ("bhel", "thermax"):
                defined_bom["CE"][sub_type][0].update({"width": width_od + 175})
            if sub_type == "elex":
                defined_bom["CE"][sub_type][0].update({"length": length - 220})
            if sub_type == "bhel_387":
                defined_bom["CE"][sub_type][0].update({"length": length - 195})
            if sub_type == "elex_cut":
                defined_bom["CE"][sub_type][0].update({"length": length - 1950})

            packing_weight = 0
            for bom_item in defined_bom["CE"][sub_type]:
                if bom_item["name"] == "RPO":
                    bom_item["weight"] = round(length * width_od / 1000 / 1000 * 0.18, 4)
                    packing_weight += bom_item["weight"]
            for bom_item in defined_bom["CE"][sub_type]:
                if bom_item["name"] == "CRCA Sheet":
                    bom_item["weight"] = round(
                        (
                            bom_item["length"]
                            * bom_item["width"]
                            * bom_item["thickness"]
                            / 1000000
                            * 7.85
                        ),
                        4,
                    )
            qty_safe = qty or 1
            for bom_item in defined_bom["CE"][sub_type]:
                if bom_item["name"] == "Channel":
                    bom_item["weight"] = round(grand_total_channel_kg / qty_safe, 4)
                    packing_weight += bom_item["weight"]
            for bom_item in defined_bom["CE"][sub_type]:
                if bom_item["name"] == "Angle":
                    bom_item["weight"] = round(grand_total_angle_kg / qty_safe, 4)
                    packing_weight += bom_item["weight"]

            item_data = {
                "sl": idx + 1,
                "item": "CE",
                "desc": "Collecting Electrodes",
                "width_OD": width_od,
                "thks": thickness,
                "t_length": length,
                "qty": qty,
                "drawing": item.get("drawing", ""),
                "days_required": item.get("daysRequired", 1),
                "production_start_date": "",
                "sell_rate_per_pc": 0,
            }
            item_data["bom"] = copy.deepcopy(defined_bom["CE"][sub_type])
            gross = 0
            for bom_item in item_data["bom"]:
                bom_item["total_weight"] = round(bom_item["weight"] * qty, 4)
                gross = round(gross + bom_item["weight"], 4)
            item_data["packing_weight"] = packing_weight
            item_data["gross_wt_per_pc"] = gross
            item_data["net_wt_per_pc"] = round(gross - packing_weight, 4)
            item_data["crate_details"] = final_summary
            main_items.append(item_data)

        elif item_type == "DE":
            width_od = item.get("width") or 0
            thickness = item.get("thickness") or 0
            length = item.get("length") or 0
            qty = item.get("qty") or 0
            de_type = str(item.get("deType") or "p").strip().lower()
            angle_weld = normalize_angle_weld(item.get("angleWeldType"))
            strip_width = item.get("stripWidth") or 0
            max_crate_width = item.get("maxCrateWidth") or 1200

            wedge_option = int(item.get("wedgeOption") or 0)
            length_cut = 0
            bom_dict = {}
            if wedge_option == 1:
                wedge_choice = item.get("wedgeType1") or 1
                wedge = next((w for w in wedge_type if w["type"] == wedge_choice), None)
                if wedge:
                    bom_dict["wedge1"] = {
                        "type": wedge["type"],
                        "name": "Wedge1",
                        "length": wedge["wd_length"],
                        "thickness": wedge["wd_thickness"],
                        "width": wedge["wd_width"],
                        "pcs": 1,
                        "weight": wedge["wd_weight"],
                        "rate_per_kg": wedge["rate_per_kg"],
                        "amount_per_pc": wedge["rate_per_kg"] * wedge["wd_weight"],
                        "total_weight": wedge["wd_weight"] * qty,
                        "specs": "IS 3074",
                        "length_cut": wedge["length_cut"],
                    }
                    length_cut += wedge["length_cut"]
            elif wedge_option == 2:
                wedge_choice1 = item.get("wedgeType1") or 1
                wedge_choice2 = item.get("wedgeType2") or wedge_choice1
                wedge1 = next((w for w in wedge_type if w["type"] == wedge_choice1), None)
                wedge2 = next((w for w in wedge_type if w["type"] == wedge_choice2), None)
                if wedge1:
                    bom_dict["wedge1"] = {
                        "type": wedge1["type"],
                        "name": "Wedge1",
                        "length": wedge1["wd_length"],
                        "thickness": wedge1["wd_thickness"],
                        "width": wedge1["wd_width"],
                        "pcs": 1,
                        "weight": wedge1["wd_weight"],
                        "rate_per_kg": wedge1["rate_per_kg"],
                        "amount_per_pc": wedge1["rate_per_kg"] * wedge1["wd_weight"],
                        "total_weight": wedge1["wd_weight"] * qty,
                        "specs": "IS 3074",
                        "length_cut": wedge1["length_cut"],
                    }
                    length_cut += wedge1["length_cut"]
                if wedge2:
                    bom_dict["wedge2"] = {
                        "type": wedge2["type"],
                        "name": "Wedge2",
                        "length": wedge2["wd_length"],
                        "thickness": wedge2["wd_thickness"],
                        "width": wedge2["wd_width"],
                        "pcs": 1,
                        "weight": wedge2["wd_weight"],
                        "rate_per_kg": wedge2["rate_per_kg"],
                        "amount_per_pc": wedge2["rate_per_kg"] * wedge2["wd_weight"],
                        "total_weight": wedge2["wd_weight"] * qty,
                        "specs": "IS 3074",
                        "length_cut": wedge2["length_cut"],
                    }
                    length_cut += wedge2["length_cut"]

            pipe_rate_per_kg = 0
            bom_dict["pipe"] = {
                "length": length + length_cut,
                "width": width_od,
                "thickness": thickness,
                "rate_per_kg": pipe_rate_per_kg,
            }

            if de_type == "p":
                bom_dict["pipe"]["weight"] = round(
                    3.1416
                    * bom_dict["pipe"]["length"]
                    * (width_od - thickness)
                    * thickness
                    * 7.85
                    / 1000000,
                    4,
                )
                bom_dict["pipe"]["specs"] = "IS 5429"
                bom_dict["pipe"]["name"] = "Pipe"
                bom_dict["pipe"]["pcs"] = 1
            elif de_type == "f":
                bom_dict["pipe"]["pipe_width_od"] = width_od + 30
                bom_dict["pipe"]["weight"] = (
                    (width_od + 30)
                    * thickness
                    * (length + length_cut)
                    * 2
                    * 7.85
                    / 1000000
                )
                bom_dict["pipe"]["pcs"] = 2
                bom_dict["pipe"]["specs"] = "IS 513 D"
                bom_dict["pipe"]["name"] = "CRCA Sheet"
            else:
                bom_dict["pipe"]["weight"] = (
                    width_od * thickness * (length + length_cut) * 7.85 / 1000000
                )
                bom_dict["pipe"]["specs"] = "IS 513 D"
                bom_dict["pipe"]["pcs"] = 1
                bom_dict["pipe"]["name"] = "CRCA Sheet"
            bom_dict["pipe"]["total_weight"] = bom_dict["pipe"]["weight"] * qty
            bom_dict["pipe"]["amount_per_pc"] = pipe_rate_per_kg * bom_dict["pipe"]["weight"]

            if item.get("joinPcs") == "y" and de_type == "p":
                bom_dict["joining_pipe"] = {}
                bom_dict["joining_pipe"]["name"] = "Joining Pipe"
                bom_dict["joining_pipe"]["length"] = 200
                bom_dict["joining_pipe"]["width"] = width_od
                bom_dict["joining_pipe"]["thickness"] = thickness
                join_pc = 2 if length > 12000 else 1
                bom_dict["joining_pipe"]["pcs"] = join_pc
                bom_dict["joining_pipe"]["specs"] = "IS 5429"
                bom_dict["joining_pipe"]["weight"] = round(
                    3.1416 * 150 * (width_od - thickness) * thickness * 7.85 / 1000000,
                    4,
                )
                bom_dict["joining_pipe"]["total_weight"] = bom_dict["joining_pipe"]["weight"] * qty
                bom_dict["joining_pipe"]["rate_per_kg"] = pipe_rate_per_kg
                bom_dict["joining_pipe"]["amount_per_pc"] = round(
                    pipe_rate_per_kg * bom_dict["joining_pipe"]["weight"], 4
                )

            spike_type_choice = item.get("spikeType") or 1
            spike_qty = item.get("spikeQty") or 0
            spike_nail = next((w for w in nail_spike if w["type"] == spike_type_choice), None)
            if spike_nail:
                spike_nail = spike_nail.copy()
                spike_nail["pcs"] = spike_qty
                spike_nail["weight"] = spike_qty * spike_nail["nl_weight"]
                spike_nail["total_weight"] = round(spike_nail["weight"] * qty, 4)
                spike_nail["amount_per_pc"] = round(
                    spike_nail["weight"] * spike_nail["rate_per_kg"], 4
                )
                bom_dict["spike_nails"] = spike_nail

            final_summary, grand_total_channel_kg, grand_total_angle_kg = packing_details_def(
                "DE",
                length,
                qty,
                angle_weld,
                "std_pack",
                "Discharge Electrodes",
                width_od,
                strip_width,
                max_crate_width,
            )

            bom_dict["RPO"] = {key: 0 for key in bom_dict["pipe"]}
            bom_dict["RPO"]["weight"] = round(
                (width_od * length / 1000 / 1000 * 0.16 * 3.15) * 2, 4
            )
            bom_dict["RPO"]["total_weight"] = bom_dict["RPO"]["weight"] * qty
            bom_dict["RPO"]["specs"] = "TA 506"
            bom_dict["RPO"]["rate_per_kg"] = 135
            bom_dict["RPO"]["name"] = "RPO"
            bom_dict["RPO"]["amount_per_pc"] = bom_dict["RPO"]["weight"] * 135

            bom_dict["channel"] = {key: 0 for key in bom_dict["pipe"]}
            qty_safe = qty or 1
            bom_dict["channel"]["weight"] = round(grand_total_channel_kg / qty_safe, 4)
            bom_dict["channel"]["total_weight"] = grand_total_channel_kg
            bom_dict["channel"]["specs"] = "MS Steel"
            bom_dict["channel"]["rate_per_kg"] = 59
            bom_dict["channel"]["name"] = "Channel"
            bom_dict["channel"]["amount_per_pc"] = round(bom_dict["channel"]["weight"] * 59, 4)

            bom_dict["angle"] = {key: 0 for key in bom_dict["pipe"]}
            bom_dict["angle"]["weight"] = round(grand_total_angle_kg / qty_safe, 4)
            bom_dict["angle"]["total_weight"] = grand_total_angle_kg
            bom_dict["angle"]["specs"] = "MS Steel"
            bom_dict["angle"]["rate_per_kg"] = 59
            bom_dict["angle"]["name"] = "Angle"
            bom_dict["angle"]["amount_per_pc"] = round(bom_dict["angle"]["weight"] * 59, 4)

            bom_list = list(bom_dict.values())
            new_bom_list = []
            serial = 3
            for part in bom_list:
                name = part.get("name", "").strip().lower()
                if name in ("pipe", "crca sheet"):
                    part["sl"] = 1
                elif name in ("nail", "spike"):
                    part["sl"] = 2
                else:
                    part["sl"] = serial
                    serial += 1
                new_bom_list.append(part)
            new_bom_list.sort(key=lambda x: x.get("sl", 999))

            gross = 0
            for bom_item in new_bom_list:
                gross = round(gross + bom_item.get("weight", 0), 4)

            item_data = {
                "sl": idx + 1,
                "item": "DE",
                "desc": "Discharge Electrodes",
                "width_OD": width_od,
                "thks": thickness,
                "t_length": length,
                "qty": qty,
                "drawing": item.get("drawing", ""),
                "days_required": item.get("daysRequired", 1),
                "production_start_date": "",
                "sell_rate_per_pc": 0,
                "bom": new_bom_list,
                "gross_wt_per_pc": gross,
                "net_wt_per_pc": gross,
                "crate_details": final_summary,
            }
            main_items.append(item_data)
        else:
            item_data = {
                "sl": idx + 1,
                "item": item.get("itemType", "COM"),
                "desc": item.get("itemType", "COM"),
                "width_OD": item.get("width") or 0,
                "thks": item.get("thickness") or 0,
                "t_length": item.get("length") or 0,
                "qty": item.get("qty") or 0,
                "drawing": item.get("drawing", ""),
                "days_required": item.get("daysRequired", 1),
                "production_start_date": "",
                "sell_rate_per_pc": 0,
                "bom": [],
                "gross_wt_per_pc": 0,
                "net_wt_per_pc": 0,
                "crate_details": {
                    "Crate Type 1": {
                        "no_of_crates": 1,
                        "profiles_per_crate": item.get("qty") or 0,
                        "crate_width": 0.0,
                        "crate_length": 0.0,
                        "crate_height": 0.0,
                        "inner_crate_height": 0.0,
                        "no_of_U_in_a_crate": 0,
                        "angle_weld_diagonal_or_box": "",
                        "gap_between_u": 0.0,
                        "channel_wt_per_m": 0.0,
                        "angle_wt_per_m": 0.0,
                        "length_of_profiles": 0.0,
                        "flange_height": 0.0,
                        "width_of_profile": 0.0,
                        "description": item.get("itemType", "COM"),
                        "Channel_requirements": {"key": 0},
                        "Angle_requirements": {"key": 0},
                        "total_channel_weight_kg": 0.0,
                        "total_angle_weight_kg": 0.0,
                    }
                },
            }
            main_items.append(item_data)

    for item in main_items:
        wt_per_pc = item.get("net_wt_per_pc", 0)
        gr_wt_pc = item.get("gross_wt_per_pc", 0)
        crate_details = item.get("crate_details", {})
        for crate in crate_details.values():
            no_profiles = crate.get("profiles_per_crate", 0)
            crate["net_weight_per_crate"] = round(wt_per_pc * no_profiles, 2)
            crate["gross_weight_per_crate"] = round(gr_wt_pc * no_profiles, 2)

    all_crate_data = []
    for item in main_items:
        item_id = item.get("sl", "NA")
        item_name = item.get("item", "NA")
        crate_details = item.get("crate_details", {})
        for crate_type, details in crate_details.items():
            flat_data = {"Item SL": item_id, "Item Name": item_name, "Crate Type": crate_type}
            flat_data.update(details)
            all_crate_data.append(flat_data)

    for idx, entry in enumerate(all_crate_data, start=1):
        entry["Crate Type"] = f"Crate type {idx}"

    packing_list = {
        "pi_no": packing_input.get("piNo") or order.get("offerNo") or "",
        "pl_no": packing_input.get("packingListNo") or "",
        "pl_date": parse_date(packing_input.get("packingListDate"))
        or datetime.now().strftime("%d-%b-%Y"),
        "po_no": order.get("poNumber", ""),
        "max_vehicle_bed": int(trailer_input.get("bedWidth") or 2500),
        "max_height_trailer": int(trailer_input.get("bedHeight") or 2400),
        "crate_between_space_in_width": 100,
        "crate_between_space_in_height": 30,
        "party": packing_input.get("partyName") or order.get("partyName") or "",
        "packing_details": copy.deepcopy(all_crate_data),
    }

    keys_to_delete = [
        "Angle_requirements",
        "angle_weld_diagonal_or_box",
        "angle_wt_per_m",
        "Channel_requirements",
        "channel_wt_per_m",
        "inner_crate_height",
        "crate_length",
        "total_channel_weight_kg",
        "total_angle_weight_kg",
        "no_of_U_in_a_crate",
        "gap_between_u",
    ]

    for item in packing_list["packing_details"]:
        item["total_packing_weight"] = round(
            item.get("total_angle_weight_kg", 0) + item.get("total_channel_weight_kg", 0), 0
        )
        item["total_net_weight"] = round(
            item.get("net_weight_per_crate", 0) * item.get("no_of_crates", 0), 0
        )
        item["total_gross_weight"] = round(
            item.get("gross_weight_per_crate", 0) * item.get("no_of_crates", 0), 0
        )
        item["total_pcs"] = item.get("profiles_per_crate", 0) * item.get("no_of_crates", 0)
        for key in keys_to_delete:
            item.pop(key, None)

    group_by_length = trailer_input.get("separateLoad", "n")
    if group_by_length == "y":
        trailer_result = calculate_trailer_loading_separately_by_length(packing_list)
    else:
        trailer_result = calculate_trailer_loading(packing_list)
    packing_list["trailer_loading_details"] = get_loading_type_summary(trailer_result)

    wb = openpyxl.load_workbook(template_path)
    ws = wb.active
    thin_border = Border(
        left=Side(style="thin"),
        right=Side(style="thin"),
        top=Side(style="thin"),
        bottom=Side(style="thin"),
    )
    bold_font = openpyxl.styles.Font(bold=True)

    safe_write(ws, "E11", packing_list["pl_no"])
    safe_write(ws, "I11", packing_list["pl_date"])
    safe_write(ws, "I13", packing_list["po_no"])
    safe_write(ws, "I15", packing_list["pi_no"])
    ws["A16"] = packing_list["party"]
    ws["A17"] = packing_input.get("addressLine1") or quotation.get("partyAddress") or ""
    ws["A17"].alignment = Alignment(horizontal="left", wrap_text=True)
    gst = packing_input.get("gstNumber") or ""
    if gst:
        ws["A19"] = f"GSTIN/UIN: {gst}"

    header_row = 22
    subheader_row = 23
    start_row = 24
    num_rows = len(packing_list["packing_details"])
    if num_rows > 1:
        ws.insert_rows(start_row + 1, num_rows - 1)

    total_pcs_header = sum(
        item.get("total_pcs", 0) for item in packing_list["packing_details"]
    )
    descriptions = {item.get("description") for item in packing_list["packing_details"]}
    header_description = (
        descriptions.pop() if len(descriptions) == 1 else "Packing List Items"
    )
    safe_write(ws, f"A{header_row}", header_description)
    safe_write(ws, f"B{header_row}", total_pcs_header)

    for i, item in enumerate(packing_list["packing_details"]):
        row = start_row + i
        safe_write(ws, f"A{row}", item["description"])
        safe_write(ws, f"B{row}", item["no_of_crates"])
        safe_write(ws, f"D{row}", item["length_of_profiles"] + 100)
        safe_write(ws, f"E{row}", item["crate_width"])
        safe_write(ws, f"F{row}", item["crate_height"])
        safe_write(ws, f"G{row}", item["profiles_per_crate"])
        safe_write(ws, f"H{row}", round(item["net_weight_per_crate"], 0))
        safe_write(ws, f"I{row}", round(item["gross_weight_per_crate"], 0))
        safe_write(ws, f"J{row}", item["total_pcs"])
        volume_crate = round(
            item["no_of_crates"]
            * item["length_of_profiles"]
            * item["crate_width"]
            * item["crate_height"]
            / 1000000000,
            2,
        )
        safe_write(ws, f"K{row}", volume_crate)
        safe_write(ws, f"L{row}", item["total_net_weight"])
        safe_write(ws, f"M{row}", item["total_gross_weight"])
        for col in "ABCDEFGHIJKLM":
            ws[f"{col}{row}"].border = thin_border

    trailer_start = start_row + num_rows + 3
    safe_write(ws, f"A{trailer_start}", "LOADING DETAILS PER TRAILER BASIS")
    ws.merge_cells(f"A{trailer_start}:A{trailer_start + 1}")
    safe_write(ws, f"B{trailer_start}", "NO OF TRAILERS")
    ws.merge_cells(f"B{trailer_start}:B{trailer_start + 1}")
    safe_write(ws, f"C{trailer_start}", "BED WIDTH")
    ws.merge_cells(f"C{trailer_start}:D{trailer_start}")
    safe_write(ws, f"E{trailer_start}", "HEIGHT")
    ws.merge_cells(f"E{trailer_start}:F{trailer_start}")
    safe_write(ws, f"G{trailer_start}", "LENGTH")
    ws.merge_cells(f"G{trailer_start}:H{trailer_start}")
    safe_write(ws, f"I{trailer_start}", "WEIGHT")
    safe_write(ws, f"I{trailer_start + 1}", "kg")
    for col in "CEG":
        safe_write(ws, f"{col}{trailer_start + 1}", "mm")
    for col in "DFH":
        safe_write(ws, f"{col}{trailer_start + 1}", "feet")
    fill_color = PatternFill(fill_type="solid", fgColor="A3BDF8")
    for col in range(1, 10):
        col_letter = get_column_letter(col)
        apply_border(ws[f"{col_letter}{trailer_start}"])
        apply_border(ws[f"{col_letter}{trailer_start + 1}"])
        ws[f"{col_letter}{trailer_start}"].fill = fill_color
        ws[f"{col_letter}{trailer_start + 1}"].fill = fill_color
    trailer_start += 2
    for i, (type_name, detail) in enumerate(packing_list["trailer_loading_details"].items()):
        row = trailer_start + i
        safe_write(ws, f"A{row}", type_name)
        safe_write(ws, f"B{row}", detail["Used_in_trailers"])
        safe_write(ws, f"C{row}", detail["Max_Width_mm"])
        safe_write(ws, f"D{row}", round(detail["Max_Width_mm"] * 0.0032808399, 2))
        safe_write(ws, f"E{row}", detail["Max_Height_mm"])
        safe_write(ws, f"F{row}", round(detail["Max_Height_mm"] * 0.0032808399, 2))
        safe_write(ws, f"G{row}", detail["Max_Length_mm"])
        safe_write(ws, f"H{row}", round(detail["Max_Length_mm"] * 0.0032808399, 2))
        safe_write(ws, f"I{row}", detail["Gross_Weight_per_trailer_kg"])
        for col in "ABCDEFGHI":
            ws[f"{col}{row}"].border = thin_border
    fill_color = PatternFill(fill_type="solid", fgColor="D9D9D9")
    row += 2
    ws[f"A{row}"] = "TRAILER WISE LOADING ARRANGEMENTS OF CRATES"
    ws[f"A{row}"].fill = fill_color
    ws.merge_cells(f"A{row}:I{row}")
    for col in "ABCDEFGHI":
        ws[f"{col}{row}"].border = thin_border
    for _, detail in packing_list["trailer_loading_details"].items():
        row = row + 1
        safe_write(ws, f"A{row}", detail["Used_in_trailers"])
        safe_write(ws, f"B{row}", detail["Used_in_trailers"])
        safe_write(ws, f"C{row}", detail["Crate_Summary"])
        ws.merge_cells(f"C{row}:I{row}")
        for col in "ABCDEFGHI":
            ws[f"{col}{row}"].border = thin_border

    wb.save(output_path)
    print(json.dumps({"ok": True, "filePath": output_path}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
