"""
11 PhD-level Engineering AI Agents — one per engineering branch.
Each agent has a doctorate-level system prompt and 3 domain-specific tools.
"""
from __future__ import annotations

import math
import anthropic
from anthropic import beta_tool
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()
MODEL = "claude-opus-4-7"
MAX_TOKENS = 8192


def _run(system: str, tools: list, question: str) -> str:
    runner = client.beta.messages.tool_runner(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        thinking={"type": "adaptive"},
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        tools=tools,
        messages=[{"role": "user", "content": question}],
    )
    response = None
    for msg in runner:
        response = msg
    if response is None:
        return ""
    return next((b.text for b in response.content if b.type == "text"), "")


# ─────────────────────────────────────────────────────────────────────────────
# 1. CIVIL & BUILT ENVIRONMENT
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def civil_beam_deflection(
    length_m: float,
    load_kn: float,
    moment_of_inertia_m4: float,
    elastic_modulus_gpa: float,
    load_type: str = "uniform",
) -> dict:
    """Calculate maximum deflection for a simply supported beam.

    Args:
        length_m: Span length in meters.
        load_kn: Total load in kN (uniform) or point load at center (kN).
        moment_of_inertia_m4: Second moment of area in m⁴.
        elastic_modulus_gpa: Young's modulus in GPa (steel≈200, concrete≈30).
        load_type: 'uniform' or 'point_center'.
    """
    E = elastic_modulus_gpa * 1e9
    I = moment_of_inertia_m4
    L = length_m
    W = load_kn * 1e3

    if load_type == "uniform":
        q = W / L
        delta = (5 * q * L**4) / (384 * E * I)
        formula = "δ = 5qL⁴/(384EI)"
    else:
        delta = (W * L**3) / (48 * E * I)
        formula = "δ = PL³/(48EI)"

    ratio = L / delta if delta > 0 else float("inf")
    return {
        "max_deflection_mm": round(delta * 1000, 4),
        "span_deflection_ratio": round(ratio, 1),
        "formula": formula,
        "serviceability_L360": "PASS" if ratio >= 360 else "FAIL — exceeds L/360",
    }


@beta_tool
def civil_bearing_capacity(
    cohesion_kpa: float,
    friction_angle_deg: float,
    depth_m: float,
    width_m: float,
    gamma_kn_m3: float = 18.0,
) -> dict:
    """Compute ultimate and allowable bearing capacity (Terzaghi general shear).

    Args:
        cohesion_kpa: Undrained cohesion c in kPa.
        friction_angle_deg: Internal friction angle φ in degrees.
        depth_m: Foundation embedment depth Df in meters.
        width_m: Foundation width B in meters.
        gamma_kn_m3: Soil unit weight γ in kN/m³ (default 18).
    """
    phi = math.radians(friction_angle_deg)
    if friction_angle_deg > 0:
        Nq = math.exp(math.pi * math.tan(phi)) * math.tan(math.radians(45 + friction_angle_deg / 2)) ** 2
        Nc = (Nq - 1) / math.tan(phi)
        Ng = 2 * (Nq + 1) * math.tan(phi)
    else:
        Nc, Nq, Ng = 5.14, 1.0, 0.0

    qu = cohesion_kpa * Nc + gamma_kn_m3 * depth_m * Nq + 0.5 * gamma_kn_m3 * width_m * Ng
    return {
        "ultimate_capacity_kpa": round(qu, 2),
        "allowable_capacity_kpa": round(qu / 3, 2),
        "factors_Nc_Nq_Ng": [round(Nc, 3), round(Nq, 3), round(Ng, 3)],
        "factor_of_safety": 3.0,
        "method": "Terzaghi General Shear",
    }


@beta_tool
def civil_concrete_mix(
    fck_mpa: float,
    w_c_ratio: float,
    aggregate_mm: int = 20,
) -> dict:
    """Estimate concrete mix proportions per ACI 211.1.

    Args:
        fck_mpa: Characteristic compressive strength at 28 days in MPa.
        w_c_ratio: Water-to-cement ratio (0.30–0.65).
        aggregate_mm: Maximum nominal aggregate size in mm (10, 20, 25, 40).
    """
    fcr = fck_mpa + 8.3  # target mean strength
    water_map = {10: 205, 20: 185, 25: 180, 40: 170}
    water = water_map.get(aggregate_mm, 185)
    cement = round(water / w_c_ratio, 1)
    air = 0.02
    vol_paste = water / 1000 + cement / 3150 + air
    vol_agg = 1 - vol_paste
    coarse = round(vol_agg * 0.62 * 2650, 1)
    fine = round(vol_agg * 0.38 * 2650, 1)
    return {
        "mix_kg_per_m3": {"cement": cement, "water": water, "coarse_agg": coarse, "fine_agg": fine},
        "w_c_ratio": round(w_c_ratio, 3),
        "target_fcr_mpa": round(fcr, 1),
        "air_content_pct": 2.0,
    }


_CIVIL_SYS = """You are Dr. Elena Vargas, PhD in Civil Engineering (Structural & Geotechnical) \
from MIT, 22 years of experience. Licensed Structural Engineer (SE), ASCE Fellow. \
Expert in: reinforced/prestressed concrete (ACI 318), steel design (AISC 360), \
seismic analysis (ASCE 7), foundation engineering, bridge design (AASHTO LRFD), \
geotechnical investigation, and sustainable infrastructure. \
Apply LRFD methods, cite codes by section, explain failure modes and safety factors. \
Perform rigorous PhD-level calculations. Languages: English and Spanish."""


def civil_agent(question: str) -> str:
    """Civil & Built Environment PhD agent."""
    return _run(_CIVIL_SYS, [civil_beam_deflection, civil_bearing_capacity, civil_concrete_mix], question)


# ─────────────────────────────────────────────────────────────────────────────
# 2. INDUSTRIAL & OPERATIONS
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def ind_oee(
    planned_time_min: float,
    downtime_min: float,
    ideal_cycle_time_sec: float,
    total_pieces: int,
    good_pieces: int,
) -> dict:
    """Calculate Overall Equipment Effectiveness (OEE) per SEMI E10.

    Args:
        planned_time_min: Total planned production time in minutes.
        downtime_min: Unplanned + planned downtime in minutes.
        ideal_cycle_time_sec: Ideal (fastest possible) cycle time in seconds.
        total_pieces: Total pieces produced (good + defective).
        good_pieces: Conforming pieces produced.
    """
    run_time = planned_time_min - downtime_min
    availability = run_time / planned_time_min if planned_time_min > 0 else 0
    performance = (ideal_cycle_time_sec / 60 * total_pieces) / run_time if run_time > 0 else 0
    quality = good_pieces / total_pieces if total_pieces > 0 else 0
    oee = availability * performance * quality
    return {
        "OEE_pct": round(oee * 100, 2),
        "availability_pct": round(availability * 100, 2),
        "performance_pct": round(performance * 100, 2),
        "quality_pct": round(quality * 100, 2),
        "world_class_benchmark": "≥85% OEE",
        "gap_to_world_class_pct": round(max(0, 85 - oee * 100), 2),
    }


@beta_tool
def ind_eoq(
    annual_demand: float,
    ordering_cost: float,
    holding_cost_pct: float,
    unit_cost: float,
) -> dict:
    """Calculate Economic Order Quantity and reorder point.

    Args:
        annual_demand: Annual demand in units.
        ordering_cost: Cost per order in currency units.
        holding_cost_pct: Annual holding cost as a fraction of unit cost (e.g. 0.20 for 20%).
        unit_cost: Unit purchase cost in currency.
    """
    H = holding_cost_pct * unit_cost
    eoq = math.sqrt((2 * annual_demand * ordering_cost) / H)
    orders_per_year = annual_demand / eoq
    cycle_days = 365 / orders_per_year
    total_cost = (annual_demand / eoq) * ordering_cost + (eoq / 2) * H
    return {
        "EOQ_units": round(eoq, 1),
        "orders_per_year": round(orders_per_year, 2),
        "cycle_days": round(cycle_days, 1),
        "annual_total_cost": round(total_cost, 2),
        "annual_holding_cost": round((eoq / 2) * H, 2),
        "annual_ordering_cost": round((annual_demand / eoq) * ordering_cost, 2),
    }


