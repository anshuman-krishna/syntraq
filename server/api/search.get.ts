import { searchController } from '../controllers/searchController'

export default defineEventHandler((event) => searchController.getResults(event))
