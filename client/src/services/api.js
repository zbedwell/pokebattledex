const API_BASE = "/api";

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }
    searchParams.append(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
};

export const api = {
  async getDataHealth() {
    const response = await fetch(`${API_BASE}/health/data`);
    return handleResponse(response);
  },

  async getPokemon(params) {
    const response = await fetch(`${API_BASE}/pokemon${toQueryString(params)}`);
    return handleResponse(response);
  },

  async getPokemonDetail(id) {
    const response = await fetch(`${API_BASE}/pokemon/${id}`);
    return handleResponse(response);
  },

  async getPokemonEvolution(id) {
    const response = await fetch(`${API_BASE}/pokemon/${id}/evolution`);
    return handleResponse(response);
  },

  async comparePokemon(ids) {
    const response = await fetch(`${API_BASE}/pokemon/compare?ids=${ids.join(",")}`);
    return handleResponse(response);
  },

  async getPokemonOptions(params) {
    const response = await fetch(`${API_BASE}/pokemon/options${toQueryString(params)}`);
    return handleResponse(response);
  },

  async getMoves(params) {
    const response = await fetch(`${API_BASE}/moves${toQueryString(params)}`);
    return handleResponse(response);
  },

  async getMoveDetail(id) {
    const response = await fetch(`${API_BASE}/moves/${id}`);
    return handleResponse(response);
  },

  async getAbilities(params) {
    const response = await fetch(`${API_BASE}/abilities${toQueryString(params)}`);
    return handleResponse(response);
  },

  async getAbilityDetail(id) {
    const response = await fetch(`${API_BASE}/abilities/${id}`);
    return handleResponse(response);
  },

  async getTypes() {
    const response = await fetch(`${API_BASE}/types`);
    return handleResponse(response);
  },

  async getTypeChart() {
    const response = await fetch(`${API_BASE}/types/chart`);
    return handleResponse(response);
  },

  async getTypeMatchup(attacking, defending) {
    const response = await fetch(
      `${API_BASE}/types/matchup${toQueryString({ attacking, defending })}`,
    );
    return handleResponse(response);
  },

  async getTypeDefense(types) {
    const response = await fetch(`${API_BASE}/types/defense${toQueryString({ types })}`);
    return handleResponse(response);
  },

  async search(q) {
    const response = await fetch(`${API_BASE}/search${toQueryString({ q })}`);
    return handleResponse(response);
  },
};