@beta_tool
def ind_line_balance(
    task_times_sec: list,
    cycle_time_sec: float,
) -> dict:
    """Analyze assembly line balance efficiency and bottleneck.

    Args:
        task_times_sec: List of individual task/station times in seconds.
        cycle_time_sec: Desired cycle time (takt time) in seconds.
    """
    n_stations = len(task_times_sec)
    total_work = sum(task_times_sec)
    bottleneck = max(task_times_sec)
    theoretical_min = math.ceil(total_work / cycle_time_sec)
    efficiency = (total_work / (n_stations * cycle_time_sec)) * 100
    idle_time = n_stations * cycle_time_sec - total_work
    return {
        "n_stations": n_stations,
        "bottleneck_sec": bottleneck,
        "total_work_content_sec": round(total_work, 2),
        "balance_efficiency_pct": round(efficiency, 2),
        "idle_time_per_cycle_sec": round(idle_time, 2),
        "theoretical_min_stations": theoretical_min,
        "smoothness_index": round(math.sqrt(sum((cycle_time_sec - t) ** 2 for t in task_times_sec)), 3),
    }


_IND_SYS = """You are Dr. Ricardo Fuentes, PhD in Industrial Engineering & Operations Research \
from Georgia Tech, 18 years of experience in manufacturing systems and supply chain. \
Expert in: lean manufacturing, Six Sigma (Black Belt), Toyota Production System, \
simulation (Arena/AnyLogic), integer programming, queueing theory, reliability engineering, \
ergonomics, and ISO 9001/45001. Apply rigorous operations research methods, statistical analysis, \
DMAIC methodology. Cite industry standards. Languages: English and Spanish."""


def industrial_agent(question: str) -> str:
    """Industrial & Operations PhD agent."""
    return _run(_IND_SYS, [ind_oee, ind_eoq, ind_line_balance], question)


# ─────────────────────────────────────────────────────────────────────────────
# 3. MECHANICAL, ENERGY & THERMAL SYSTEMS
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def mech_heat_exchanger(
    mass_flow_hot_kg_s: float,
    cp_hot_kj_kg_k: float,
    t_hot_in_c: float,
    t_hot_out_c: float,
    u_w_m2_k: float,
    lmtd_c: float,
) -> dict:
    """Size a heat exchanger using LMTD method (NTU-effectiveness).

    Args:
        mass_flow_hot_kg_s: Hot fluid mass flow rate in kg/s.
        cp_hot_kj_kg_k: Hot fluid specific heat capacity in kJ/(kg·K).
        t_hot_in_c: Hot fluid inlet temperature in °C.
        t_hot_out_c: Hot fluid outlet temperature in °C.
        u_w_m2_k: Overall heat transfer coefficient in W/(m²·K).
        lmtd_c: Log mean temperature difference in °C (pre-calculated or estimated).
    """
    Q = mass_flow_hot_kg_s * cp_hot_kj_kg_k * 1000 * abs(t_hot_in_c - t_hot_out_c)
    area = Q / (u_w_m2_k * lmtd_c) if (u_w_m2_k * lmtd_c) > 0 else 0
    return {
        "heat_duty_kw": round(Q / 1000, 3),
        "required_area_m2": round(area, 4),
        "LMTD_C": lmtd_c,
        "U_W_m2K": u_w_m2_k,
        "design_margin_20pct_area_m2": round(area * 1.2, 4),
    }


@beta_tool
def mech_carnot_efficiency(
    t_hot_c: float,
    t_cold_c: float,
    actual_efficiency_pct: float = 0.0,
) -> dict:
    """Compute Carnot and second-law efficiency for thermodynamic cycles.

    Args:
        t_hot_c: Hot reservoir temperature in °C.
        t_cold_c: Cold reservoir temperature in °C (sink).
        actual_efficiency_pct: Actual cycle efficiency in % (0 = not provided).
    """
    T_H = t_hot_c + 273.15
    T_C = t_cold_c + 273.15
    eta_carnot = 1 - T_C / T_H
    result = {
        "carnot_efficiency_pct": round(eta_carnot * 100, 3),
        "T_hot_K": round(T_H, 2),
        "T_cold_K": round(T_C, 2),
        "max_work_per_kj_input": round(eta_carnot, 4),
    }
    if actual_efficiency_pct > 0:
        result["second_law_efficiency_pct"] = round(actual_efficiency_pct / (eta_carnot * 100) * 100, 2)
        result["irreversibility_factor"] = round(1 - actual_efficiency_pct / (eta_carnot * 100), 4)
    return result


@beta_tool
def mech_pipe_flow(
    diameter_m: float,
    velocity_m_s: float,
    density_kg_m3: float,
    viscosity_pa_s: float,
    length_m: float,
    roughness_m: float = 0.000046,
) -> dict:
    """Analyze internal pipe flow: Reynolds number, friction factor, head loss (Darcy-Weisbach).

    Args:
        diameter_m: Internal pipe diameter in meters.
        velocity_m_s: Mean flow velocity in m/s.
        density_kg_m3: Fluid density in kg/m³ (water≈1000, air≈1.2).
        viscosity_pa_s: Dynamic viscosity in Pa·s (water≈0.001, air≈1.8e-5).
        length_m: Pipe length in meters.
        roughness_m: Absolute roughness ε in meters (steel≈4.6e-5, PVC≈1.5e-6).
    """
    Re = density_kg_m3 * velocity_m_s * diameter_m / viscosity_pa_s
    regime = "laminar" if Re < 2300 else ("transitional" if Re < 4000 else "turbulent")

    if Re < 2300:
        f = 64 / Re
    else:
        # Colebrook-White (iterative via Swamee-Jain approximation)
        eps_D = roughness_m / diameter_m
        f = 0.25 / (math.log10(eps_D / 3.7 + 5.74 / Re**0.9)) ** 2

    h_f = f * (length_m / diameter_m) * (velocity_m_s**2 / (2 * 9.81))
    delta_p = f * (length_m / diameter_m) * 0.5 * density_kg_m3 * velocity_m_s**2

    return {
        "Reynolds_number": round(Re, 1),
        "flow_regime": regime,
        "Darcy_friction_factor": round(f, 6),
        "head_loss_m": round(h_f, 4),
        "pressure_drop_pa": round(delta_p, 2),
        "pressure_drop_kpa": round(delta_p / 1000, 4),
    }


_MECH_SYS = """You are Dr. Andrés Solano, PhD in Mechanical Engineering (Thermal & Energy Systems) \
from Caltech, 20 years of experience. Expertise: thermodynamics (Rankine, Brayton, refrigeration), \
heat transfer (conduction, convection, radiation), fluid mechanics (CFD, turbomachinery), \
HVAC systems, renewable energy (solar thermal, wind), combustion, and finite element analysis. \
Apply ASME codes, ISO standards, and rigorous first-principles analysis. \
Provide Ph.D.-level solutions with energy balances, exergy analysis, and design optimization. \
Languages: English and Spanish."""


def mechanical_agent(question: str) -> str:
    """Mechanical, Energy & Thermal Systems PhD agent."""
    return _run(_MECH_SYS, [mech_heat_exchanger, mech_carnot_efficiency, mech_pipe_flow], question)


