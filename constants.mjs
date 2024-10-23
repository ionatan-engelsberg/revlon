// ENUMS

export const USER_VIA = {
  INSTAGRAM: "INSTAGRAM",
  FACEBOOK: "FACEBOOK",
  ONLINE_BANNER: "ONLINE_BANNER",
  GOOGLE: "GOOGLE",
  PHYSICAL_STORE: "PHYSICAL_STORE"
};

export const TICKET_STORE = {
  WALMART: "WALMART",
  DELSOL: "DELSOL",
  COPPEL: "COPPEL",
  HEB: "HEB",
  CHEDRAUI: "CHEDRAUI",
  DAX: "DAX",
  LIVERPOOL: "LIVERPOOL",
  SANBORNS: "SANBORNS",
  SEARS: "SEARS",
  SORIANA: "SORIANA",
  SUBURBIA: "SUBURBIA",
  WOOLWORTH: "WOOLWORTH",
  FRESKO: "FRESKO"
}

export const ORDER_TYPE = {
  PHYSICAL: "PHYSICAL",
  ONLINE: "ONLINE"
}

export const ALLOWED_PHYSICAL_STORES = [
  TICKET_STORE.CHEDRAUI,
  TICKET_STORE.COPPEL,
  TICKET_STORE.DELSOL,
  TICKET_STORE.DAX,
  TICKET_STORE.HEB,
  TICKET_STORE.LIVERPOOL,
  TICKET_STORE.SANBORNS,
  TICKET_STORE.SEARS,
  TICKET_STORE.SORIANA,
  TICKET_STORE.SUBURBIA,
  TICKET_STORE.WALMART,
  TICKET_STORE.WOOLWORTH,
  TICKET_STORE.FRESKO
];

export const ALLOWED_ONLINE_STORES = [
  TICKET_STORE.COPPEL,
  TICKET_STORE.DELSOL,
  TICKET_STORE.WALMART,
  TICKET_STORE.HEB,
  TICKET_STORE.WOOLWORTH
];

export const STATES = [
  "AGU",
  "BCN",
  "BCS",
  "CAM",
  "CHP",
  "CHH",
  "CMX",
  "COA",
  "COL",
  "DUR",
  "GUA",
  "GRO",
  "HID",
  "JAL",
  "MEX",
  "MIC",
  "MOR",
  "NAY",
  "NLE",
  "OAX",
  "PUE",
  "QUE",
  "ROO",
  "SLP",
  "SIN",
  "SON",
  "TAB",
  "TAM",
  "TLA",
  "VER",
  "YUC",
  "ZAC"
];

export const LOCALITIES = {
  AGU: [
    "Aguascalientes",
    "Asientos",
    "Calvillo",
  ],
  BCN: [
    "Mexicali",
    "Tijuana",
    "Ensenada",
  ],
  BCS: [
    "La Paz",
    "Los Cabos",
    "Comondú",
  ],
  CAM: [
    "Campeche",
    "Carmen",
    "Champotón",
  ],
  CHP: [
    "Tuxtla Gutiérrez",
    "San Cristóbal de las Casas",
    "Tapachula",
  ],
  CHH: [
    "Chihuahua",
    "Ciudad Juárez",
    "Delicias",
  ],
  CMX: [
    "Cuauhtémoc",
    "Iztapalapa",
    "Tlalpan",
  ],
  COA: [
    "Saltillo",
    "Torreón",
    "Monclova",
  ],
  COL: [
    "Colima",
    "Manzanillo",
    "Tecomán",
  ],
  DUR: [
    "Durango",
    "Gómez Palacio",
    "Lerdo",
  ],
  GUA: [
    "León",
    "Irapuato",
    "Celaya",
  ],
  GRO: [
    "Acapulco",
    "Chilpancingo",
    "Iguala",
  ],
  HID: [
    "Pachuca",
    "Tulancingo",
    "Tula",
  ],
  JAL: [
    "Guadalajara",
    "Zapopan",
    "Tlaquepaque",
  ],
  MEX: [
    "Ecatepec",
    "Naucalpan",
    "Toluca",
  ],
  MIC: [
    "Morelia",
    "Uruapan",
    "Zamora",
  ],
  MOR: [
    "Cuernavaca",
    "Jiutepec",
    "Temixco",
  ],
  NAY: [
    "Tepic",
    "Bahía de Banderas",
    "Compostela",
  ],
  NLE: [
    "Monterrey",
    "San Pedro Garza García",
    "Guadalupe",
  ],
  OAX: [
    "Oaxaca de Juárez",
    "Salina Cruz",
    "Juchitán",
  ],
  PUE: [
    "Puebla",
    "Tehuacán",
    "San Martín Texmelucan",
  ],
  QUE: [
    "Querétaro",
    "San Juan del Río",
    "El Marqués",
  ],
  ROO: [
    "Cancún",
    "Playa del Carmen",
    "Chetumal",
  ],
  SLP: [
    "San Luis Potosí",
    "Soledad de Graciano Sánchez",
    "Ciudad Valles",
  ],
  SIN: [
    "Culiacán",
    "Mazatlán",
    "Los Mochis",
  ],
  SON: [
    "Hermosillo",
    "Nogales",
    "Ciudad Obregón",
  ],
  TAB: [
    "Villahermosa",
    "Cárdenas",
    "Comalcalco",
  ],
  TAM: [
    "Tampico",
    "Matamoros",
    "Nuevo Laredo",
  ],
  TLA: [
    "Tlaxcala",
    "Apizaco",
    "Huamantla",
  ],
  VER: [
    "Veracruz",
    "Xalapa",
    "Coatzacoalcos",
  ],
  YUC: [
    "Mérida",
    "Progreso",
    "Valladolid",
  ],
  ZAC: [
    "Zacatecas",
    "Fresnillo",
    "Jerez",
  ],
};