export type UserStore = {
  id: string
  name: string
  location: string | null
}

export type UserStoresResponse = {
  stores: UserStore[]
}