# ─────────────────────────────────────────────────────────────────────────────
# 4. ELECTRICAL, ELECTRONICS & CONTROL
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def elec_three_phase_power(
    line_voltage_v: float,
    line_current_a: float,
    power_factor: float,
    connection: str = "balanced_star",
) -> dict:
    """Analyze three-phase AC power (apparent, active, reactive).

    Args:
        line_voltage_v: Line-to-line (phase) voltage in volts.
        line_current_a: Line current in amperes.
        power_factor: Displacement power factor (0–1, lagging positive).
        connection: 'balanced_star' or 'balanced_delta'.
    """
    S = math.sqrt(3) * line_voltage_v * line_current_a
    P = S * power_factor
    Q = math.sqrt(max(S**2 - P**2, 0))
    phi_deg = math.degrees(math.acos(power_factor))
    phase_voltage = line_voltage_v / math.sqrt(3) if "star" in connection else line_voltage_v
    return {
        "apparent_power_kva": round(S / 1000, 3),
        "active_power_kw": round(P / 1000, 3),
        "reactive_power_kvar": round(Q / 1000, 3),
        "power_factor": power_factor,
        "displacement_angle_deg": round(phi_deg, 2),
        "phase_voltage_v": round(phase_voltage, 2),
        "connection": connection,
    }


@beta_tool
def elec_pid_tuning(
    Kp: float,
    Ki: float,
    Kd: float,
    setpoint: float,
    process_value: float,
    dt_s: float = 0.1,
) -> dict:
    """Compute PID controller output and assess tuning quality.

    Args:
        Kp: Proportional gain.
        Ki: Integral gain (1/Ti).
        Kd: Derivative gain (Td).
        setpoint: Desired process value (SP).
        process_value: Current measured process value (PV).
        dt_s: Sampling interval in seconds.
    """
    error = setpoint - process_value
    p_term = Kp * error
    i_term = Ki * error * dt_s
    d_term = Kd * (error / dt_s)
    output = p_term + i_term + d_term

    Ti = 1 / Ki if Ki != 0 else float("inf")
    Td = Kd
    tau_i = round(Ti, 4)
    return {
        "control_output": round(output, 4),
        "error": round(error, 4),
        "P_term": round(p_term, 4),
        "I_term": round(i_term, 4),
        "D_term": round(d_term, 4),
        "integral_time_Ti_s": tau_i,
        "derivative_time_Td_s": round(Td, 4),
        "controller_form": "parallel ISA",
    }


@beta_tool
def elec_rc_filter(
    resistance_ohm: float,
    capacitance_f: float,
    filter_type: str = "low_pass",
) -> dict:
    """Calculate RC filter cutoff frequency and impedance.

    Args:
        resistance_ohm: Resistance in ohms.
        capacitance_f: Capacitance in farads (e.g. 1e-6 for 1 µF).
        filter_type: 'low_pass' or 'high_pass'.
    """
    tau = resistance_ohm * capacitance_f
    fc = 1 / (2 * math.pi * tau)
    omega_c = 2 * math.pi * fc
    Z_at_fc = math.sqrt(resistance_ohm**2 + (1 / (omega_c * capacitance_f))**2)
    return {
        "time_constant_tau_s": round(tau, 8),
        "cutoff_frequency_hz": round(fc, 4),
        "cutoff_frequency_rad_s": round(omega_c, 4),
        "impedance_at_fc_ohm": round(Z_at_fc, 4),
        "attenuation_at_fc_db": -3.01,
        "filter_type": filter_type,
        "capacitance_nF": round(capacitance_f * 1e9, 4),
    }


_ELEC_SYS = """You are Dr. Sofía Mendoza, PhD in Electrical Engineering (Power Systems & Control) \
from ETH Zürich, 19 years of experience. Expert in: power systems (generation, transmission, \
protection), power electronics (converters, inverters, MPPT), control theory (state-space, \
robust control, optimal control), digital signal processing, SCADA, smart grids, and \
electromagnetic compatibility (EMC). Apply IEEE standards (C37, 519, 1547), IEC 60909, \
and rigorous mathematical analysis. PhD-level circuit analysis, Laplace transforms, stability theory. \
Languages: English and Spanish."""


def electrical_agent(question: str) -> str:
    """Electrical, Electronics & Control PhD agent."""
    return _run(_ELEC_SYS, [elec_three_phase_power, elec_pid_tuning, elec_rc_filter], question)


# ─────────────────────────────────────────────────────────────────────────────
# 5. COMPUTER SCIENCE, SOFTWARE & AI
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def cs_complexity_analysis(
    n_operations: list,
    n_values: list,
) -> dict:
    """Estimate algorithm complexity class by fitting growth curves.

    Args:
        n_operations: List of measured operation counts for each input size.
        n_values: List of input sizes N corresponding to n_operations.
    """
    if len(n_values) < 2 or len(n_operations) != len(n_values):
        return {"error": "Need at least 2 paired (n, ops) measurements"}

    ratios = []
    for i in range(1, len(n_values)):
        if n_operations[i - 1] > 0 and n_values[i - 1] > 0:
            op_ratio = n_operations[i] / n_operations[i - 1]
            n_ratio = n_values[i] / n_values[i - 1]
            log_ratio = math.log(op_ratio) / math.log(n_ratio) if n_ratio > 1 else 1
            ratios.append(log_ratio)

    avg_exp = sum(ratios) / len(ratios) if ratios else 1

    if avg_exp < 0.8:
        complexity = "O(log n)"
    elif avg_exp < 1.2:
        complexity = "O(n)"
    elif avg_exp < 1.7:
        complexity = "O(n log n)"
    elif avg_exp < 2.5:
        complexity = "O(n²)"
    elif avg_exp < 3.5:
        complexity = "O(n³)"
    else:
        complexity = "O(n^k), k>3 or exponential"

    return {
        "estimated_complexity": complexity,
        "empirical_exponent": round(avg_exp, 3),
        "n_samples": len(n_values),
        "max_n": max(n_values),
        "max_ops": max(n_operations),
    }


@beta_tool
def cs_ml_metrics(
    true_positives: int,
    true_negatives: int,
    false_positives: int,
    false_negatives: int,
) -> dict:
    """Compute classification model performance metrics.

    Args:
        true_positives: Number of correct positive predictions (TP).
        true_negatives: Number of correct negative predictions (TN).
        false_positives: Number of incorrect positive predictions (FP).
        false_negatives: Number of incorrect negative predictions (FN).
    """
    total = true_positives + true_negatives + false_positives + false_negatives
    accuracy = (true_positives + true_negatives) / total if total > 0 else 0
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    specificity = true_negatives / (true_negatives + false_positives) if (true_negatives + false_positives) > 0 else 0
    mcc_num = true_positives * true_negatives - false_positives * false_negatives
    mcc_den = math.sqrt((true_positives + false_positives) * (true_positives + false_negatives) *
                        (true_negatives + false_positives) * (true_negatives + false_negatives))
    mcc = mcc_num / mcc_den if mcc_den > 0 else 0
    return {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall_sensitivity": round(recall, 4),
        "specificity": round(specificity, 4),
        "F1_score": round(f1, 4),
        "Matthews_CC": round(mcc, 4),
        "total_samples": total,
    }


@beta_tool
def cs_rsa_key_strength(
    key_bits: int,
) -> dict:
    """Evaluate RSA/asymmetric key security strength and NIST recommendations.

    Args:
        key_bits: Key size in bits (e.g. 1024, 2048, 3072, 4096).
    """
    nist_levels = {
        512: {"bits_symmetric_equiv": 56, "status": "BROKEN — do not use", "nist_allowed_until": "N/A"},
        1024: {"bits_symmetric_equiv": 80, "status": "DEPRECATED", "nist_allowed_until": "2013"},
        2048: {"bits_symmetric_equiv": 112, "status": "ACCEPTABLE (minimum)", "nist_allowed_until": "2030"},
        3072: {"bits_symmetric_equiv": 128, "status": "RECOMMENDED", "nist_allowed_until": "2030+"},
        4096: {"bits_symmetric_equiv": 140, "status": "STRONG", "nist_allowed_until": "2030+"},
        7680: {"bits_symmetric_equiv": 192, "status": "VERY STRONG (overkill for most)", "nist_allowed_until": "2030+"},
        15360: {"bits_symmetric_equiv": 256, "status": "MAXIMUM (AES-256 equivalent)", "nist_allowed_until": "2030+"},
    }
    closest = min(nist_levels.keys(), key=lambda k: abs(k - key_bits))
    level = nist_levels[closest]
    return {
        "key_bits": key_bits,
        "symmetric_equivalent_bits": level["bits_symmetric_equiv"],
        "security_status": level["status"],
        "nist_sp800_57_allowed_until": level["nist_allowed_until"],
        "recommended_minimum_2024": "RSA-2048 or ECDSA-256",
        "post_quantum_note": "RSA broken by Shor's algorithm on quantum computers — consider CRYSTALS-Kyber/Dilithium for PQC",
    }


