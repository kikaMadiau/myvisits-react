const getPathValue = (source, path) =>
  path.split(".").reduce((value, key) => {
    if (value === null || value === undefined || typeof value !== "object") return undefined;
    return value[key];
  }, source);

const normalizeKey = (key) => key.toLowerCase().replace(/[^a-z0-9]/g, "");

const findDeepValue = (source, aliases) => {
  if (!source || typeof source !== "object") return undefined;

  const normalizedAliases = aliases.map(normalizeKey);
  const stack = [source];

  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;

    for (const [key, value] of Object.entries(current)) {
      if (normalizedAliases.includes(normalizeKey(key)) && value !== null && value !== undefined && value !== "") {
        return value;
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        stack.push(value);
      }
    }
  }

  return undefined;
};

const findValueByKeyPattern = (source, pattern) => {
  if (!source || typeof source !== "object") return undefined;

  const stack = [source];

  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;

    for (const [key, value] of Object.entries(current)) {
      if (value !== null && value !== undefined && value !== "" && pattern.test(normalizeKey(key))) {
        return value;
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        stack.push(value);
      }
    }
  }

  return undefined;
};

const getFirstValue = (source, aliases) => {
  for (const alias of aliases) {
    const value = alias.includes(".") ? getPathValue(source, alias) : source?.[alias];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return findDeepValue(source, aliases);
};

const getFirstString = (source, aliases) => {
  const value = getFirstValue(source, aliases);
  return value === null || value === undefined ? "" : String(value).trim();
};

const FIRST_NAME_FIELDS = [
  "vis_prenom",
  "visPrenom",
  "visitor_prenom",
  "visitorPrenom",
  "prenom",
  "first_name",
  "firstName",
  "firstname",
  "visitor.first_name",
  "visitor.prenom",
  "visiteur.prenom",
];

const LAST_NAME_FIELDS = [
  "vis_nom",
  "visNom",
  "visitor_nom",
  "visitorNom",
  "nom",
  "last_name",
  "lastName",
  "lastname",
  "visitor.last_name",
  "visitor.nom",
  "visiteur.nom",
];

const POST_NAME_FIELDS = [
  "vis_post_nom",
  "visPostNom",
  "visitor_post_nom",
  "visitorPostNom",
  "post_nom",
  "postnom",
  "middle_name",
  "middleName",
  "visitor.post_nom",
  "visiteur.post_nom",
];

const FULL_NAME_FIELDS = [
  "client_name",
  "visitor_name",
  "visitorName",
  "full_name",
  "fullName",
  "nom_complet",
  "nomComplet",
  "vis_nom_complet",
  "visNomComplet",
  "visitor.full_name",
  "visitor.name",
  "visiteur.full_name",
  "visiteur.nom_complet",
];

const PHONE_FIELDS = [
  "vis_tel",
  "visTel",
  "vis_phone",
  "visPhone",
  "contact_phone",
  "contactPhone",
  "visitor_phone",
  "visitorPhone",
  "phone",
  "telephone",
  "tel",
  "mobile",
  "numero_telephone",
  "numeroTelephone",
  "phone_number",
  "phoneNumber",
  "visitor.phone",
  "visitor.telephone",
  "visitor.tel",
  "visiteur.phone",
  "visiteur.telephone",
  "visiteur.tel",
];

const DATE_FIELDS = [
  "visit_date",
  "visitDate",
  "vis_rdvDate",
  "visRdvDate",
  "vis_rdv_date",
  "visRdvDate",
  "vis_date_rdv",
  "rdv_date",
  "rdvDate",
  "date_rdv",
  "dateRdv",
  "appointment_date",
  "appointmentDate",
  "scheduled_at",
  "scheduledAt",
  "date_visite",
  "dateVisite",
  "vis_rdv",
  "visRdv",
  "rdv",
];

const TIME_FIELDS = [
  "visit_time",
  "visitTime",
  "time",
  "heure",
  "hour",
  "start_time",
  "startTime",
  "vis_heure",
  "visHeure",
  "vis_time",
  "visTime",
  "rdv_time",
  "rdvTime",
  "heure_rdv",
  "heureRdv",
  "appointment_time",
  "appointmentTime",
  "heure_visite",
  "heureVisite",
];

const ID_FIELDS = [
  "id",
  "vis_id",
  "visId",
  "visitor_id",
  "visitorId",
  "visiteur_id",
  "visiteurId",
];

export const getVisitorName = (visit) => {
  const fullName = [
    getFirstString(visit, FIRST_NAME_FIELDS),
    getFirstString(visit, LAST_NAME_FIELDS),
    getFirstString(visit, POST_NAME_FIELDS),
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || getFirstString(visit, FULL_NAME_FIELDS) || "Visiteur";
};

export const getVisitorPhone = (visit) => getFirstString(visit, PHONE_FIELDS);

export const getVisitorId = (visit) => getFirstString(visit, ID_FIELDS);

export const getVisitDate = (visit) => {
  const date = getFirstValue(visit, DATE_FIELDS);
  if (date) return date;

  const day = getFirstString(visit, ["date", "jour", "day"]);
  const time = getFirstString(visit, TIME_FIELDS);
  return day && time ? `${day} ${time}` : day || time;
};

export const getVisitTime = (visit) => {
  const date = getFirstValue(visit, DATE_FIELDS);
  if (date) return date;

  const explicitTime = getFirstValue(visit, TIME_FIELDS);
  if (explicitTime) return explicitTime;

  return findValueByKeyPattern(visit, /(heure|time|rdv|visit|visite)/);
};

export const getVisitSearchText = (visit) =>
  [
    getVisitorName(visit),
    getVisitorPhone(visit),
    getFirstString(visit, ["purpose", "motif", "reason", "description"]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
