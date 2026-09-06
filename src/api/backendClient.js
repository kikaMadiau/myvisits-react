// ================= CONFIG =================
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");
const TOKEN_KEY = "auth_access_token";
const DEVICE_KEY = "device_id";
const REQUEST_TIMEOUT_MS = 30000; // 30 secondes

const DEBUG = typeof window !== "undefined" && window.location.hostname === "localhost";

// ================= UTILS =================
const log = (...args) => {
  if (DEBUG) console.log(...args);
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
};

// ================= CORE REQUEST =================
const unwrapResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    let message = response.statusText;
    if (typeof payload === 'object' && payload !== null) {
      // Le message principal de l'API est prioritaire
      message = payload.message || response.statusText;
      // S'il y a des erreurs de validation, on les ajoute
      if (payload.errors && typeof payload.errors === 'object') {
        const errorDetails = Object.values(payload.errors).flat().join(' ');
        message = `${message} ${errorDetails}`;
      }
    }

    const error = new Error(message);
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload?.data ?? payload;
};

const request = async (path, options = {}) => {
  const token = getToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  console.log("DEBUG REQUEST:", { 
    API_BASE_URL, 
    path, 
    fullUrl: url,
    constructedUrl: `${API_BASE_URL}${path}`
  });
  
  log("REQUEST", { url, method: options.method || "GET", body: options.body });

  try {
    console.log("Fetch vers:", url);
    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    console.log("Fetch réponse:", { 
      status: response.status,
      statusText: response.statusText,
      originalUrl: url,
      finalUrl: response.url,
      redirected: response.redirected,
      type: response.type
    });
    
    log("RESPONSE", { status: response.status, url: response.url });

    return await unwrapResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    log("ERROR", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

// ================= HELPERS =================
const withDevice = (body = {}) => ({
  ...body,
  device_id: getDeviceId(),
});

const normalizeEmailPassword = (emailOrPayload, password) => {
  if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
    return {
      email: emailOrPayload.email || emailOrPayload.u_name || "",
      password: emailOrPayload.password || emailOrPayload.u_password || "",
    };
  }

  return { email: emailOrPayload, password };
};

const normalizeOtp = (emailOrPayload, otp) => {
  if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
    return {
      email: emailOrPayload.email || emailOrPayload.emp_email || "",
      otp: emailOrPayload.otp || emailOrPayload.otpCode || "",
    };
  }

  return { email: emailOrPayload, otp };
};

const normalizeResetPassword = (tokenOrPayload, newPassword) => {
  if (typeof tokenOrPayload === "object" && tokenOrPayload !== null) {
    return {
      resetToken: tokenOrPayload.resetToken || tokenOrPayload.reset_token || "",
      newPassword: tokenOrPayload.newPassword || tokenOrPayload.new_password || "",
    };
  }

  return { resetToken: tokenOrPayload, newPassword };
};

const saveToken = (res) => {
  const token =
    res?.access_token ||
    res?.token ||
    res?.data?.access_token ||
    res?.data?.token;

  if (token) setToken(token);
  return res;
};

// ================= API =================
export const api = {
  auth: {
    getToken,
    setToken,
    getDeviceId,

    login: (emailOrPayload, passwordArg, options = {}) => {
      const { email, password } = normalizeEmailPassword(emailOrPayload, passwordArg);

      return request("/v1/login", {
        method: "POST",
        body: withDevice({
          u_name: email,
          u_password: password,
          ...(options.forceLogin ? { force_login: true } : {}),
        }),
      }).then(saveToken);
    },

    verifyOtp: (emailOrPayload, otpArg) => {
      const { email, otp } = normalizeOtp(emailOrPayload, otpArg);

      return request("/v1/verify-otp", {
        method: "POST",
        body: withDevice({
          emp_email: email,
          otp,
        }),
      }).then(saveToken);
    },

    register: (emailOrPayload, passwordArg) => {
      const { email, password } = normalizeEmailPassword(emailOrPayload, passwordArg);

      return request("/v1/register", {
        method: "POST",
        body: withDevice({
          u_name: email,
          u_password: password,
        }),
      });
    },

    resendOtp: (email) =>
      request("/v1/resend-otp", {
        method: "POST",
        body: withDevice({ emp_email: email }), // Garder emp_email si cet endpoint est différent
      }),

    resetPasswordRequest: (email) =>
      request("/v1/password/forgot", {
        method: "POST",
        body: withDevice({ u_name: email }), // Utiliser u_name
      }),

    resetPassword: (tokenOrPayload, newPasswordArg) => {
      const { resetToken, newPassword } = normalizeResetPassword(tokenOrPayload, newPasswordArg);

      return request("/v1/password/reset", {
        method: "POST",
        body: withDevice({
          reset_token: resetToken,
          new_password: newPassword,
        }),
      });
    },

    me: () => request("/v1/me"), // Assurez-vous que c'est le bon endpoint, et non /v1/auth/me

    updateMe: (data) =>
      request("/v1/me", {
        method: "PATCH",
        body: data,
      }),

    logout: async () => {
      try {
        await request("/v1/logout", {
          method: "POST",
          body: withDevice(),
        });
      } finally {
        setToken(null);
      }
    },

    loginWithProvider: (provider, redirectTo = "/") => {
      const redirectUrl = new URL(redirectTo, window.location.origin).toString();
      window.location.href = `${API_BASE_URL}/v1/auth/${encodeURIComponent(provider)}?redirect_to=${encodeURIComponent(redirectUrl)}`;
    },
  },

  visits: {
    list: () => request(`/v1/visits?device_id=${getDeviceId()}`),
    get: (id) =>
      request(`/v1/visits/${encodeURIComponent(id)}?device_id=${getDeviceId()}`),
    create: (data) =>
      request("/v1/visits", { method: "POST", body: withDevice(data) }),
    update: (id, data) =>
      request(`/v1/visits/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: withDevice(data),
      }),
    remove: (id) => request(`/v1/visits/${encodeURIComponent(id)}?device_id=${getDeviceId()}`, { method: "DELETE" }),
  },

  dashboard: {
    get: () => request("/v1/dashboard"),
  },

  visitors: {
    get: (id) => request(`/v1/visitors/${encodeURIComponent(id)}`),
  },

  blacklist: {
    create: (data) =>
      request("/v1/blacklist", {
        method: "POST",
        body: withDevice(data),
      }),
  },

  users: {
    list: () => request("/v1/users"),
    invite: (email, role) =>
      request("/v1/users/invite", {
        method: "POST",
        body: { email, role },
      }),
  },
};