_CS_SYS = """You are Dr. Valentina Cruz, PhD in Computer Science (AI & Systems Security) \
from Stanford, 17 years of experience. Expert in: algorithm design and complexity theory, \
machine learning (deep learning, transformers, RL), distributed systems, cybersecurity \
(cryptography, penetration testing, OWASP), cloud architecture (AWS/GCP/Azure), \
compiler design, formal verification, and quantum computing. \
Apply rigorous mathematical proofs, Big-O analysis, information theory, and security threat modeling. \
Reference IEEE/ACM standards, NIST guidelines, CVE databases. \
Languages: English and Spanish."""


def computer_agent(question: str) -> str:
    """Computer Science, Software & AI PhD agent."""
    return _run(_CS_SYS, [cs_complexity_analysis, cs_ml_metrics, cs_rsa_key_strength], question)


# ─────────────────────────────────────────────────────────────────────────────
# 6. CHEMICAL & MATERIALS
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def chem_arrhenius(
    activation_energy_kj_mol: float,
    temperature_1_k: float,
    rate_constant_1: float,
    temperature_2_k: float,
) -> dict:
    """Predict reaction rate constant at a new temperature using Arrhenius equation.

    Args:
        activation_energy_kj_mol: Activation energy Ea in kJ/mol.
        temperature_1_k: Reference temperature T1 in Kelvin.
        rate_constant_1: Reaction rate constant k1 at T1 (any consistent units).
        temperature_2_k: Target temperature T2 in Kelvin.
    """
    R = 8.314e-3  # kJ/(mol·K)
    Ea = activation_energy_kj_mol
    ln_ratio = (Ea / R) * (1 / temperature_1_k - 1 / temperature_2_k)
    k2 = rate_constant_1 * math.exp(ln_ratio)
    Q10 = k2 / rate_constant_1 if temperature_2_k == temperature_1_k + 10 else None
    return {
        "k_at_T2": round(k2, 8),
        "k_at_T1": rate_constant_1,
        "T2_K": temperature_2_k,
        "T2_C": round(temperature_2_k - 273.15, 2),
        "rate_ratio_k2_k1": round(k2 / rate_constant_1, 4),
        "activation_energy_kj_mol": Ea,
        "Q10_temperature_coefficient": round(Q10, 4) if Q10 else "N/A (ΔT≠10K)",
    }


@beta_tool
def chem_material_fatigue(
    ultimate_tensile_strength_mpa: float,
    stress_amplitude_mpa: float,
    mean_stress_mpa: float,
    cycles_target: float = 1e6,
) -> dict:
    """Assess fatigue life using Goodman diagram and S-N curve (Basquin's law).

    Args:
        ultimate_tensile_strength_mpa: UTS (Su) in MPa.
        stress_amplitude_mpa: Alternating stress amplitude σa in MPa.
        mean_stress_mpa: Mean stress σm in MPa.
        cycles_target: Target number of cycles N (default 1e6 = HCF).
    """
    Su = ultimate_tensile_strength_mpa
    Se = 0.504 * Su  # Endurance limit estimate (Shigley, steel)
    # Goodman criterion: σa/Se + σm/Su ≤ 1
    goodman_ratio = stress_amplitude_mpa / Se + mean_stress_mpa / Su
    # Corrected amplitude to equivalent fully reversed
    sa_eq = stress_amplitude_mpa / (1 - mean_stress_mpa / Su) if mean_stress_mpa < Su else float("inf")
    # Basquin: N = (σa_eq / C)^(1/b), approximate b=-0.085, C=0.9*Su
    b = -0.085
    C = 0.9 * Su
    N_est = (C / sa_eq) ** (1 / abs(b)) if sa_eq > 0 and sa_eq < C else float("inf")

    return {
        "endurance_limit_Se_mpa": round(Se, 2),
        "Goodman_damage_ratio": round(goodman_ratio, 4),
        "Goodman_status": "SAFE" if goodman_ratio <= 1 else "FAILURE predicted",
        "equivalent_reversed_stress_mpa": round(sa_eq, 2),
        "estimated_fatigue_life_cycles": f"{N_est:.2e}",
        "target_life_cycles": f"{cycles_target:.0e}",
        "meets_target": N_est >= cycles_target,
    }


@beta_tool
def chem_distillation_mccabe(
    feed_mole_fraction: float,
    distillate_mole_fraction: float,
    bottoms_mole_fraction: float,
    relative_volatility: float,
    reflux_ratio: float,
) -> dict:
    """Estimate theoretical stages for binary distillation via McCabe-Thiele method.

    Args:
        feed_mole_fraction: Feed composition xF (mole fraction of light component, 0–1).
        distillate_mole_fraction: Distillate composition xD (0–1).
        bottoms_mole_fraction: Bottoms composition xB (0–1).
        relative_volatility: Relative volatility α of light to heavy component.
        reflux_ratio: Operating reflux ratio L/D (must be > Rmin).
    """
    xF, xD, xB = feed_mole_fraction, distillate_mole_fraction, bottoms_mole_fraction
    alpha = relative_volatility
    R = reflux_ratio

    # Minimum reflux (Fenske-Underwood approximation)
    yF = alpha * xF / (1 + (alpha - 1) * xF)
    R_min = (xD - yF) / (yF - xF) if (yF - xF) > 0 else float("inf")

    # Fenske minimum stages at total reflux
    N_min = math.log((xD / (1 - xD)) * ((1 - xB) / xB)) / math.log(alpha) if alpha > 1 else float("inf")

    # Gilliland correlation: (N - N_min)/(N + 1) = f(X), X = (R - R_min)/(R + 1)
    X = (R - R_min) / (R + 1) if (R + 1) > 0 else 0
    Y = 1 - math.exp((1 + 54.4 * X) / (11 + 117.2 * X) * (X - 1) / X**0.5) if X > 0 else 0
    N_actual = (Y + N_min) / (1 - Y) if (1 - Y) > 0 else float("inf")

    return {
        "minimum_stages_Nmin": round(N_min, 2),
        "minimum_reflux_Rmin": round(R_min, 3),
        "operating_reflux_ratio": R,
        "Rmin_ratio": round(R / R_min, 3) if R_min > 0 else "N/A",
        "theoretical_stages": round(N_actual, 1),
        "Gilliland_Y_factor": round(Y, 4),
        "separation_feasible": xD > xF > xB and alpha > 1,
    }


_CHEM_SYS = """You are Dr. Laura Jiménez, PhD in Chemical Engineering (Process & Materials) \
from UC Berkeley, 21 years of experience. Expert in: reaction engineering (kinetics, reactor \
design — CSTR/PFR/PBR), thermodynamics (phase equilibria, equations of state), separation \
processes (distillation, absorption, extraction), materials science (polymers, composites, \
nanomaterials), process simulation (Aspen Plus/HYSYS), and process safety (HAZOP, LOPA). \
Apply AIChE guidelines, ASTM standards, and rigorous first-principles analysis. \
Cite peer-reviewed literature and industrial standards. Languages: English and Spanish."""


