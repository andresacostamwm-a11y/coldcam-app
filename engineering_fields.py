ENGINEERING_FIELDS = [
    {
        "id": 1,
        "name": "Civil y entorno construido",
        "specialties": [
            "Ingeniería Civil",
            "Estructural",
            "Geotécnica",
            "Hidráulica / Recursos Hídricos",
            "Transporte",
            "Construcción",
            "Caminos, Canales y Puertos",
            "Ambiental",
            "Sanitaria",
            "Urbanismo / Ingeniería Urbana",
        ],
        "doctorates": [
            "PhD in Civil Engineering",
            "PhD in Structural Engineering",
            "PhD in Geotechnical Engineering",
            "PhD in Transportation Engineering",
            "PhD in Environmental Engineering",
            "PhD in Water Resources Engineering",
        ],
    },
    {
        "id": 2,
        "name": "Industrial y operaciones",
        "specialties": [
            "Ingeniería Industrial",
            "Procesos",
            "Producción / Manufactura",
            "Logística / Supply Chain",
            "Calidad",
            "Operaciones",
            "Organización Industrial",
            "Seguridad Industrial",
        ],
        "doctorates": [
            "PhD in Industrial Engineering",
            "PhD in Operations Research",
            "PhD in Manufacturing Engineering",
            "PhD in Supply Chain Management",
        ],
    },
    {
        "id": 3,
        "name": "Mecánica, energía y sistemas térmicos",
        "specialties": [
            "Ingeniería Mecánica",
            "Térmica",
            "Energética",
            "Energías Renovables",
            "HVAC (climatización)",
            "Fluidos",
            "Automotriz",
            "Aeronáutica",
            "Naval",
            "Nuclear",
        ],
        "doctorates": [
            "PhD in Mechanical Engineering",
            "PhD in Energy Systems",
            "PhD in Thermal Sciences",
            "PhD in Aerospace Engineering",
            "PhD in Nuclear Engineering",
        ],
    },
    {
        "id": 4,
        "name": "Eléctrica, electrónica y control",
        "specialties": [
            "Ingeniería Eléctrica (potencia)",
            "Electrónica",
            "Telecomunicaciones",
            "Automatización",
            "Control",
            "Instrumentación",
            "Sistemas Embebidos",
        ],
        "doctorates": [
            "PhD in Electrical Engineering",
            "PhD in Electronic Engineering",
            "PhD in Control Systems",
            "PhD in Telecommunications",
        ],
    },
    {
        "id": 5,
        "name": "Informática, software e IA",
        "specialties": [
            "Ingeniería Informática",
            "Software",
            "Sistemas",
            "Inteligencia Artificial",
            "Datos (Data Engineering)",
            "Ciberseguridad",
            "Cloud / DevOps",
            "Computación",
        ],
        "doctorates": [
            "PhD in Computer Science",
            "PhD in Software Engineering",
            "PhD in Artificial Intelligence",
            "PhD in Data Science",
            "PhD in Cybersecurity",
        ],
    },
    {
        "id": 6,
        "name": "Química y materiales",
        "specialties": [
            "Ingeniería Química",
            "Materiales",
            "Metalúrgica",
            "Petroquímica",
            "Bioquímica",
            "Biotecnología",
        ],
        "doctorates": [
            "PhD in Chemical Engineering",
            "PhD in Materials Science",
            "PhD in Metallurgical Engineering",
            "PhD in Biotechnology",
        ],
    },
    {
        "id": 7,
        "name": "Recursos naturales y agro",
        "specialties": [
            "Ingeniería Minera",
            "Forestal",
            "Agrícola",
            "Agronómica",
            "Pesquera",
            "Recursos Hídricos",
        ],
        "doctorates": [
            "PhD in Mining Engineering",
            "PhD in Agricultural Engineering",
            "PhD in Forestry",
            "PhD in Water Resources",
        ],
    },
    {
        "id": 8,
        "name": "Mecatrónica, robótica y sistemas autónomos",
        "specialties": [
            "Ingeniería Mecatrónica",
            "Robótica",
            "Sistemas Autónomos",
            "Drones",
        ],
        "doctorates": [
            "PhD in Mechatronics",
            "PhD in Robotics",
            "PhD in Autonomous Systems",
        ],
    },
    {
        "id": 9,
        "name": "Biomédica y bioingeniería",
        "specialties": [
            "Ingeniería Biomédica",
            "Bioingeniería",
            "Ingeniería Clínica",
            "Ingeniería Genética",
        ],
        "doctorates": [
            "PhD in Biomedical Engineering",
            "PhD in Bioengineering",
            "PhD in Medical Engineering",
        ],
    },
    {
        "id": 10,
        "name": "Emergentes y deep-tech",
        "specialties": [
            "Nanotecnología",
            "Realidad Virtual / XR",
            "Blockchain",
            "Smart Cities",
            "Ingeniería Cuántica",
        ],
        "doctorates": [
            "PhD in Nanotechnology",
            "PhD in Quantum Engineering",
            "PhD in XR Systems",
            "PhD in Distributed Systems",
        ],
    },
    {
        "id": 11,
        "name": "Ingeniería económica y gestión",
        "specialties": [
            "Ingeniería en Gestión Empresarial",
            "Ingeniería Financiera",
            "Ingeniería Económica",
        ],
        "doctorates": [
            "PhD in Engineering Management",
            "PhD in Financial Engineering",
            "PhD in Systems Engineering",
        ],
    },
]

ALL_SPECIALTIES = [s for field in ENGINEERING_FIELDS for s in field["specialties"]]
ALL_DOCTORATES = [d for field in ENGINEERING_FIELDS for d in field["doctorates"]]


def get_field_by_id(field_id: int) -> dict | None:
    return next((f for f in ENGINEERING_FIELDS if f["id"] == field_id), None)


def find_field_by_keyword(keyword: str) -> list[dict]:
    kw = keyword.lower()
    return [
        f for f in ENGINEERING_FIELDS
        if kw in f["name"].lower()
        or any(kw in s.lower() for s in f["specialties"])
        or any(kw in d.lower() for d in f["doctorates"])
    ]
