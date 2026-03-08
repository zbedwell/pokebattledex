import { asyncHandler } from "../utils/httpErrors.js";
import {
  validateCompareQuery,
  validateListPokemonQuery,
  validatePokemonOptionsQuery,
} from "../utils/validation.js";

export const createPokemonController = ({ pokemonService }) => ({
  listPokemon: asyncHandler(async (req, res) => {
    const query = validateListPokemonQuery(req.query);
    const data = await pokemonService.listPokemon(query);
    res.status(200).json(data);
  }),

  getPokemonDetail: asyncHandler(async (req, res) => {
    const data = await pokemonService.getPokemonDetail(req.params.id);
    res.status(200).json(data);
  }),

  getPokemonEvolution: asyncHandler(async (req, res) => {
    const data = await pokemonService.getPokemonEvolution(req.params.id);
    res.status(200).json(data);
  }),

  getPokemonMoves: asyncHandler(async (req, res) => {
    const data = await pokemonService.getPokemonMoves(req.params.id);
    res.status(200).json(data);
  }),

  getPokemonAbilities: asyncHandler(async (req, res) => {
    const data = await pokemonService.getPokemonAbilities(req.params.id);
    res.status(200).json(data);
  }),

  comparePokemon: asyncHandler(async (req, res) => {
    const query = validateCompareQuery(req.query);
    const data = await pokemonService.comparePokemon(query.ids);
    res.status(200).json(data);
  }),

  listPokemonOptions: asyncHandler(async (req, res) => {
    const query = validatePokemonOptionsQuery(req.query);
    const data = await pokemonService.listPokemonOptions(query);
    res.status(200).json(data);
  }),
});