def chemical_agent(question: str) -> str:
    """Chemical & Materials Engineering PhD agent."""
    return _run(_CHEM_SYS, [chem_arrhenius, chem_material_fatigue, chem_distillation_mccabe], question)


# ─────────────────────────────────────────────────────────────────────────────
# 7. NATURAL RESOURCES & AGRO
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def nat_cut_off_grade(
    metal_price_usd_t: float,
    processing_cost_usd_t: float,
    mining_cost_usd_t: float,
    metallurgical_recovery_pct: float,
    selling_cost_pct: float = 5.0,
) -> dict:
    """Calculate mining cut-off grade using Lane's break-even methodology.

    Args:
        metal_price_usd_t: Metal selling price in USD per tonne of metal.
        processing_cost_usd_t: Processing (milling) cost in USD per tonne of ore.
        mining_cost_usd_t: Mining cost in USD per tonne of ore.
        metallurgical_recovery_pct: Metal recovery in the processing plant (%).
        selling_cost_pct: Selling and refining cost as % of metal price.
    """
    p = metal_price_usd_t
    Cm = mining_cost_usd_t
    Cp = processing_cost_usd_t
    r = metallurgical_recovery_pct / 100
    s = selling_cost_pct / 100

    net_price = p * (1 - s)
    cog_pct = (Cm + Cp) / (net_price * r) * 100  # % metal in ore

    return {
        "break_even_cut_off_grade_pct": round(cog_pct, 4),
        "break_even_cog_g_t_if_gold": round(cog_pct * 10000, 2),
        "net_smelter_return_usd_t_metal": round(net_price, 2),
        "total_operating_cost_usd_t_ore": round(Cm + Cp, 2),
        "effective_recovery_pct": metallurgical_recovery_pct,
        "note": "Break-even COG; add opportunity cost for profit-maximizing COG",
    }


@beta_tool
def nat_penman_monteith_eto(
    temp_max_c: float,
    temp_min_c: float,
    relative_humidity_pct: float,
    wind_speed_m_s: float,
    solar_radiation_mj_m2_day: float,
    elevation_m: float = 0.0,
) -> dict:
    """Estimate reference evapotranspiration ETo using FAO-56 Penman-Monteith.

    Args:
        temp_max_c: Maximum daily temperature in °C.
        temp_min_c: Minimum daily temperature in °C.
        relative_humidity_pct: Mean relative humidity in %.
        wind_speed_m_s: Mean wind speed at 2 m height in m/s.
        solar_radiation_mj_m2_day: Incoming solar radiation in MJ/(m²·day).
        elevation_m: Station elevation above sea level in meters.
    """
    T = (temp_max_c + temp_min_c) / 2
    P = 101.3 * ((293 - 0.0065 * elevation_m) / 293) ** 5.26  # kPa
    gamma = 0.000665 * P  # psychrometric constant
    Delta = 4098 * (0.6108 * math.exp(17.27 * T / (T + 237.3))) / (T + 237.3) ** 2
    es = (0.6108 * math.exp(17.27 * temp_max_c / (temp_max_c + 237.3)) +
          0.6108 * math.exp(17.27 * temp_min_c / (temp_min_c + 237.3))) / 2
    ea = es * relative_humidity_pct / 100
    Rn = 0.77 * solar_radiation_mj_m2_day  # approximate net radiation
    G = 0  # soil heat flux (daily = 0)

    ETo = (0.408 * Delta * (Rn - G) + gamma * (900 / (T + 273)) * wind_speed_m_s * (es - ea)) / \
          (Delta + gamma * (1 + 0.34 * wind_speed_m_s))
    return {
        "ETo_mm_day": round(ETo, 3),
        "vapor_pressure_deficit_kpa": round(es - ea, 4),
        "psychrometric_constant_kpa_C": round(gamma, 5),
        "slope_vapor_pressure_kpa_C": round(Delta, 5),
        "mean_temp_c": round(T, 2),
        "method": "FAO-56 Penman-Monteith",
    }


@beta_tool
def nat_forest_basal_area(
    dbh_cm_list: list,
    plot_area_ha: float = 0.1,
) -> dict:
    """Compute stand basal area, mean DBH, and stocking density from forest plot data.

    Args:
        dbh_cm_list: List of individual tree diameters at breast height (DBH) in cm.
        plot_area_ha: Sample plot area in hectares.
    """
    if not dbh_cm_list:
        return {"error": "No tree data provided"}
    n = len(dbh_cm_list)
    basal_areas = [math.pi * (d / 200) ** 2 for d in dbh_cm_list]  # m² per tree
    G_plot = sum(basal_areas)
    G_ha = G_plot / plot_area_ha
    mean_dbh = sum(dbh_cm_list) / n
    qmd = math.sqrt(sum(d**2 for d in dbh_cm_list) / n)  # quadratic mean diameter
    stems_ha = n / plot_area_ha
    return {
        "stems_per_ha": round(stems_ha, 0),
        "basal_area_m2_ha": round(G_ha, 3),
        "mean_DBH_cm": round(mean_dbh, 2),
        "quadratic_mean_diameter_cm": round(qmd, 2),
        "max_DBH_cm": max(dbh_cm_list),
        "min_DBH_cm": min(dbh_cm_list),
        "n_trees_in_plot": n,
        "plot_area_ha": plot_area_ha,
    }


_NAT_SYS = """You are Dr. Carlos Herrera, PhD in Natural Resources & Agricultural Engineering \
from Wageningen University, 20 years of experience. Expert in: mining engineering (geostatistics, \
pit optimization, mine planning), precision agriculture (remote sensing, GIS, soil science), \
irrigation engineering (drip, sprinkler, FAO standards), forest mensuration and management, \
aquaculture and fisheries, and environmental impact assessment. \
Apply FAO guidelines, SME/JORC codes, and rigorous geostatistical methods (kriging, variography). \
Integrate sustainability and ESG principles. Languages: English and Spanish."""


def natural_resources_agent(question: str) -> str:
    """Natural Resources & Agro Engineering PhD agent."""
    return _run(_NAT_SYS, [nat_cut_off_grade, nat_penman_monteith_eto, nat_forest_basal_area], question)


# ─────────────────────────────────────────────────────────────────────────────
# 8. MECHATRONICS, ROBOTICS & AUTONOMOUS SYSTEMS
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def mecha_forward_kinematics_2dof(
    l1_m: float,
    l2_m: float,
    theta1_deg: float,
    theta2_deg: float,
) -> dict:
    """Compute end-effector position for 2-DOF planar robot arm (forward kinematics).

    Args:
        l1_m: Length of link 1 in meters.
        l2_m: Length of link 2 in meters.
        theta1_deg: Joint 1 angle in degrees (from horizontal).
        theta2_deg: Joint 2 angle in degrees (relative to link 1).
    """
    t1 = math.radians(theta1_deg)
    t2 = math.radians(theta2_deg)
    x = l1_m * math.cos(t1) + l2_m * math.cos(t1 + t2)
    y = l1_m * math.sin(t1) + l2_m * math.sin(t1 + t2)
    # Jacobian determinant (manipulability)
    J_det = l1_m * l2_m * math.sin(t2)
    reach = l1_m + l2_m
    return {
        "end_effector_x_m": round(x, 6),
        "end_effector_y_m": round(y, 6),
        "distance_from_base_m": round(math.sqrt(x**2 + y**2), 6),
        "joint_angles_deg": [theta1_deg, theta2_deg],
        "link_lengths_m": [l1_m, l2_m],
        "max_reach_m": reach,
        "Jacobian_determinant": round(J_det, 6),
        "near_singularity": abs(J_det) < 0.01 * reach,
    }


