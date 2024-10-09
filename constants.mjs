// ENUMS

export const USER_VIA = {
  INSTAGRAM: "INSTAGRAM"
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
  SUBURBIA: "SUBURBIA"
}

export const ORDER_TYPE = {
  PHYSICAL: "PHYSICAL",
  ONLINE: "ONLINE"
}

export const ALLOWED_PHYSICAL_STORES = [
  TICKET_STORE.CHEDRAUI,
  TICKET_STORE.DAX,
  TICKET_STORE.HEB,
  TICKET_STORE.LIVERPOOL,
  TICKET_STORE.SANBORNS,
  TICKET_STORE.SEARS,
  TICKET_STORE.SORIANA,
  TICKET_STORE.SUBURBIA,
  TICKET_STORE.WALMART
];

export const ALLOWED_ONLINE_STORES = [
  TICKET_STORE.COPPEL,
  TICKET_STORE.DELSOL,
  TICKET_STORE.WALMART,
  TICKET_STORE.HEB
];