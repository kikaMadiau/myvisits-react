const getFirstValue = (source, fields) => {
  for (const field of fields) {
    const value = source?.[field];
    if (value !== null && value !== undefined && value !== "") return value;
  }

  return undefined;
};

const getFirstString = (source, fields) => {
  const value = getFirstValue(source, fields);
  if (typeof value === "object") return "";
  return value === null || value === undefined ? "" : String(value).trim();
};

const userIdentityFields = [
  "id",
  "user_id",
  "u_id",
  "emp_id",
  "email",
  "u_email",
  "emp_email",
  "u_name",
  "username",
  "full_name",
  "fullName",
  "name",
  "nom_complet",
  "first_name",
  "last_name",
  "prenom",
  "nom",
  "role",
  "u_role",
  "emp_role",
];

const hasUserIdentityField = (source) =>
  Boolean(source && typeof source === "object" && userIdentityFields.some((field) => source[field]));

export const getUserProfile = (source) => {
  if (!source || typeof source !== "object") return source;

  const candidates = [
    source.user,
    source.current_user,
    source.currentUser,
    source.profile,
    source.employee,
    source.employe,
    source.data,
    source.data?.user,
    source.data?.profile,
    source.data?.employee,
    source.data?.employe,
    source,
  ];

  return candidates.find(hasUserIdentityField) || source;
};

export const getUserName = (user) => {
  const profile = getUserProfile(user);
  const fullName = getFirstString(profile, [
    "full_name",
    "fullName",
    "name",
    "nom_complet",
    "nomComplet",
    "u_full_name",
    "u_name",
    "emp_full_name",
    "emp_name",
    "emp_nom_complet",
  ]);

  if (fullName) return fullName;

  return [
    getFirstString(profile, ["first_name", "firstName", "firstname", "prenom", "u_prenom", "emp_prenom"]),
    getFirstString(profile, ["last_name", "lastName", "lastname", "nom", "u_nom", "emp_nom"]),
  ]
    .filter(Boolean)
    .join(" ");
};

export const getUserEmail = (user) =>
  getFirstString(getUserProfile(user), ["email", "u_email", "emp_email", "mail", "u_name", "username"]);

export const getUserPhone = (user) =>
  getFirstString(getUserProfile(user), [
    "phone",
    "telephone",
    "tel",
    "mobile",
    "u_phone",
    "u_tel",
    "emp_phone",
    "emp_tel",
    "phone_number",
    "phoneNumber",
  ]);

export const getUserRole = (user) =>
  getFirstString(getUserProfile(user), ["role", "u_role", "emp_role", "type", "profil", "profile_name"]) || "user";

export const getUserInitial = (user) => {
  const name = getUserName(user) || getUserEmail(user);
  return name.charAt(0).toUpperCase() || "U";
};