@beta_tool
def mecha_dc_motor_sizing(
    torque_nm: float,
    speed_rpm: float,
    efficiency_pct: float = 85.0,
    duty_cycle_pct: float = 100.0,
) -> dict:
    """Size a DC motor for a given load torque and speed requirement.

    Args:
        torque_nm: Required shaft torque at the load in N·m.
        speed_rpm: Required shaft speed in RPM.
        efficiency_pct: Motor efficiency in % (default 85%).
        duty_cycle_pct: Duty cycle in % (continuous=100, intermittent<100).
    """
    omega = speed_rpm * 2 * math.pi / 60  # rad/s
    P_mech = torque_nm * omega  # W
    P_input = P_mech / (efficiency_pct / 100)
    # Intermittent duty derating
    P_rated = P_input / math.sqrt(duty_cycle_pct / 100)
    return {
        "mechanical_power_w": round(P_mech, 3),
        "mechanical_power_kw": round(P_mech / 1000, 4),
        "required_input_power_w": round(P_input, 3),
        "recommended_rated_power_w": round(P_rated, 3),
        "angular_velocity_rad_s": round(omega, 4),
        "torque_nm": torque_nm,
        "speed_rpm": speed_rpm,
        "selection_margin_pct": round((P_rated - P_mech) / P_mech * 100, 2),
    }


@beta_tool
def mecha_sensor_fusion_kalman(
    gps_position_m: float,
    gps_noise_std_m: float,
    imu_position_m: float,
    imu_noise_std_m: float,
    prior_position_m: float,
    prior_uncertainty_m: float,
) -> dict:
    """Apply 1D scalar Kalman filter to fuse GPS and IMU position estimates.

    Args:
        gps_position_m: GPS measured position in meters.
        gps_noise_std_m: GPS measurement noise standard deviation in meters.
        imu_position_m: IMU-derived position estimate in meters.
        imu_noise_std_m: IMU prediction noise standard deviation in meters.
        prior_position_m: Prior estimated position (from last cycle) in meters.
        prior_uncertainty_m: Prior uncertainty (standard deviation) in meters.
    """
    # Prediction step (using IMU)
    x_pred = imu_position_m
    P_pred = prior_uncertainty_m**2 + imu_noise_std_m**2

    # Update step (using GPS)
    R = gps_noise_std_m**2
    K = P_pred / (P_pred + R)  # Kalman gain
    x_est = x_pred + K * (gps_position_m - x_pred)
    P_est = (1 - K) * P_pred

    return {
        "fused_position_m": round(x_est, 4),
        "fused_uncertainty_std_m": round(math.sqrt(P_est), 4),
        "Kalman_gain": round(K, 4),
        "GPS_weight_pct": round(K * 100, 2),
        "IMU_weight_pct": round((1 - K) * 100, 2),
        "improvement_over_GPS_alone_pct": round((1 - math.sqrt(P_est) / gps_noise_std_m) * 100, 2),
    }


_MECHA_SYS = """You are Dr. Alejandro Torres, PhD in Mechatronics & Robotics from TU Delft, \
18 years of experience. Expert in: robot kinematics and dynamics (DH parameters, Jacobians), \
control systems (state feedback, optimal control, model predictive control), autonomous systems \
(SLAM, path planning, computer vision), embedded systems (FPGA, ARM, RTOS), drone systems \
(multirotor dynamics, autopilot), sensor fusion (Kalman filters, particle filters), and \
Industry 4.0 (digital twin, cyber-physical systems). Apply ROS/ROS2, MATLAB/Simulink, \
and rigorous control theory. Languages: English and Spanish."""


def mechatronics_agent(question: str) -> str:
    """Mechatronics, Robotics & Autonomous Systems PhD agent."""
    return _run(_MECHA_SYS, [mecha_forward_kinematics_2dof, mecha_dc_motor_sizing, mecha_sensor_fusion_kalman], question)


# ─────────────────────────────────────────────────────────────────────────────
# 9. BIOMEDICAL & BIOENGINEERING
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def bio_drug_dosage(
    body_weight_kg: float,
    dose_mg_per_kg: float,
    bioavailability_pct: float,
    volume_distribution_l_kg: float,
    half_life_h: float,
    num_doses: int = 1,
) -> dict:
    """Calculate pharmacokinetic parameters for drug dosing.

    Args:
        body_weight_kg: Patient body weight in kg.
        dose_mg_per_kg: Prescribed dose in mg/kg.
        bioavailability_pct: Oral bioavailability F in %.
        volume_distribution_l_kg: Volume of distribution Vd in L/kg.
        half_life_h: Elimination half-life t½ in hours.
        num_doses: Number of doses for accumulation analysis.
    """
    dose_total = dose_mg_per_kg * body_weight_kg
    F = bioavailability_pct / 100
    Vd = volume_distribution_l_kg * body_weight_kg  # L
    ke = math.log(2) / half_life_h  # elimination rate constant (1/h)
    # Peak plasma concentration (single IV equivalent)
    Cmax = (dose_total * F) / Vd
    # Accumulation factor at steady state (assuming dosing interval = half_life)
    R_acc = 1 / (1 - 0.5)  # = 2 for interval = t½
    Css_max = Cmax * R_acc if num_doses > 3 else Cmax
    tau_to_ss = 5 * half_life_h  # 97% steady state

    return {
        "total_dose_mg": round(dose_total, 2),
        "Vd_litres": round(Vd, 2),
        "elimination_rate_ke_per_h": round(ke, 5),
        "Cmax_single_dose_mg_L": round(Cmax, 4),
        "Cmax_steady_state_mg_L": round(Css_max, 4) if num_doses > 3 else "N/A",
        "time_to_steady_state_h": round(tau_to_ss, 1),
        "half_life_h": half_life_h,
    }


@beta_tool
def bio_ecg_hr_analysis(
    rr_intervals_ms: list,
) -> dict:
    """Analyze heart rate variability from RR intervals (ECG time-domain HRV).

    Args:
        rr_intervals_ms: List of consecutive RR intervals in milliseconds.
    """
    if len(rr_intervals_ms) < 3:
        return {"error": "Minimum 3 RR intervals required"}
    n = len(rr_intervals_ms)
    mean_rr = sum(rr_intervals_ms) / n
    hr = 60000 / mean_rr
    # RMSSD: Root Mean Square of Successive Differences
    diffs = [abs(rr_intervals_ms[i] - rr_intervals_ms[i - 1]) for i in range(1, n)]
    rmssd = math.sqrt(sum(d**2 for d in diffs) / len(diffs))
    # SDNN: Standard deviation of all NN intervals
    variance = sum((r - mean_rr)**2 for r in rr_intervals_ms) / n
    sdnn = math.sqrt(variance)
    # pNN50
    nn50 = sum(1 for d in diffs if d > 50)
    pnn50 = nn50 / len(diffs) * 100
    return {
        "mean_HR_bpm": round(hr, 2),
        "mean_RR_ms": round(mean_rr, 2),
        "SDNN_ms": round(sdnn, 3),
        "RMSSD_ms": round(rmssd, 3),
        "pNN50_pct": round(pnn50, 2),
        "n_intervals": n,
        "min_RR_ms": min(rr_intervals_ms),
        "max_RR_ms": max(rr_intervals_ms),
        "autonomic_note": "RMSSD>20ms and pNN50>3% suggest healthy parasympathetic tone",
    }


@beta_tool
def bio_implant_stress(
    force_n: float,
    cross_section_mm2: float,
    elastic_modulus_gpa: float,
    yield_strength_mpa: float,
    length_mm: float,
    bending_moment_n_mm: float = 0.0,
) -> dict:
    """Assess mechanical stress on a bone implant (axial + bending per ISO 7206).

    Args:
        force_n: Axial compressive/tensile force in Newtons.
        cross_section_mm2: Cross-sectional area of the implant in mm².
        elastic_modulus_gpa: Implant material elastic modulus in GPa (Ti6Al4V≈114, CoCr≈230).
        yield_strength_mpa: Material yield strength in MPa (Ti6Al4V≈880, CoCr≈520).
        length_mm: Implant length in mm (for deflection).
        bending_moment_n_mm: Applied bending moment in N·mm (0 if pure axial).
    """
    sigma_axial = force_n / cross_section_mm2  # MPa
    # Bending stress: assume circular cross section
    r = math.sqrt(cross_section_mm2 / math.pi)  # radius mm
    I = math.pi * r**4 / 4  # mm⁴
    sigma_bending = (bending_moment_n_mm * r) / I if I > 0 else 0
    sigma_total = sigma_axial + sigma_bending
    FOS = yield_strength_mpa / sigma_total if sigma_total > 0 else float("inf")
    # Axial deflection
    E = elastic_modulus_gpa * 1000  # MPa
    delta = (force_n * length_mm) / (E * cross_section_mm2) if (E * cross_section_mm2) > 0 else 0

    return {
        "axial_stress_mpa": round(sigma_axial, 3),
        "bending_stress_mpa": round(sigma_bending, 3),
        "total_stress_mpa": round(sigma_total, 3),
        "factor_of_safety": round(FOS, 3),
        "axial_deflection_mm": round(delta, 6),
        "safety_status": "SAFE (FOS≥2)" if FOS >= 2 else "MARGINAL (1≤FOS<2)" if FOS >= 1 else "FAILURE RISK",
        "material_yield_mpa": yield_strength_mpa,
    }


_BIO_SYS = """You are Dr. Mariana Rios, PhD in Biomedical Engineering from Johns Hopkins, \
16 years of experience. Expert in: medical device design (ISO 13485, FDA 510(k)), \
biomechanics (bone, soft tissue, implants), biosignal processing (ECG, EEG, EMG, fMRI), \
pharmacokinetics and drug delivery systems, tissue engineering, medical imaging (MRI, CT, \
ultrasound physics), bioinformatics, and clinical engineering. \
Apply FDA guidelines, ISO 14971 risk management, and IEEE EMBS standards. \
Integrate clinical evidence with engineering rigor. Languages: English and Spanish."""


def biomedical_agent(question: str) -> str:
    """Biomedical & Bioengineering PhD agent."""
    return _run(_BIO_SYS, [bio_drug_dosage, bio_ecg_hr_analysis, bio_implant_stress], question)


# ─────────────────────────────────────────────────────────────────────────────
# 10. EMERGING & DEEP-TECH
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def emrg_qubit_gate(
    gate_name: str,
    state_alpha: float,
    state_beta: float,
) -> dict:
    """Apply a single-qubit gate and return the resulting state probabilities.

    Args:
        gate_name: Gate to apply: 'H' (Hadamard), 'X' (Pauli-X/NOT), 'Z' (Pauli-Z), 'S', 'T'.
        state_alpha: Amplitude of |0⟩ state (real part, will be normalized).
        state_beta: Amplitude of |1⟩ state (real part, will be normalized).
    """
    norm = math.sqrt(state_alpha**2 + state_beta**2)
    a, b = state_alpha / norm, state_beta / norm

    gates = {
        "X": lambda a, b: (b, a),
        "Z": lambda a, b: (a, -b),
        "H": lambda a, b: ((a + b) / math.sqrt(2), (a - b) / math.sqrt(2)),
        "S": lambda a, b: (a, b),  # phase gate (simplified to real)
        "T": lambda a, b: (a, b),  # T gate (simplified to real)
    }
    gate_fn = gates.get(gate_name.upper(), lambda a, b: (a, b))
    a_out, b_out = gate_fn(a, b)

    p0 = round(a_out**2, 6)
    p1 = round(b_out**2, 6)

    return {
        "gate_applied": gate_name.upper(),
        "input_state": {"alpha_0": round(a, 6), "beta_1": round(b, 6)},
        "output_state": {"alpha_0": round(a_out, 6), "beta_1": round(b_out, 6)},
        "probability_measure_0": p0,
        "probability_measure_1": p1,
        "probabilities_sum_to_1": round(p0 + p1, 6) == 1.0,
        "superposition": abs(p0 - p1) < 0.05,
    }


@beta_tool
def emrg_blockchain_hash_difficulty(
    target_leading_zeros: int,
    hash_rate_th_s: float,
) -> dict:
    """Estimate Bitcoin-style PoW mining difficulty and expected time to find a block.

    Args:
        target_leading_zeros: Number of leading zero bits required in hash (difficulty proxy).
        hash_rate_th_s: Miner hash rate in terahashes per second (TH/s).
    """
    difficulty = 2 ** target_leading_zeros
    hash_rate_h_s = hash_rate_th_s * 1e12
    expected_hashes = difficulty
    expected_time_s = expected_hashes / hash_rate_h_s
    expected_time_min = expected_time_s / 60
    energy_j = expected_time_s * 30  # ~30 W per TH/s approx for ASIC

    return {
        "difficulty": f"2^{target_leading_zeros} = {difficulty:.2e}",
        "expected_hashes_to_solve": f"{expected_hashes:.2e}",
        "hash_rate_th_s": hash_rate_th_s,
        "expected_time_seconds": round(expected_time_s, 2),
        "expected_time_minutes": round(expected_time_min, 4),
        "approx_energy_joules": round(energy_j, 2),
        "network_note": "Bitcoin adjusts difficulty every 2016 blocks (~2 weeks target)",
    }


@beta_tool
def emrg_nanoparticle_surface_area(
    diameter_nm: float,
    density_g_cm3: float,
    shape: str = "sphere",
) -> dict:
    """Calculate nanoparticle surface area, volume, and surface-to-volume ratio.

    Args:
        diameter_nm: Particle diameter (or side length for cube) in nanometers.
        density_g_cm3: Material density in g/cm³.
        shape: Particle shape: 'sphere' or 'cube'.
    """
    d_m = diameter_nm * 1e-9
    if shape == "sphere":
        V = (4 / 3) * math.pi * (d_m / 2) ** 3
        A = 4 * math.pi * (d_m / 2) ** 2
    else:  # cube
        V = d_m ** 3
        A = 6 * d_m ** 2

    sv_ratio = A / V  # m⁻¹
    mass_g = V * density_g_cm3 * 1e6  # 1 m³ = 1e6 cm³
    ssa = A / (mass_g * 1e-3)  # m²/g — specific surface area for 1 particle

    # Compare to bulk (1 cm sphere)
    bulk_sv = (3 / (0.005)) if shape == "sphere" else (6 / 0.01)  # ~600 m⁻¹

    return {
        "diameter_nm": diameter_nm,
        "surface_area_m2": f"{A:.4e}",
        "volume_m3": f"{V:.4e}",
        "surface_to_volume_ratio_per_m": f"{sv_ratio:.4e}",
        "surface_to_volume_ratio_per_nm": f"{sv_ratio * 1e-9:.4f} nm⁻¹",
        "enhancement_over_1cm_bulk": f"{sv_ratio / bulk_sv:.0f}×",
        "shape": shape,
    }


_EMRG_SYS = """You are Dr. Pablo Navarro, PhD in Quantum Engineering & Nanotechnology from \
Caltech and MIT, 14 years of experience. Expert in: quantum computing (gate-based, \
Grover/Shor algorithms, error correction, VQE), nanotechnology (synthesis, characterization, \
applications — drug delivery, photovoltaics, sensors), blockchain and distributed systems \
(consensus protocols, DeFi, smart contracts, ZKP), extended reality (XR/AR/VR, spatial computing), \
and smart city infrastructure (IoT, edge computing, digital twins). \
Apply cutting-edge research, cite arxiv/Nature/Science, explain quantum advantage with rigor. \
Languages: English and Spanish."""


def emerging_tech_agent(question: str) -> str:
    """Emerging & Deep-Tech Engineering PhD agent."""
    return _run(_EMRG_SYS, [emrg_qubit_gate, emrg_blockchain_hash_difficulty, emrg_nanoparticle_surface_area], question)


# ─────────────────────────────────────────────────────────────────────────────
# 11. ENGINEERING ECONOMICS & MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

@beta_tool
def mgmt_npv_irr(
    initial_investment: float,
    cash_flows: list,
    discount_rate_pct: float,
) -> dict:
    """Calculate NPV, IRR, payback period, and profitability index for a project.

    Args:
        initial_investment: Initial capital outlay (positive number, becomes negative CF at t=0).
        cash_flows: List of annual cash flows in years 1..N (positive = inflow).
        discount_rate_pct: Required rate of return / WACC in %.
    """
    r = discount_rate_pct / 100
    all_cfs = [-initial_investment] + cash_flows
    npv = sum(cf / (1 + r) ** t for t, cf in enumerate(all_cfs))
    pi = (npv + initial_investment) / initial_investment if initial_investment > 0 else 0

    # IRR via bisection
    def npv_at(rate):
        return sum(cf / (1 + rate) ** t for t, cf in enumerate(all_cfs))

    lo, hi = -0.99, 10.0
    irr = None
    for _ in range(200):
        mid = (lo + hi) / 2
        if abs(npv_at(mid)) < 1e-4:
            irr = mid
            break
        if npv_at(lo) * npv_at(mid) < 0:
            hi = mid
        else:
            lo = mid
    irr = mid if irr is None else irr

    # Payback period
    cumulative = 0
    payback = None
    for yr, cf in enumerate(cash_flows, start=1):
        cumulative += cf
        if cumulative >= initial_investment:
            payback = yr
            break

    return {
        "NPV": round(npv, 2),
        "IRR_pct": round(irr * 100, 3) if irr else "No convergence",
        "profitability_index": round(pi, 4),
        "payback_period_years": payback if payback else f">{len(cash_flows)} years",
        "decision": "ACCEPT" if npv > 0 else "REJECT",
        "discount_rate_pct": discount_rate_pct,
    }


@beta_tool
def mgmt_critical_path(
    activities: list,
    durations: list,
    dependencies: list,
) -> dict:
    """Compute critical path, project duration, and float for each activity.

    Args:
        activities: List of activity names (strings), e.g. ['A','B','C','D'].
        durations: List of durations (integers/floats) matching activities list.
        dependencies: List of (predecessor, successor) tuples, e.g. [['A','B'],['B','C']].
    """
    if len(activities) != len(durations):
        return {"error": "activities and durations must have equal length"}

    dur = dict(zip(activities, durations))
    preds: dict = {a: [] for a in activities}
    succs: dict = {a: [] for a in activities}
    for dep in dependencies:
        p, s = dep[0], dep[1]
        if p in preds and s in succs:
            preds[s].append(p)
            succs[p].append(s)

    # Forward pass — Early Start (ES) and Early Finish (EF)
    ES: dict = {}
    EF: dict = {}
    order = []
    visited: set = set()

    def forward(a):
        if a in visited:
            return
        for p in preds[a]:
            forward(p)
        ES[a] = max((EF[p] for p in preds[a]), default=0)
        EF[a] = ES[a] + dur[a]
        order.append(a)
        visited.add(a)

    for a in activities:
        forward(a)

    project_duration = max(EF.values())

    # Backward pass — Late Start (LS) and Late Finish (LF)
    LF: dict = {a: project_duration for a in activities}
    LS: dict = {}
    for a in reversed(order):
        if succs[a]:
            LF[a] = min(LS.get(s, ES[s]) for s in succs[a])
        LS[a] = LF[a] - dur[a]

    # Total Float and Critical Path
    TF = {a: round(LS[a] - ES[a], 4) for a in activities}
    critical = [a for a in activities if TF[a] == 0]

    return {
        "project_duration": project_duration,
        "critical_path": " → ".join(critical),
        "activity_schedule": {a: {"ES": ES[a], "EF": EF[a], "LS": round(LS[a], 4), "LF": round(LF[a], 4), "float": TF[a]} for a in activities},
        "n_activities": len(activities),
    }


@beta_tool
def mgmt_wacc(
    equity_market_value: float,
    debt_market_value: float,
    cost_of_equity_pct: float,
    pre_tax_cost_of_debt_pct: float,
    tax_rate_pct: float,
) -> dict:
    """Calculate Weighted Average Cost of Capital (WACC) per Modigliani-Miller.

    Args:
        equity_market_value: Market value of equity (E) in any currency units.
        debt_market_value: Market value of debt (D) in same currency units.
        cost_of_equity_pct: Cost of equity Ke in % (e.g. from CAPM).
        pre_tax_cost_of_debt_pct: Pre-tax cost of debt Kd in %.
        tax_rate_pct: Corporate marginal tax rate in %.
    """
    E = equity_market_value
    D = debt_market_value
    V = E + D
    Ke = cost_of_equity_pct / 100
    Kd = pre_tax_cost_of_debt_pct / 100
    T = tax_rate_pct / 100
    WACC = (E / V) * Ke + (D / V) * Kd * (1 - T)
    debt_tax_shield = D * Kd * T
    return {
        "WACC_pct": round(WACC * 100, 4),
        "equity_weight_pct": round(E / V * 100, 2),
        "debt_weight_pct": round(D / V * 100, 2),
        "after_tax_cost_of_debt_pct": round(Kd * (1 - T) * 100, 4),
        "debt_tax_shield": round(debt_tax_shield, 2),
        "leverage_ratio_D_V": round(D / V, 4),
        "formula": "WACC = (E/V)·Ke + (D/V)·Kd·(1-T)",
    }


_MGMT_SYS = """You are Dr. Isabela Ferreira, PhD in Engineering Management & Financial Engineering \
from Wharton/Penn Engineering, 17 years of experience. Expert in: project management (PMP, PMI, \
Agile/Scrum), financial engineering (derivatives, risk models, Monte Carlo simulation), \
engineering economics (NPV, IRR, real options analysis), technology strategy (R&D portfolio, \
innovation management), operations research, and systems engineering (INCOSE, MBSE). \
Apply PMI/PRINCE2 frameworks, IFRS/GAAP accounting, and rigorous quantitative analysis. \
Integrate technical and financial decision-making. Languages: English and Spanish."""


def management_agent(question: str) -> str:
    """Engineering Economics & Management PhD agent."""
    return _run(_MGMT_SYS, [mgmt_npv_irr, mgmt_critical_path, mgmt_wacc], question)


# ─────────────────────────────────────────────────────────────────────────────
# REGISTRY — all agents accessible by branch ID (1–11)
# ─────────────────────────────────────────────────────────────────────────────

AGENTS: dict[int, dict] = {
    1: {"name": "Civil & Built Environment",           "fn": civil_agent},
    2: {"name": "Industrial & Operations",             "fn": industrial_agent},
    3: {"name": "Mechanical, Energy & Thermal",        "fn": mechanical_agent},
    4: {"name": "Electrical, Electronics & Control",   "fn": electrical_agent},
    5: {"name": "Computer Science, Software & AI",     "fn": computer_agent},
    6: {"name": "Chemical & Materials",                "fn": chemical_agent},
    7: {"name": "Natural Resources & Agro",            "fn": natural_resources_agent},
    8: {"name": "Mechatronics, Robotics & Autonomous", "fn": mechatronics_agent},
    9: {"name": "Biomedical & Bioengineering",         "fn": biomedical_agent},
    10: {"name": "Emerging & Deep-Tech",               "fn": emerging_tech_agent},
    11: {"name": "Engineering Economics & Management", "fn": management_agent},
}


def ask_agent(branch_id: int, question: str) -> str:
    """Route a question to the appropriate PhD engineering agent.

    Args:
        branch_id: Engineering branch ID from 1 to 11.
        question: Technical question to ask the agent.

    Returns:
        Agent's response as a string.
    """
    if branch_id not in AGENTS:
        return f"Unknown branch ID {branch_id}. Valid IDs: 1–11."
    agent = AGENTS[branch_id]
    print(f"[Agent {branch_id}] {agent['name']}")
    return agent["fn"](question)
